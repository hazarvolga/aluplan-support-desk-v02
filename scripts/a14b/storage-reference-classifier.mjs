const OBJECT_KEY = /^[a-z0-9][a-z0-9._/-]{0,1023}$/i;
const OBJECT_PREFIXES = [
  "attachments/",
  "brand/",
  "knowledge-pool/",
  "tickets/",
];

function validatedObjectKey(value) {
  if (
    !OBJECT_KEY.test(value) ||
    value.includes("..") ||
    value.startsWith("/") ||
    !OBJECT_PREFIXES.some((prefix) => value.startsWith(prefix))
  ) {
    throw new Error("Ambiguous or invalid object-storage key");
  }
  return value;
}

function brandingKey(value) {
  if (value.startsWith("brand/")) return validatedObjectKey(value);
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value)) {
    throw new Error("Ambiguous branding storage reference");
  }
  let pathname;
  try {
    pathname = new URL(value, "https://local.invalid").pathname;
  } catch {
    throw new Error("Ambiguous branding storage reference");
  }
  const prefix = "/api/v1/branding/assets/";
  if (!pathname.startsWith(prefix)) {
    throw new Error("Ambiguous branding storage reference");
  }
  return validatedObjectKey(decodeURIComponent(pathname.slice(prefix.length)));
}

export function classifyStorageReference(row) {
  if (
    !row ||
    typeof row.source_type !== "string" ||
    typeof row.object_key !== "string"
  ) {
    throw new Error("Invalid storage reference row");
  }
  if (row.source_type === "failed-storage-marker") {
    return {
      class: "failed-marker",
      sourceType: row.source_type,
      recordId: row.reference_id,
    };
  }
  if (row.source_type === "branding-logo") {
    return {
      class: "r2",
      sourceType: row.source_type,
      recordId: row.reference_id,
      storageKey: brandingKey(row.object_key),
    };
  }
  if (row.source_type === "knowledge-source") {
    if (
      row.object_key.startsWith("/") ||
      row.object_key.startsWith("dataset/") ||
      /^[A-Za-z]:[\\/]/.test(row.object_key)
    ) {
      return {
        class: "local-volume",
        sourceType: row.source_type,
        recordId: row.reference_id,
        localPath: row.object_key,
      };
    }
  }
  if (!["attachment", "knowledge-source"].includes(row.source_type)) {
    throw new Error("Unknown storage reference source type");
  }
  return {
    class: "r2",
    sourceType: row.source_type,
    recordId: row.reference_id,
    storageKey: validatedObjectKey(row.object_key),
  };
}
