import { createHash, createHmac } from "node:crypto";
import { deepFreeze } from "../a14b/contracts.mjs";

export const R2_MINT_BUCKET = "aluplan-support-desk";
export const R2_MINT_SCOPE = "object-read-only";
export const R2_MINT_TTL_SECONDS = 15 * 60;
export const R2_MINT_ACTIONS = Object.freeze(["ListObjectsV2", "HeadObject"]);

const PARENT_METADATA_KEYS = Object.freeze([
  "schemaVersion",
  "accountId",
  "accessKeyId",
]);
const PARENT_KEYS = Object.freeze([...PARENT_METADATA_KEYS, "secretAccessKey"]);
const HEX_32 = /^[0-9a-f]{32}$/;
const HEX_64 = /^[0-9a-f]{64}$/;

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function assertExactKeys(value, expectedKeys, label) {
  const keys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    keys.length !== expected.length ||
    keys.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} contains an unknown or missing field`);
  }
}

function assertParentIdentity(parent, label) {
  if (parent.schemaVersion !== 1) {
    throw new Error(`${label} schema format is invalid`);
  }
  if (!HEX_32.test(parent.accountId ?? "")) {
    throw new Error(`${label} account ID format is invalid`);
  }
  if (!HEX_32.test(parent.accessKeyId ?? "")) {
    throw new Error(`${label} access key ID format is invalid`);
  }
}

export function assertParentMetadata(parentMetadata) {
  if (
    !parentMetadata ||
    typeof parentMetadata !== "object" ||
    Array.isArray(parentMetadata)
  ) {
    throw new Error("Parent metadata must be an object");
  }
  assertExactKeys(parentMetadata, PARENT_METADATA_KEYS, "Parent metadata");
  assertParentIdentity(parentMetadata, "Parent metadata");
  return parentMetadata;
}

export function assertParentCredential(parentCredential) {
  if (
    !parentCredential ||
    typeof parentCredential !== "object" ||
    Array.isArray(parentCredential)
  ) {
    throw new Error("Parent credential must be an object");
  }
  assertExactKeys(parentCredential, PARENT_KEYS, "Parent credential");
  assertParentIdentity(parentCredential, "Parent credential");
  if (!HEX_64.test(parentCredential.secretAccessKey ?? "")) {
    throw new Error("Parent credential secret access key format is invalid");
  }
  return parentCredential;
}

function assertClock(now) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("Mint clock must be a valid Date");
  }
}

export function mintR2TemporaryCredentials({ parentCredential, now }) {
  const parent = assertParentCredential(parentCredential);
  assertClock(now);
  const issuedAtSeconds = Math.floor(now.getTime() / 1000);
  const expiresAtSeconds = issuedAtSeconds + R2_MINT_TTL_SECONDS;
  const audience = `${parent.accountId}.r2.cloudflarestorage.com`;
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    bucket: R2_MINT_BUCKET,
    scope: R2_MINT_SCOPE,
    actions: [...R2_MINT_ACTIONS],
    sub: parent.accountId,
    iss: parent.accessKeyId,
    aud: audience,
    iat: issuedAtSeconds,
    exp: expiresAtSeconds,
  };
  const unsignedJwt = `${encodeJson(header)}.${encodeJson(payload)}`;
  const signature = createHmac("sha256", parent.secretAccessKey)
    .update(unsignedJwt)
    .digest("base64url");
  const jwt = `${unsignedJwt}.${signature}`;
  const result = {
    contract: {
      provider: "cloudflare-r2",
      bucket: R2_MINT_BUCKET,
      endpoint: `https://${audience}`,
      region: "auto",
      scope: R2_MINT_SCOPE,
      actions: [...R2_MINT_ACTIONS],
      issuedAt: new Date(issuedAtSeconds * 1000).toISOString(),
      expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
      ttlSeconds: R2_MINT_TTL_SECONDS,
      productionAccessPerformed: false,
    },
    credentials: {
      accessKeyId: parent.accessKeyId,
      secretAccessKey: createHash("sha256").update(jwt).digest("hex"),
      sessionToken: Buffer.from(`jwt/${jwt}`).toString("base64"),
    },
  };
  return deepFreeze(result);
}
