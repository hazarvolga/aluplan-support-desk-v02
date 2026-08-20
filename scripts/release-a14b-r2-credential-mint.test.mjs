import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { EventEmitter } from "node:events";
import {
  chmod,
  link,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  R2_MINT_ACTIONS,
  R2_MINT_BUCKET,
  R2_MINT_SCOPE,
  R2_MINT_TTL_SECONDS,
  mintR2TemporaryCredentials,
} from "./a14b-minting/r2-credential-mint.mjs";
import {
  createR2CredentialFileMinter,
  mintR2CredentialFile,
} from "./a14b-minting/r2-credential-files.mjs";
import {
  classifyMintError,
  main,
  parseMintArguments,
  readHiddenLine,
} from "./release-a14b-r2-credential-mint.mjs";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const syntheticParent = Object.freeze({
  schemaVersion: 1,
  accountId: "a".repeat(32),
  accessKeyId: "b".repeat(32),
  secretAccessKey: "c".repeat(64),
});
const syntheticMetadata = Object.freeze({
  schemaVersion: 1,
  accountId: syntheticParent.accountId,
  accessKeyId: syntheticParent.accessKeyId,
});
const fixedNow = new Date("2026-08-20T18:00:00.000Z");

function decodeBase64Url(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

async function createPrivateHarness(metadata = syntheticMetadata) {
  const base = await mkdtemp(path.join(tmpdir(), "a14b-r2-mint-"));
  const root = path.join(base, "credentials");
  await mkdir(root, { mode: 0o700 });
  await chmod(root, 0o700);
  const parentMetadataFile = path.join(root, "parent-metadata.json");
  await writeFile(parentMetadataFile, `${JSON.stringify(metadata)}\n`, {
    mode: 0o600,
  });
  await chmod(parentMetadataFile, 0o600);
  return {
    base,
    root,
    parentMetadataFile,
    cleanup: () => rm(base, { recursive: true, force: true }),
  };
}

test("R2 mint contract is immutable and narrower than object-read-only", () => {
  assert.equal(R2_MINT_BUCKET, "aluplan-support-desk");
  assert.equal(R2_MINT_SCOPE, "object-read-only");
  assert.equal(R2_MINT_TTL_SECONDS, 900);
  assert.deepEqual(R2_MINT_ACTIONS, ["ListObjectsV2", "HeadObject"]);
  assert.equal(Object.isFrozen(R2_MINT_ACTIONS), true);
  for (const forbidden of [
    "GetObject",
    "PutObject",
    "DeleteObject",
    "DeleteObjects",
    "CopyObject",
  ]) {
    assert.equal(R2_MINT_ACTIONS.includes(forbidden), false);
  }
});

test("local mint matches Cloudflare's HS256 JWT derivation exactly", () => {
  const minted = mintR2TemporaryCredentials({
    parentCredential: syntheticParent,
    now: fixedNow,
  });
  assert.deepEqual(minted.contract, {
    provider: "cloudflare-r2",
    bucket: "aluplan-support-desk",
    endpoint: `https://${syntheticParent.accountId}.r2.cloudflarestorage.com`,
    region: "auto",
    scope: "object-read-only",
    actions: ["ListObjectsV2", "HeadObject"],
    issuedAt: "2026-08-20T18:00:00.000Z",
    expiresAt: "2026-08-20T18:15:00.000Z",
    ttlSeconds: 900,
    productionAccessPerformed: false,
  });
  assert.equal(minted.credentials.accessKeyId, syntheticParent.accessKeyId);

  const session = Buffer.from(
    minted.credentials.sessionToken,
    "base64",
  ).toString("utf8");
  assert.match(session, /^jwt\//);
  const jwt = session.slice(4);
  const [encodedHeader, encodedPayload, signature] = jwt.split(".");
  assert.deepEqual(decodeBase64Url(encodedHeader), {
    alg: "HS256",
    typ: "JWT",
  });
  assert.deepEqual(decodeBase64Url(encodedPayload), {
    bucket: "aluplan-support-desk",
    scope: "object-read-only",
    actions: ["ListObjectsV2", "HeadObject"],
    sub: syntheticParent.accountId,
    iss: syntheticParent.accessKeyId,
    aud: `${syntheticParent.accountId}.r2.cloudflarestorage.com`,
    iat: 1787248800,
    exp: 1787249700,
  });
  const expectedSignature = createHmac(
    "sha256",
    syntheticParent.secretAccessKey,
  )
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  assert.equal(signature, expectedSignature);
  assert.equal(
    minted.credentials.secretAccessKey,
    createHash("sha256").update(jwt).digest("hex"),
  );
});

test("parent credential and clock validation fail closed", () => {
  for (const parentCredential of [
    null,
    {},
    { ...syntheticParent, accountId: "short" },
    { ...syntheticParent, accessKeyId: "short" },
    { ...syntheticParent, secretAccessKey: "short" },
    { ...syntheticParent, bucket: "other-bucket" },
    { ...syntheticParent, token: "unexpected" },
  ]) {
    assert.throws(
      () => mintR2TemporaryCredentials({ parentCredential, now: fixedNow }),
      /parent credential|field|format/i,
    );
  }
  assert.throws(
    () =>
      mintR2TemporaryCredentials({
        parentCredential: syntheticParent,
        now: new Date("invalid"),
      }),
    /clock|date/i,
  );
});

test("private file mint writes mode-0600 output and a redacted receipt", async (t) => {
  const harness = await createPrivateHarness();
  t.after(harness.cleanup);
  const result = await mintR2CredentialFile({
    approvedPrivateRoot: harness.base,
    credentialRoot: harness.root,
    parentMetadataFile: harness.parentMetadataFile,
    parentSecretAccessKey: syntheticParent.secretAccessKey,
    runId: "r2-observation-20260820",
    now: fixedNow,
  });
  const output = JSON.parse(await readFile(result.credentialFile, "utf8"));
  assert.equal((await stat(result.credentialFile)).mode & 0o777, 0o600);
  assert.deepEqual(output.contract.actions, ["ListObjectsV2", "HeadObject"]);
  assert.match(output.credentials.secretAccessKey, /^[0-9a-f]{64}$/);
  assert.match(output.credentials.sessionToken, /^[A-Za-z0-9+/]+=*$/);
  assert.deepEqual(result.receipt, {
    status: "created",
    credentialFile: "child-r2-observation-20260820.json",
    bucket: "aluplan-support-desk",
    actions: ["ListObjectsV2", "HeadObject"],
    issuedAt: "2026-08-20T18:00:00.000Z",
    expiresAt: "2026-08-20T18:15:00.000Z",
    productionAccessPerformed: false,
  });
  const serializedReceipt = JSON.stringify(result.receipt);
  for (const secret of [
    syntheticParent.accessKeyId,
    syntheticParent.secretAccessKey,
    output.credentials.secretAccessKey,
    output.credentials.sessionToken,
  ]) {
    assert.equal(serializedReceipt.includes(secret), false);
  }
});

test("metadata rejects secrets and unknown fields before child creation", async (t) => {
  const metadataCases = [
    {
      ...syntheticMetadata,
      secretAccessKey: syntheticParent.secretAccessKey,
    },
    { ...syntheticMetadata, unexpected: "field" },
  ];
  for (const metadata of metadataCases) {
    const harness = await createPrivateHarness(metadata);
    t.after(harness.cleanup);
    await assert.rejects(
      mintR2CredentialFile({
        approvedPrivateRoot: harness.base,
        credentialRoot: harness.root,
        parentMetadataFile: harness.parentMetadataFile,
        parentSecretAccessKey: syntheticParent.secretAccessKey,
        runId: "metadata-reject",
        now: fixedNow,
      }),
      /metadata.*field|secret/i,
    );
    assert.deepEqual(await readdir(harness.root), ["parent-metadata.json"]);
  }
});

test("post-write I/O failure removes every bearer temp and final file", async (t) => {
  const harness = await createPrivateHarness();
  t.after(harness.cleanup);
  const failingMint = createR2CredentialFileMinter({
    link,
    lstat,
    unlink,
    async open(...args) {
      const handle = await open(...args);
      if (!String(args[0]).endsWith(".tmp")) return handle;
      return {
        stat: (...handleArgs) => handle.stat(...handleArgs),
        writeFile: (...handleArgs) => handle.writeFile(...handleArgs),
        chmod: (...handleArgs) => handle.chmod(...handleArgs),
        async sync() {
          throw new Error("synthetic post-write sync failure");
        },
        close: (...handleArgs) => handle.close(...handleArgs),
      };
    },
  });
  await assert.rejects(
    failingMint({
      approvedPrivateRoot: harness.base,
      credentialRoot: harness.root,
      parentMetadataFile: harness.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "io-failure",
      now: fixedNow,
    }),
    /synthetic post-write sync failure/i,
  );
  assert.deepEqual(await readdir(harness.root), ["parent-metadata.json"]);
});

test("file minter rejects malformed boundaries and cleans a generic publish failure", async (t) => {
  assert.throws(
    () => createR2CredentialFileMinter({ unexpected() {} }),
    /unknown file operation/i,
  );
  assert.throws(
    () => createR2CredentialFileMinter({ open: undefined }),
    /invalid file operation/i,
  );

  const malformed = await createPrivateHarness();
  t.after(malformed.cleanup);
  await writeFile(malformed.parentMetadataFile, "not-json\n", { mode: 0o600 });
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: malformed.base,
      credentialRoot: malformed.root,
      parentMetadataFile: malformed.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "invalid-json",
      now: fixedNow,
    }),
    /invalid JSON/i,
  );

  const misplaced = await createPrivateHarness();
  t.after(misplaced.cleanup);
  const outsideMetadata = path.join(misplaced.base, "outside.json");
  await writeFile(outsideMetadata, `${JSON.stringify(syntheticMetadata)}\n`, {
    mode: 0o600,
  });
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: misplaced.base,
      credentialRoot: misplaced.root,
      parentMetadataFile: outsideMetadata,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "outside-metadata",
      now: fixedNow,
    }),
    /directly inside/i,
  );
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: misplaced.root,
      credentialRoot: misplaced.root,
      parentMetadataFile: misplaced.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "same-root",
      now: fixedNow,
    }),
    /below the approved private root/i,
  );

  const publishFailure = await createPrivateHarness();
  t.after(publishFailure.cleanup);
  const failingLinkMint = createR2CredentialFileMinter({
    async link() {
      throw new Error("synthetic link failure");
    },
  });
  await assert.rejects(
    failingLinkMint({
      approvedPrivateRoot: publishFailure.base,
      credentialRoot: publishFailure.root,
      parentMetadataFile: publishFailure.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "link-failure",
      now: fixedNow,
    }),
    /synthetic link failure/i,
  );
  assert.deepEqual(await readdir(publishFailure.root), [
    "parent-metadata.json",
  ]);
});

