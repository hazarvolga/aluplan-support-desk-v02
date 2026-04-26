# Requirements Document

## Introduction

Support desk customers attach files — screenshots, PDFs, DOCX, and log files — to support tickets. These attachments must be correctly processed and forwarded to AI providers so the AI can analyze them when generating responses.

Currently, four layers in the AI pipeline silently discard or mishandle attachment data:

1. **`OpenAiService.mapParts()`** — ignores `fileData` (URL-based images), emitting an empty text part instead.
2. **`LlmApiService.generate()` / `reformat()`** — strips all image parts, passing only `.text` fields.
3. **`GenericOpenAiService.generate()` / `reformat()`** — same silent image-drop as `LlmApiService`.
4. **`AiQueryService`** — passes URL-based images as `fileData.fileUri`, but OpenAI cannot fetch from arbitrary storage URLs; the binary must be fetched first and converted to `inlineData`.

The reference implementation (`AiCopilotService`) already handles this correctly: it fetches image binaries from `StorageService`, converts them to base64 `inlineData`, and passes them to the AI provider. This feature brings all other code paths into alignment with that pattern.

---

## Glossary

- **AiPart**: The union type `{ text?, inlineData?, fileData?, fileUri? }` defined in `ai-provider.interface.ts`. Represents one content part in a multimodal prompt.
- **inlineData**: An `AiPart` variant carrying a base64-encoded binary payload and its MIME type. Suitable for all providers.
- **fileData**: An `AiPart` variant carrying a remote URL (`fileUri`) and MIME type. Only natively supported by Google Vertex/Gemini; must be converted to `inlineData` for OpenAI-compatible providers.
- **AiProvider**: The interface implemented by `OpenAiService`, `LlmApiService`, `GenericOpenAiService`, and others.
- **AiQueryService**: The orchestration service that builds `AiPart[]` from ticket attachments and calls `AiProvider.reformat()`.
- **AiCopilotService**: The reference implementation that correctly handles image attachments today.
- **StorageService**: The internal service used to fetch file binaries by URL (`storage.getFile(url): Promise<Buffer>`).
- **Vision-capable provider**: An AI provider whose active model supports image input (e.g., `gpt-4o`, `gpt-4o-mini`, `grok-2-vision`).
- **Non-vision provider**: An AI provider whose active model does not support image input (e.g., `deepseek-chat`, `llama-3.3-70b`).
- **Part_Normalizer**: The internal logic (within each provider or a shared utility) responsible for converting `AiPart[]` into the provider's native message format.
- **Attachment_Pipeline**: The end-to-end path from a ticket attachment record through `AiQueryService` to an `AiProvider.generate()` or `AiProvider.reformat()` call.

---

## Requirements

### Requirement 1: Normalize URL-Based Images Before Provider Dispatch

**User Story:** As a support agent, I want URL-based image attachments to be fetched and converted to binary before being sent to AI providers, so that providers that cannot fetch from arbitrary URLs can still analyze the images.

#### Acceptance Criteria

1. WHEN `AiQueryService` processes an attachment whose `mimeType` starts with `image/` and whose `url` field is set, THE `AiQueryService` SHALL fetch the file binary via `StorageService.getFile(url)` and produce an `inlineData` AiPart containing the base64-encoded binary and the original MIME type.
2. WHEN `StorageService.getFile()` throws or returns a null/empty buffer for an image attachment, THE `AiQueryService` SHALL log a warning at WARN level and skip that attachment without aborting the overall request.
3. WHEN an attachment already carries an `inlineData` field (base64 payload present), THE `AiQueryService` SHALL pass it through unchanged without re-fetching.
4. THE `AiQueryService` SHALL NOT produce any `fileData`-typed AiPart for OpenAI-compatible providers; all image parts entering the provider dispatch path SHALL be `inlineData`.
5. WHEN all image attachments fail to fetch, THE `AiQueryService` SHALL continue generating a response using only the text context, without returning an error to the caller.

---

### Requirement 2: OpenAI Provider — Full AiPart Mapping

**User Story:** As a support agent, I want screenshots attached to tickets to be visible to the OpenAI model, so that the AI can reference visual error messages and UI states in its response.

#### Acceptance Criteria

