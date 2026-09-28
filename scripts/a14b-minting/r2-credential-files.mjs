import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import {
  link as fsLink,
  lstat as fsLstat,
  open as fsOpen,
  unlink as fsUnlink,
} from "node:fs/promises";
import path from "node:path";
import { canonicalJson, RUN_ID_PATTERN } from "../a14b/contracts.mjs";
import {
  assertParentMetadata,
  mintR2TemporaryCredentials,
} from "./r2-credential-mint.mjs";

const MAX_PARENT_BYTES = 4096;
const MAX_CHILD_BYTES = 16 * 1024;
const FILE_OPERATION_KEYS = Object.freeze(["link", "lstat", "open", "unlink"]);
const DEFAULT_FILE_OPERATIONS = Object.freeze({
  link: fsLink,
  lstat: fsLstat,
  open: fsOpen,
  unlink: fsUnlink,
});

function assertOwned(metadata, label) {
  if (
    typeof process.getuid === "function" &&
    metadata.uid !== process.getuid()
  ) {
    throw new Error(`${label} owner mismatch`);
  }
}

async function assertPrivateRoot({ approvedPrivateRoot, credentialRoot, io }) {
  const approved = path.resolve(approvedPrivateRoot);
  const root = path.resolve(credentialRoot);
  const relative = path.relative(approved, root);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Credential root must be below the approved private root");
  }
  const components = [approved];
  let current = approved;
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part);
    components.push(current);
  }
  for (const component of components) {
    const metadata = await io.lstat(component);
    if (metadata.isSymbolicLink())
      throw new Error("Credential path must not contain a symlink");
    if (!metadata.isDirectory() || (metadata.mode & 0o077) !== 0)
      throw new Error("Credential path must use private directories");
    assertOwned(metadata, "Credential directory");
  }
  return { root, identity: await io.lstat(root) };
}

async function readPrivateMetadata({ credentialRoot, parentMetadataFile, io }) {
  const root = path.resolve(credentialRoot);
  const file = path.resolve(parentMetadataFile);
  if (path.dirname(file) !== root)
    throw new Error("Parent metadata file must be directly inside the root");
  const pathMetadata = await io.lstat(file);
  if (pathMetadata.isSymbolicLink())
    throw new Error("Parent metadata file must not be a symlink");
  if (!pathMetadata.isFile() || (pathMetadata.mode & 0o777) !== 0o600)
    throw new Error("Parent metadata file must be a private mode-0600 file");
  assertOwned(pathMetadata, "Parent metadata file");
  if (pathMetadata.size === 0 || pathMetadata.size > MAX_PARENT_BYTES)
    throw new Error("Parent metadata file size is invalid");
  const handle = await io.open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const descriptorMetadata = await handle.stat();
    if (
      descriptorMetadata.dev !== pathMetadata.dev ||
      descriptorMetadata.ino !== pathMetadata.ino
    ) {
      throw new Error("Parent metadata file changed during validation");
    }
    const content = await handle.readFile();
    if (content.byteLength === 0 || content.byteLength > MAX_PARENT_BYTES)
      throw new Error("Parent metadata file size is invalid");
    try {
      return JSON.parse(content.toString("utf8"));
    } catch {
      throw new Error("Parent metadata file contains invalid JSON");
    }
  } finally {
    await handle.close();
  }
}

