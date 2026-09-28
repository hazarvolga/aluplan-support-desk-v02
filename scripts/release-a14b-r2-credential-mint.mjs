#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson } from "./a14b/contracts.mjs";
import { mintR2CredentialFile } from "./a14b-minting/r2-credential-files.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const APPROVED_PRIVATE_ROOT = path.join(projectRoot, ".private-data");
export const APPROVED_R2_CREDENTIAL_ROOT = path.join(
  projectRoot,
  ".private-data/release-credentials/a14b-r2",
);
const APPROVED_PARENT_METADATA_FILE = path.join(
  APPROVED_R2_CREDENTIAL_ROOT,
  "parent-metadata.json",
);

function usage() {
  return [
    "Offline Cloudflare R2 temporary credential mint",
    "",
    "Usage:",
    "  node scripts/release-a14b-r2-credential-mint.mjs --mint --run-id <id>",
    "",
    "The bucket, actions and 900-second TTL are fixed by the release contract.",
    "Prepare this Git-ignored metadata file first:",
    "  .private-data/release-credentials/a14b-r2/parent-metadata.json",
    '  {"schemaVersion":1,"accountId":"<32-lowercase-hex>","accessKeyId":"<32-lowercase-hex>"}',
    "The parent secret must not be stored in that file; it is read from a hidden TTY.",
    "No Cloudflare or production request is performed.",
  ].join("\n");
}

export function classifyMintError(error) {
  const message = error instanceof Error ? error.message : "";
  if (/interactive TTY|secret entry/i.test(message)) return "TTY_REQUIRED";
  if (/already exists|clobber/i.test(message)) return "OUTPUT_EXISTS";
  if (
    /metadata|private root|credential root|private director|ENOENT/i.test(
      message,
    )
  ) {
    return "CREDENTIAL_INPUT_NOT_READY";
  }
  return "MINT_FAILED";
}

export function parseMintArguments(args) {
  if (args.length === 1 && args[0] === "--help") return { help: true };
  if (args.length !== 3 || args[0] !== "--mint" || args[1] !== "--run-id") {
    throw new Error("Expected only --mint --run-id <id>");
  }
  return { help: false, runId: args[2] };
}

export async function readHiddenLine({
  input = process.stdin,
  output = process.stderr,
} = {}) {
  if (
    !input.isTTY ||
    typeof input.setRawMode !== "function" ||
    typeof input.on !== "function" ||
    typeof input.off !== "function" ||
    !output.isTTY
  ) {
    throw new Error("Parent secret entry requires an interactive TTY");
  }
  output.write("Parent R2 secret access key (input hidden): ");
  return await new Promise((resolve, reject) => {
    let value = "";
    let settled = false;
    const previousRawMode = Boolean(input.isRaw);
    const restore = () => {
      input.off("data", onData);
      input.off("error", onError);
      input.off("end", onEnd);
      input.off("close", onClose);
      let restoreError;
      try {
        input.setRawMode(previousRawMode);
      } catch {
        restoreError = new Error(
          "Parent secret TTY state could not be restored",
        );
      }
      try {
        input.pause();
      } catch {
        restoreError ??= new Error(
          "Parent secret TTY state could not be restored",
        );
      }
      try {
        output.write("\n");
      } catch {
        restoreError ??= new Error(
          "Parent secret TTY state could not be restored",
        );
      }
      return restoreError;
    };
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      const restoreError = restore();
      if (error || restoreError) reject(error ?? restoreError);
      else resolve(result);
    };
    const onData = (chunk) => {
      for (const byte of Buffer.from(chunk)) {
        if (byte === 3) {
          finish(new Error("Parent secret entry cancelled"));
          return;
        }
        if (byte === 10 || byte === 13) {
          finish(undefined, value);
          return;
        }
        if (byte === 8 || byte === 127) {
          value = value.slice(0, -1);
          continue;
        }
        if (byte < 32 || byte > 126 || value.length >= 128) {
          finish(new Error("Parent secret entry format is invalid"));
          return;
        }
        value += String.fromCharCode(byte);
      }
    };
    const onError = () =>
      finish(new Error("Parent secret input stream failed"));
    const onEnd = () => finish(new Error("Parent secret input stream ended"));
    const onClose = () =>
      finish(new Error("Parent secret input stream closed"));
    input.on("data", onData);
    input.on("error", onError);
    input.on("end", onEnd);
    input.on("close", onClose);
    try {
      input.setRawMode(true);
      input.resume();
    } catch {
      finish(new Error("Parent secret TTY could not be initialized"));
    }
  });
}

export async function main(args = process.argv.slice(2)) {
  const parsed = parseMintArguments(args);
  if (parsed.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  process.umask(0o077);
  const parentSecretAccessKey = await readHiddenLine();
  const result = await mintR2CredentialFile({
    approvedPrivateRoot: APPROVED_PRIVATE_ROOT,
    credentialRoot: APPROVED_R2_CREDENTIAL_ROOT,
    parentMetadataFile: APPROVED_PARENT_METADATA_FILE,
    parentSecretAccessKey,
    runId: parsed.runId,
    now: new Date(),
  });
  process.stdout.write(canonicalJson(result.receipt));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    const code = classifyMintError(error);
    process.stderr.write(
      `[${code}] R2 offline credential mint failed; run --help. No credential value was printed.\n`,
    );
    process.exitCode = 1;
  });
}