1. WHEN `OpenAiService.mapParts()` receives an `AiPart` with an `inlineData` field, THE `OpenAiService` SHALL produce an OpenAI `image_url` content block with a `data:` URI of the form `data:{mimeType};base64,{data}`.
2. WHEN `OpenAiService.mapParts()` receives an `AiPart` with a `fileData` field, THE `OpenAiService` SHALL produce an OpenAI `image_url` content block using the `fileUri` as the URL value.
3. WHEN `OpenAiService.mapParts()` receives an `AiPart` with only a `text` field, THE `OpenAiService` SHALL produce an OpenAI `text` content block containing that text.
4. WHEN `OpenAiService.mapParts()` receives an `AiPart` with no recognized field (`text`, `inlineData`, or `fileData`), THE `OpenAiService` SHALL skip that part and log a warning at DEBUG level.
5. THE `OpenAiService` SHALL apply `mapParts()` consistently in both `generate()` and `reformat()` methods, including the streaming variant `streamGenerate()`.
6. FOR ALL valid `AiPart[]` arrays, mapping then extracting the content type of each resulting block SHALL produce a type list that matches the input part types in the same order (round-trip structural invariant).

---

### Requirement 3: LlmApiService — Vision-Aware Part Handling

**User Story:** As a support agent using the LlmAPI provider, I want image attachments to be included in AI requests when the configured model supports vision, so that the AI can analyze screenshots.

#### Acceptance Criteria

1. WHEN `LlmApiService.generate()` receives an `AiPart[]` prompt containing `inlineData` parts, THE `LlmApiService` SHALL construct an OpenAI-compatible multipart content array including `image_url` blocks for each image part.
2. WHEN `LlmApiService.reformat()` receives an `attachments` array containing `inlineData` parts, THE `LlmApiService` SHALL include those image parts in the user message content array sent to the provider.
3. WHEN `LlmApiService` receives an `AiPart[]` containing only `text` parts, THE `LlmApiService` SHALL produce a plain string content value (preserving existing text-only behavior).
4. WHEN `LlmApiService` receives an `AiPart` with a `fileData` field, THE `LlmApiService` SHALL treat it as an `image_url` block using the `fileUri` value, consistent with the OpenAI vision API format.
5. THE `LlmApiService` SHALL NOT silently drop any `inlineData` or `fileData` part; every image part in the input SHALL appear as an `image_url` block in the outgoing request.

---

### Requirement 4: GenericOpenAiService — Vision-Aware Part Handling

**User Story:** As a support agent using a custom or third-party OpenAI-compatible provider (xAI Grok, DeepSeek, Groq), I want image attachments to be forwarded when the provider supports vision, so that vision-capable models can analyze screenshots.

#### Acceptance Criteria

1. WHEN `GenericOpenAiService.generate()` receives an `AiPart[]` prompt containing `inlineData` parts, THE `GenericOpenAiService` SHALL construct an OpenAI-compatible multipart content array including `image_url` blocks for each image part.
2. WHEN `GenericOpenAiService.reformat()` receives an `attachments` array containing `inlineData` parts, THE `GenericOpenAiService` SHALL include those image parts in the user message content array.
3. WHEN `GenericOpenAiService` receives an `AiPart` with a `fileData` field, THE `GenericOpenAiService` SHALL treat it as an `image_url` block using the `fileUri` value.
4. THE `GenericOpenAiService` SHALL NOT silently drop any `inlineData` or `fileData` part; every image part in the input SHALL appear as an `image_url` block in the outgoing request.
5. WHEN `GenericOpenAiService` is configured for a provider whose base URL indicates a non-vision backend (e.g., `deepseek.com`, `groq.com` with a non-vision model), THE `GenericOpenAiService` SHALL log a warning at WARN level stating that image parts were included but the model may not support vision, and SHALL still forward the parts unchanged.

---

### Requirement 5: Graceful Degradation for Non-Vision Providers

**User Story:** As a system operator, I want non-vision AI providers to handle image attachments without crashing or silently corrupting the request, so that the system remains stable regardless of which provider is active.

#### Acceptance Criteria

