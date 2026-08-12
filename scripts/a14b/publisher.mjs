import { createHash, randomUUID } from "node:crypto";
import {
  chmod,
  lstat,
  link,
  mkdir,
  open,
  readFile,
  readdir,
  rmdir,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, RUN_ID_PATTERN } from "./contracts.mjs";
import { assertClosedBundle } from "./orchestrator.mjs";

const MAX_ARTIFACT_BYTES = 4 * 1024 * 1024;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const APPROVED_EVIDENCE_ROOT = path.resolve(
  scriptDirectory,
  "../../.private-data/release-evidence/a14b-production-inventory",
);
const SECRET_PATTERN =
  /(postgres(?:ql)?:\/\/|redis(?:s)?:\/\/|bearer\s+|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:password|token|secret|connectionString|storageKey|objectKey|rawKey)\b)/i;
const RAW_STORAGE_IDENTIFIER_PATTERN =
  /\b(?:attachments|brand|knowledge-pool|tickets)\/[A-Za-z0-9][A-Za-z0-9._/-]{0,1023}/;

function containsRawStorageIdentifier(value) {
  if (typeof value === "string")
    return RAW_STORAGE_IDENTIFIER_PATTERN.test(value);
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsRawStorageIdentifier);
  return Object.entries(value).some(
    ([key, child]) =>
      RAW_STORAGE_IDENTIFIER_PATTERN.test(key) ||
      containsRawStorageIdentifier(child),
  );
}

function assertArtifactContentSafe(content) {
  if (SECRET_PATTERN.test(content))
    throw new Error(
      "Evidence artifact contains forbidden secret or raw identifier material",
    );
  try {
    if (containsRawStorageIdentifier(JSON.parse(content)))
      throw new Error(
        "Evidence artifact contains forbidden secret or raw identifier material",
      );
  } catch (error) {
    if (
      error?.message ===
      "Evidence artifact contains forbidden secret or raw identifier material"
    )
      throw error;
    if (RAW_STORAGE_IDENTIFIER_PATTERN.test(content))
      throw new Error(
        "Evidence artifact contains forbidden secret or raw identifier material",
      );
  }
}

async function assertPrivatePath(root) {
  const parts = path.resolve(root).split(path.sep);
  let current = path.sep;
  for (const part of parts.slice(1)) {
    current = path.join(current, part);
    const metadata = await lstat(current);
    if (metadata.isSymbolicLink())
      throw new Error("Evidence path contains a symlink");
  }
  const metadata = await lstat(root);
  if (!metadata.isDirectory() || (metadata.mode & 0o077) !== 0)
    throw new Error("Evidence root must be private");
  if (typeof process.getuid === "function" && metadata.uid !== process.getuid())
    throw new Error("Evidence root owner mismatch");
}

async function writeFileExclusive(file, content) {
  if (Buffer.byteLength(content) > MAX_ARTIFACT_BYTES)
    throw new Error("Evidence artifact exceeds byte budget");
  assertArtifactContentSafe(content);
  const handle = await open(file, "wx", 0o600);
  try {
    await handle.writeFile(content);
    await handle.sync();
  } finally {
    await handle.close();
  }
  await chmod(file, 0o600);
}

async function writeFileAtomic(directory, name, content) {
  const temporary = path.join(
    directory,
    `.${process.pid}.${randomUUID()}.${name}.tmp`,
  );
  const final = path.join(directory, name);
  await writeFileExclusive(temporary, content);
  try {
    await link(temporary, final);
  } finally {
    await unlink(temporary).catch((error) =>
      error?.code === "ENOENT" ? undefined : Promise.reject(error),
    );
  }
  return final;
}

async function fsyncDirectory(directory) {
  const handle = await open(directory, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function cleanupOwned(directory, identity) {
  const current = await lstat(directory).catch((error) =>
    error?.code === "ENOENT" ? undefined : Promise.reject(error),
  );
  if (!current) return;
  if (
    !current.isDirectory() ||
    current.isSymbolicLink() ||
    current.dev !== identity.dev ||
    current.ino !== identity.ino
  ) {
    throw new Error("Refusing to clean evidence not owned by this run");
  }
  for (const name of await readdir(directory)) {
    const file = path.join(directory, name);
    const metadata = await lstat(file);
    if (!metadata.isFile() || metadata.isSymbolicLink())
      throw new Error("Unexpected evidence content");
    await unlink(file);
  }
  await rmdir(directory);
}

export async function publishEvidenceBundle({ evidenceRoot, runId, bundle }) {
  if (!RUN_ID_PATTERN.test(runId ?? ""))
    throw new Error("Invalid evidence runId");
  assertClosedBundle(bundle);
  if (bundle.collector.runId !== runId)
    throw new Error("Evidence runId does not match the closed bundle");
  const approved = APPROVED_EVIDENCE_ROOT;
  const root = path.resolve(evidenceRoot);
  if (root !== approved)
    throw new Error("Evidence root must be the canonical approved directory");
  await assertPrivatePath(approved);
  await assertPrivatePath(root);
  const directory = path.join(root, runId);
  let identity;
  try {
    try {
      await mkdir(directory, { mode: 0o700 });
    } catch (error) {
      if (error?.code === "EEXIST")
        throw new Error("Evidence run directory already exists");
      throw error;
    }
    await chmod(directory, 0o700);
    identity = await lstat(directory);
    const artifacts = {
      "collector.json": bundle.collector,
      "observation.json": bundle.observation,
    };
    const files = [];
    for (const [name, value] of Object.entries(artifacts)) {
      const content = canonicalJson(value);
      const persistedPath = await writeFileAtomic(directory, name, content);
      const persisted = await readFile(persistedPath);
      if (
        createHash("sha256").update(persisted).digest("hex") !==
        createHash("sha256").update(content).digest("hex")
      )
        throw new Error("Evidence read-back hash mismatch");
      files.push({
        path: name,
        sha256: createHash("sha256").update(content).digest("hex"),
      });
    }
    await fsyncDirectory(directory);
    if (bundle.observation.ready !== true) {
      await fsyncDirectory(root);
      return directory;
    }
    const ready = canonicalJson({
      schemaVersion: 1,
      runId,
      contractSha256: bundle.collector.contractSha256,
      productionGo: false,
      files,
      manifestSha256: createHash("sha256")
        .update(canonicalJson(files))
        .digest("hex"),
    });
    await writeFileAtomic(directory, "READY.json", ready);
    await fsyncDirectory(directory);
    await fsyncDirectory(root);
    const persisted = JSON.parse(
      await readFile(path.join(directory, "READY.json"), "utf8"),
    );
    if (persisted.productionGo !== false)
      throw new Error("READY must remain production NO-GO");
    return directory;
  } catch (error) {
    if (identity) await cleanupOwned(directory, identity);
    throw error;
  }
}
