import {
  assertCanonicalTimestamp,
  deepFreeze,
  digestValue,
} from "./contracts.mjs";

const OPERATIONS = new Set(["ListObjectsV2", "HeadObject"]);
const issuedSnapshots = new WeakSet();

export function assertIssuedR2Snapshot(snapshot) {
  if (!issuedSnapshots.has(snapshot))
    throw new Error("R2 snapshot was not issued by the reviewed adapter");
  return snapshot;
}

export function assertR2OperationAllowed(operation) {
  if (!OPERATIONS.has(operation))
    throw new Error("Operation is outside the R2 operation allowlist");
  return operation;
}

function projectedObject(listed, head) {
  const rawLastModified = head?.LastModified ?? listed?.lastModified;
  const lastModified =
    rawLastModified instanceof Date
      ? rawLastModified.toISOString()
      : String(rawLastModified ?? "");
  const listedLastModified =
    listed?.lastModified instanceof Date
      ? listed.lastModified.toISOString()
      : listed?.lastModified == null
        ? undefined
        : String(listed.lastModified);
  if (
    !listed ||
    typeof listed.key !== "string" ||
    !listed.key ||
    !Number.isSafeInteger(Number(listed.size)) ||
    Number(listed.size) < 0 ||
    typeof listed.etag !== "string" ||
    !listed.etag ||
    !head ||
    Number(head.ContentLength) !== Number(listed.size) ||
    typeof head.ETag !== "string" ||
    !head.ETag ||
    (listed.etag != null && listed.etag !== head.ETag) ||
    (listedLastModified != null && listedLastModified !== lastModified) ||
    "Body" in head
  ) {
    throw new Error("R2 LIST and HEAD metadata are incomplete or inconsistent");
  }
  assertCanonicalTimestamp(lastModified, "R2 lastModified");
  const snapshot = {
    key: listed.key,
    size: Number(head.ContentLength),
    etag: head.ETag,
    lastModified,
  };
  return snapshot;
}

export async function captureR2Snapshot({
  invoke,
  signal,
  bucket,
  expectedBucket,
  maxPages = 100,
  maxObjects = 100000,
  maxMetadataBytes = 64 * 1024 * 1024,
}) {
  if (typeof invoke !== "function" || !bucket || bucket !== expectedBucket) {
    throw new Error("R2 target does not match the approved bucket");
  }
  if (
    signal &&
    (typeof signal.aborted !== "boolean" ||
      typeof signal.throwIfAborted !== "function")
  )
    throw new Error("R2 AbortSignal contract is invalid");
  if (
    !Number.isInteger(maxPages) ||
    maxPages < 1 ||
    maxPages > 1000 ||
    !Number.isInteger(maxObjects) ||
    maxObjects < 1 ||
    maxObjects > 1000000 ||
    !Number.isInteger(maxMetadataBytes) ||
    maxMetadataBytes < 1024 ||
    maxMetadataBytes > 256 * 1024 * 1024
  ) {
    throw new Error("R2 capture budget is invalid");
  }
  const listed = [];
  const keys = new Set();
  const tokens = new Set();
  let continuationToken;
  let completed = false;
  let metadataBytes = 0;
  const call = async (request) => {
    try {
      signal?.throwIfAborted();
      const result = await invoke({ ...request, signal });
      signal?.throwIfAborted();
      return result;
    } catch {
      throw new Error("R2 read operation failed");
    }
  };
  for (let page = 0; page < maxPages; page += 1) {
    const response = await call({
      operation: assertR2OperationAllowed("ListObjectsV2"),
      bucket,
      maxKeys: 1000,
      ...(continuationToken ? { continuationToken } : {}),
    });
    if (
      !response ||
      !Array.isArray(response.objects) ||
      typeof response.isTruncated !== "boolean"
    ) {
      throw new Error("R2 listing returned an invalid page");
    }
    for (const object of response.objects) {
      if (
        !object ||
        typeof object.key !== "string" ||
        Buffer.byteLength(object.key) > 1024 ||
        keys.has(object.key)
      ) {
        throw new Error("R2 listing returned an invalid or duplicate key");
      }
      keys.add(object.key);
      listed.push(object);
      metadataBytes += Buffer.byteLength(
        JSON.stringify({
          key: object.key,
          size: object.size,
          etag: object.etag,
          lastModified: object.lastModified,
        }),
      );
      if (listed.length > maxObjects)
        throw new Error("R2 object budget exceeded");
      if (metadataBytes > maxMetadataBytes)
        throw new Error("R2 metadata byte budget exceeded");
    }
    if (response.isTruncated === false) {
      if (response.nextContinuationToken != null)
        throw new Error("R2 pagination returned a contradictory token");
      completed = true;
      break;
    }
    if (
      !response.nextContinuationToken ||
      Buffer.byteLength(response.nextContinuationToken) > 4096 ||
      tokens.has(response.nextContinuationToken)
    ) {
      throw new Error("R2 pagination token is missing or repeated");
    }
    tokens.add(response.nextContinuationToken);
    continuationToken = response.nextContinuationToken;
  }
  if (!completed)
    throw new Error("R2 pagination did not complete within budget");
  const objects = [];
  for (const object of listed) {
    const head = await call({
      operation: assertR2OperationAllowed("HeadObject"),
      bucket,
      key: object.key,
    });
    const projected = projectedObject(object, head);
    metadataBytes += Buffer.byteLength(JSON.stringify(projected));
    if (metadataBytes > maxMetadataBytes)
      throw new Error("R2 metadata byte budget exceeded");
    objects.push(projected);
  }
  objects.sort((a, b) => a.key.localeCompare(b.key));
  const data = { bucket, objects };
  const snapshot = {
    kind: "r2",
    status: "complete",
    scope: "full-list-plus-head",
    contractSha256: digestValue([...OPERATIONS].sort()),
    digest: digestValue(data),
    data,
  };
  const closedSnapshot = deepFreeze(snapshot);
  issuedSnapshots.add(closedSnapshot);
  return closedSnapshot;
}