async function fsyncDirectory(directory, io) {
  const handle = await io.open(directory, constants.O_RDONLY);
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function unlinkOwned(file, identity, io) {
  const metadata = await io
    .lstat(file)
    .catch((error) =>
      error?.code === "ENOENT" ? undefined : Promise.reject(error),
    );
  if (!metadata) return;
  if (
    !metadata.isFile() ||
    metadata.isSymbolicLink() ||
    metadata.dev !== identity.dev ||
    metadata.ino !== identity.ino
  ) {
    throw new Error("Refusing to clean a temporary file not owned by this run");
  }
  await io.unlink(file);
}

async function assertRootUnchanged(root, identity, io) {
  const current = await io.lstat(root);
  if (
    !current.isDirectory() ||
    current.isSymbolicLink() ||
    current.dev !== identity.dev ||
    current.ino !== identity.ino
  ) {
    throw new Error("Credential root changed during publication");
  }
}

async function publishCredential({
  credentialRoot,
  rootIdentity,
  runId,
  value,
  io,
}) {
  const root = path.resolve(credentialRoot);
  const finalName = `child-${runId}.json`;
  const finalFile = path.join(root, finalName);
  const temporaryFile = path.join(
    root,
    `.${process.pid}.${randomUUID()}.${finalName}.tmp`,
  );
  const content = canonicalJson(value);
  if (Buffer.byteLength(content) > MAX_CHILD_BYTES)
    throw new Error("Child credential exceeds its byte budget");
  let identity;
  let published = false;
  let handle;
  try {
    handle = await io.open(
      temporaryFile,
      constants.O_CREAT |
        constants.O_EXCL |
        constants.O_WRONLY |
        constants.O_NOFOLLOW,
      0o600,
    );
    identity = await handle.stat();
    await handle.chmod(0o600);
    await handle.writeFile(content);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await assertRootUnchanged(root, rootIdentity, io);
    try {
      await io.link(temporaryFile, finalFile);
      published = true;
    } catch (error) {
      if (error?.code === "EEXIST")
        throw new Error("Child credential already exists; refusing to clobber");
      throw error;
    }
    const finalMetadata = await io.lstat(finalFile);
    if (
      !finalMetadata.isFile() ||
      finalMetadata.isSymbolicLink() ||
      (finalMetadata.mode & 0o777) !== 0o600 ||
      finalMetadata.dev !== identity.dev ||
      finalMetadata.ino !== identity.ino
    ) {
      throw new Error("Published child credential is not a private file");
    }
    assertOwned(finalMetadata, "Published child credential");
    await unlinkOwned(temporaryFile, identity, io);
    await assertRootUnchanged(root, rootIdentity, io);
    await fsyncDirectory(root, io);
    return { finalFile, finalName };
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined);
    if (published && identity) await unlinkOwned(finalFile, identity, io);
    if (identity) await unlinkOwned(temporaryFile, identity, io);
    throw error;
  }
}

export function createR2CredentialFileMinter(fileOperations = {}) {
  const keys = Object.keys(fileOperations);
  if (keys.some((key) => !FILE_OPERATION_KEYS.includes(key))) {
    throw new Error("Unknown file operation override");
  }
  const io = Object.freeze({ ...DEFAULT_FILE_OPERATIONS, ...fileOperations });
  for (const key of FILE_OPERATION_KEYS) {
    if (typeof io[key] !== "function")
      throw new Error("Invalid file operation");
  }
  return async function mintCredentialFile({
    approvedPrivateRoot,
    credentialRoot,
    parentMetadataFile,
    parentSecretAccessKey,
    runId,
    now,
  }) {
    if (!RUN_ID_PATTERN.test(runId ?? "")) throw new Error("Invalid runId");
    const { root, identity: rootIdentity } = await assertPrivateRoot({
      approvedPrivateRoot,
      credentialRoot,
      io,
    });
    const parentMetadata = assertParentMetadata(
      await readPrivateMetadata({
        credentialRoot: root,
        parentMetadataFile,
        io,
      }),
    );
    const minted = mintR2TemporaryCredentials({
      parentCredential: {
        schemaVersion: parentMetadata.schemaVersion,
        accountId: parentMetadata.accountId,
        accessKeyId: parentMetadata.accessKeyId,
        secretAccessKey: parentSecretAccessKey,
      },
      now,
    });
    const { finalFile, finalName } = await publishCredential({
      credentialRoot: root,
      rootIdentity,
      runId,
      value: minted,
      io,
    });
    return {
      credentialFile: finalFile,
      receipt: {
        status: "created",
        credentialFile: finalName,
        bucket: minted.contract.bucket,
        actions: [...minted.contract.actions],
        issuedAt: minted.contract.issuedAt,
        expiresAt: minted.contract.expiresAt,
        productionAccessPerformed: false,
      },
    };
  };
}

export const mintR2CredentialFile = createR2CredentialFileMinter();