1. WHEN a provider receives an `AiPart[]` containing image parts and the provider's API returns an HTTP 400 error referencing unsupported content type, THE `AiProvider` SHALL catch the error, log it at WARN level with the provider name and model, and return `null` from `generate()` or `reformat()` rather than propagating the exception.
2. WHEN `AiService` (the dispatcher) receives a `null` result from the active provider due to a vision-related failure, THE `AiService` SHALL attempt the request again using only the text parts of the original `AiPart[]`, with image parts removed.
3. WHEN the text-only retry also fails, THE `AiService` SHALL return `null` to the caller and log the failure at ERROR level.
4. THE `Attachment_Pipeline` SHALL NOT throw an unhandled exception to the HTTP layer as a result of image attachment processing failures.
5. WHEN a provider processes a request with image parts stripped, THE `AiService` SHALL include a structured log entry at INFO level indicating that vision degradation occurred, naming the provider and the number of image parts that were dropped.

---

### Requirement 6: AiPart Structural Consistency Across the Pipeline

**User Story:** As a developer, I want the `AiPart` interface and its handling to be consistent across all providers, so that adding a new provider does not require re-discovering the same image-handling logic.

#### Acceptance Criteria

1. THE `AiProvider` interface SHALL document the expected behavior for each `AiPart` variant (`text`, `inlineData`, `fileData`) in its JSDoc comment.
2. WHEN a new class implements `AiProvider`, THE `AiProvider` interface contract SHALL require that `generate()` and `reformat()` accept `AiPart[]` and handle at minimum `text` and `inlineData` variants without throwing.
3. THE `Part_Normalizer` logic for converting `AiPart[]` to OpenAI-compatible content arrays SHALL be extracted into a shared utility function usable by `OpenAiService`, `LlmApiService`, and `GenericOpenAiService`.
4. FOR ALL valid `AiPart[]` inputs, the shared `Part_Normalizer` utility SHALL produce an output array of the same length as the input (no silent drops — every part maps to exactly one output block).
5. WHEN the shared `Part_Normalizer` receives an `AiPart` with both `inlineData` and `fileData` set, THE `Part_Normalizer` SHALL prefer `inlineData` and log a DEBUG warning about the ambiguous part.

---

### Requirement 7: AiQueryService — Consistent Image Normalization for All Call Paths

**User Story:** As a support agent, I want all ticket query paths (direct query, streaming query, and queue-processed query) to normalize image attachments the same way, so that vision analysis works regardless of how the query was initiated.

#### Acceptance Criteria

1. WHEN `AiQueryService.queryInternal()` builds the `aiParts` array from ticket attachments, THE `AiQueryService` SHALL apply the URL-to-inlineData normalization defined in Requirement 1 for every image attachment.
2. WHEN `AiQueryService.streamQuery()` builds the `aiParts` array, THE `AiQueryService` SHALL apply the same normalization as `queryInternal()`.
3. WHEN the BullMQ processor invokes `queryInternal()` for a queued job, THE `AiQueryService` SHALL apply the same normalization, ensuring queue-processed queries are not treated differently.
4. THE `AiQueryService` SHALL NOT pass `fileData`-typed parts to any `AiProvider` that uses an OpenAI-compatible API.
5. FOR ALL attachment arrays containing a mix of image and non-image files, the `aiParts` array produced by `AiQueryService` SHALL contain exactly one `inlineData` part per successfully fetched image attachment and zero `fileData` parts (property: count of `inlineData` parts equals count of successfully fetched image attachments).

---

### Requirement 8: Observability and Logging for Attachment Processing

**User Story:** As a system operator, I want structured log entries for attachment processing outcomes, so that I can diagnose vision failures and monitor attachment pipeline health.

#### Acceptance Criteria

1. WHEN `AiQueryService` successfully converts a URL-based image to `inlineData`, THE `AiQueryService` SHALL emit a DEBUG log entry containing the attachment URL (truncated to 100 characters), the MIME type, and the resulting base64 payload size in bytes.
2. WHEN any provider's `mapParts()` or equivalent receives an unrecognized `AiPart` variant, THE provider SHALL emit a WARN log entry identifying the provider name and the unrecognized part structure (keys present).
3. WHEN vision degradation occurs (image parts stripped for retry), THE `AiService` SHALL emit a structured INFO log entry with fields: `provider`, `droppedImageCount`, `retryWithTextOnly: true`.
4. WHEN `StorageService.getFile()` fails for an image attachment, THE `AiQueryService` SHALL emit a WARN log entry containing the attachment URL and the error message.
5. THE log entries described in this requirement SHALL NOT include raw base64 image data to avoid log bloat; payload size in bytes is sufficient.