test("post-publish verification failure removes both bearer paths", async (t) => {
  const harness = await createPrivateHarness();
  t.after(harness.cleanup);
  let failedFinalVerification = false;
  const failingVerificationMint = createR2CredentialFileMinter({
    async lstat(file) {
      if (
        path.basename(String(file)).startsWith("child-") &&
        !failedFinalVerification
      ) {
        failedFinalVerification = true;
        throw new Error("synthetic final verification failure");
      }
      return await lstat(file);
    },
  });
  await assert.rejects(
    failingVerificationMint({
      approvedPrivateRoot: harness.base,
      credentialRoot: harness.root,
      parentMetadataFile: harness.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "post-publish-failure",
      now: fixedNow,
    }),
    /synthetic final verification failure/i,
  );
  assert.equal(failedFinalVerification, true);
  assert.deepEqual(await readdir(harness.root), ["parent-metadata.json"]);
});

test("file mint rejects traversal, broad modes, symlinks and clobbering", async (t) => {
  const harness = await createPrivateHarness();
  t.after(harness.cleanup);
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: harness.base,
      credentialRoot: harness.root,
      parentMetadataFile: harness.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "../escape",
      now: fixedNow,
    }),
    /runId/i,
  );
  await chmod(harness.parentMetadataFile, 0o644);
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: harness.base,
      credentialRoot: harness.root,
      parentMetadataFile: harness.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "broad-parent",
      now: fixedNow,
    }),
    /0600|private/i,
  );
  await chmod(harness.parentMetadataFile, 0o600);
  const linked = path.join(harness.root, "linked-parent.json");
  await symlink(harness.parentMetadataFile, linked);
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: harness.base,
      credentialRoot: harness.root,
      parentMetadataFile: linked,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "linked-parent",
      now: fixedNow,
    }),
    /symlink/i,
  );
  await mintR2CredentialFile({
    approvedPrivateRoot: harness.base,
    credentialRoot: harness.root,
    parentMetadataFile: harness.parentMetadataFile,
    parentSecretAccessKey: syntheticParent.secretAccessKey,
    runId: "no-clobber",
    now: fixedNow,
  });
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: harness.base,
      credentialRoot: harness.root,
      parentMetadataFile: harness.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "no-clobber",
      now: fixedNow,
    }),
    /exists|clobber/i,
  );
  assert.equal(
    (await readdir(harness.root)).some((name) => name.endsWith(".tmp")),
    false,
  );
  await chmod(harness.root, 0o755);
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: harness.base,
      credentialRoot: harness.root,
      parentMetadataFile: harness.parentMetadataFile,
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "broad-root",
      now: fixedNow,
    }),
    /private director/i,
  );
  await chmod(harness.root, 0o700);
  const linkedRoot = path.join(harness.base, "linked-root");
  await symlink(harness.root, linkedRoot);
  await assert.rejects(
    mintR2CredentialFile({
      approvedPrivateRoot: harness.base,
      credentialRoot: linkedRoot,
      parentMetadataFile: path.join(linkedRoot, "parent-metadata.json"),
      parentSecretAccessKey: syntheticParent.secretAccessKey,
      runId: "linked-root",
      now: fixedNow,
    }),
    /symlink/i,
  );
});

test("production mint modules contain no network or subprocess surface", async () => {
  const files = new Map([
    [
      path.join(scriptsDirectory, "a14b-minting/r2-credential-mint.mjs"),
      new Set(["node:crypto", "../a14b/contracts.mjs"]),
    ],
    [
      path.join(scriptsDirectory, "a14b-minting/r2-credential-files.mjs"),
      new Set([
        "node:crypto",
        "node:fs",
        "node:fs/promises",
        "node:path",
        "../a14b/contracts.mjs",
        "./r2-credential-mint.mjs",
      ]),
    ],
    [
      path.join(scriptsDirectory, "release-a14b-r2-credential-mint.mjs"),
      new Set([
        "node:path",
        "node:url",
        "./a14b/contracts.mjs",
        "./a14b-minting/r2-credential-files.mjs",
      ]),
    ],
  ]);
  const forbidden =
    /\bfetch\s*\(|\bimport\s*\(|\bcreateRequire\b|node:(?:http|https|net|tls|dgram|dns|child_process)|from\s+["'](?:@aws-sdk|cloudflare|aws4fetch|jose)[/"']|\bexec(?:File)?\s*\(|\bspawn\s*\(|process\.env/;
  const importPattern = /(?:from\s+|import\s*)["']([^"']+)["']/g;
  for (const [file, allowedImports] of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, forbidden, path.basename(file));
    const imports = [...source.matchAll(importPattern)].map(
      (match) => match[1],
    );
    assert.deepEqual(
      new Set(imports),
      allowedImports,
      `${path.basename(file)} import allowlist drift`,
    );
  }
});

test("CLI accepts no policy or secret override arguments", () => {
  assert.deepEqual(parseMintArguments(["--mint", "--run-id", "safe-run"]), {
    help: false,
    runId: "safe-run",
  });
  for (const flag of [
    "--secret",
    "--bucket",
    "--actions",
    "--ttl",
    "--endpoint",
  ]) {
    assert.throws(
      () => parseMintArguments(["--mint", "--run-id", "safe-run", flag, "x"]),
      /expected only/i,
    );
  }
});

test("CLI reads the parent secret only from a hidden interactive TTY", async () => {
  class FakeInput extends EventEmitter {
    isTTY = true;
    rawModes = [];
    setRawMode(value) {
      this.rawModes.push(value);
    }
    resume() {}
    pause() {}
  }
  const input = new FakeInput();
  const output = {
    isTTY: true,
    content: "",
    write(value) {
      this.content += value;
    },
  };
  const secret = syntheticParent.secretAccessKey;
  const pending = readHiddenLine({ input, output });
  input.emit("data", Buffer.from(`${secret}\r`));
  assert.equal(await pending, secret);
  assert.deepEqual(input.rawModes, [true, false]);
  assert.equal(output.content.includes(secret), false);
  assert.match(output.content, /input hidden/i);
  await assert.rejects(
    readHiddenLine({
      input: { isTTY: false },
      output: { isTTY: true },
    }),
    /interactive TTY/i,
  );
});

test("CLI hidden input handles editing and cancellation without echoing", async () => {
  class FakeInput extends EventEmitter {
    isTTY = true;
    setRawMode() {}
    resume() {}
    pause() {}
  }
  const output = {
    isTTY: true,
    content: "",
    write(value) {
      this.content += value;
    },
  };
  const editedInput = new FakeInput();
  const edited = readHiddenLine({ input: editedInput, output });
  editedInput.emit("data", Buffer.from("abx\x7fc\r"));
  assert.equal(await edited, "abc");
  assert.equal(output.content.includes("abx"), false);

  const cancelledInput = new FakeInput();
  const cancelled = readHiddenLine({ input: cancelledInput, output });
  cancelledInput.emit("data", Buffer.from([3]));
  await assert.rejects(cancelled, /cancelled/i);

  const invalidInput = new FakeInput();
  const invalid = readHiddenLine({ input: invalidInput, output });
  invalidInput.emit("data", Buffer.from([0]));
  await assert.rejects(invalid, /format/i);
});

test("CLI restores TTY state and settles on stream EOF, close and error", async () => {
  class FakeInput extends EventEmitter {
    isTTY = true;
    isRaw = false;
    rawModes = [];
    setRawMode(value) {
      this.isRaw = value;
      this.rawModes.push(value);
    }
    resume() {}
    pause() {}
  }
  const output = {
    isTTY: true,
    write() {},
  };
  for (const event of ["end", "close", "error"]) {
    const input = new FakeInput();
    const pending = readHiddenLine({ input, output }).then(
      () => "resolved",
      () => "rejected",
    );
    if (event === "error")
      input.emit(event, new Error("synthetic stream error"));
    else input.emit(event);
    const result = await Promise.race([
      pending,
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 50)),
    ]);
    assert.equal(result, "rejected", event);
    assert.deepEqual(input.rawModes, [true, false], event);
  }
});

test("CLI help is safe and performs no mint", async (t) => {
  let output = "";
  t.mock.method(process.stdout, "write", (value) => {
    output += value;
    return true;
  });
  await main(["--help"]);
  assert.match(output, /No Cloudflare or production request is performed/i);
  assert.match(
    output,
    /\.private-data\/release-credentials\/a14b-r2\/parent-metadata\.json/,
  );
  assert.match(output, /schemaVersion.*accountId.*accessKeyId/s);
  assert.doesNotMatch(output, /AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN/);
  assert.equal(
    classifyMintError(
      new Error("Parent secret entry requires an interactive TTY"),
    ),
    "TTY_REQUIRED",
  );
  assert.equal(
    classifyMintError(new Error("Child credential already exists")),
    "OUTPUT_EXISTS",
  );
  assert.equal(
    classifyMintError(new Error("Parent metadata file is invalid")),
    "CREDENTIAL_INPUT_NOT_READY",
  );
  assert.equal(classifyMintError(new Error("unknown")), "MINT_FAILED");
});

test("package scripts expose the mint tool and lock its test into ops safety", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(scriptsDirectory, "../package.json"), "utf8"),
  );
  assert.equal(
    packageJson.scripts["release:a14b:mint-r2-credential"],
    "node scripts/release-a14b-r2-credential-mint.mjs",
  );
  assert.match(
    packageJson.scripts["test:ops-safety"],
    /release-a14b-r2-credential-mint\.test\.mjs/,
  );
  const collector = await readFile(
    path.join(scriptsDirectory, "release-a14b-inventory-collector.mjs"),
    "utf8",
  );
  assert.doesNotMatch(collector, /a14b-minting|r2-credential-mint/);
});
