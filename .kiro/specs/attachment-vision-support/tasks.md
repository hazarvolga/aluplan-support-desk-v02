# Implementation Plan: Attachment Vision Support

## Overview

Fix the silent image-drop bug across four code paths in the AI attachment pipeline. The implementation follows a dependency-safe order: shared utility first, then provider updates that consume it, then the orchestration layer (`AiQueryService`), and finally the graceful-degradation wrapper in `AiService`.

`fast-check` is already installed as a dev dependency — no additional setup required.

---

## Tasks

- [x] 1. Create shared utility `mapPartsToOpenAi()` with unit and property tests
  - Create `apps/backend/src/ai/utils/map-parts-to-openai.ts`
  - Export `OpenAiContentBlock` union type (`text` | `image_url`)
  - Implement `mapPartsToOpenAi(parts: AiPart[], logger?: Logger): OpenAiContentBlock[]` with the four mapping rules:
    - `inlineData` → `image_url` with `data:{mimeType};base64,{data}` URL
    - `fileData` (no `inlineData`) → `image_url` with `fileUri` as URL
    - `text` only → `text` block
    - Both `inlineData` + `fileData` → prefer `inlineData`, emit `logger?.debug()` warning (Req 6.5)
    - No recognized field → skip part, emit `logger?.warn()` (Req 2.4, 8.2)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.3, 6.4, 6.5_

  - [x] 1.1 Create unit test file `apps/backend/src/ai/utils/map-parts-to-openai.spec.ts`
    - Text part → `{ type: 'text', text: '...' }` block
    - `inlineData` part → correct `data:` URI format
    - `fileData` part → `image_url` with `fileUri`
    - Both `inlineData` + `fileData` → prefers `inlineData`
    - Unrecognized part (no recognized field) → skipped, output array is shorter
    - Empty array → empty array
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.3, 6.5_

  - [x] 1.2 Write property test — Property 1: `mapPartsToOpenAi` preserves array length
    - **Property 1: mapPartsToOpenAi preserves array length**
    - File: `apps/backend/src/ai/utils/map-parts-to-openai.property.spec.ts`
    - For any valid `AiPart[]` (every part has at least one recognized field), output length equals input length
    - Use `fc.array(validAiPartArbitrary())`, `numRuns: 100`
    - **Validates: Requirements 6.4**

  - [x] 1.3 Write property test — Property 2: structural type order preserved
    - **Property 2: mapPartsToOpenAi preserves structural type order**
    - `inlineData`/`fileData` parts map to `image_url` blocks; `text` parts map to `text` blocks, in the same order
    - **Validates: Requirements 2.6, 6.4**

  - [x] 1.4 Write property test — Property 3: `inlineData` produces correct data URIs
    - **Property 3: inlineData parts produce correct data URIs**
    - For any `AiPart` with `inlineData`, output URL matches `data:{mimeType};base64,{data}` exactly
    - **Validates: Requirements 2.1, 3.1, 4.1**

  - [x] 1.5 Write property test — Property 4: `fileData` produces `image_url` with `fileUri`
    - **Property 4: fileData parts produce image_url blocks with the fileUri**
    - For any `AiPart` with `fileData` (no `inlineData`), output URL equals `part.fileData.fileUri`
    - **Validates: Requirements 2.2, 3.4, 4.3**

  - [x] 1.6 Write property test — Property 5: text parts produce text blocks with identical content
    - **Property 5: text parts produce text blocks with identical content**
    - For any `AiPart` with only `text`, output `text` value equals `part.text`
    - **Validates: Requirements 2.3, 3.3**

  - [x] 1.7 Write property test — Property 6: `inlineData` preferred over `fileData` when both present
    - **Property 6: inlineData preferred over fileData when both present**
    - For any `AiPart` with both fields set, output URL starts with `data:`
    - **Validates: Requirements 6.5**

  - Suggested commit: `feat(ai): add mapPartsToOpenAi shared utility with property tests`

---

- [x] 2. Update `AiProvider` interface JSDoc
  - Edit `apps/backend/src/ai/interfaces/ai-provider.interface.ts`
  - Add JSDoc to `AiPart` interface documenting the three variants (`text`, `inlineData`, `fileData`) and the preference rule (`inlineData` over `fileData`)
  - Add JSDoc to `AiProvider` interface documenting the contract: implementors MUST accept `AiPart[]`, handle `text` and `inlineData` without throwing, and return `null` (not throw) on vision-related HTTP 400
  - _Requirements: 6.1, 6.2_

  - Suggested commit: `docs(ai): document AiPart variants and AiProvider vision contract`

---

- [x] 3. Update `OpenAiService` to use shared utility
  - Edit `apps/backend/src/ai/openai.service.ts`
  - Import `mapPartsToOpenAi` and `OpenAiContentBlock` from `./utils/map-parts-to-openai`
  - Replace the private `mapParts()` body with a call to `mapPartsToOpenAi(prompt, this.logger)` (keep the `typeof prompt === 'string'` short-circuit)
  - Verify `generate()`, `reformat()`, and `streamGenerate()` all route through the updated `mapParts()` — no additional changes needed since they already call it
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.1 Add/update unit tests in `apps/backend/src/ai/openai.service.spec.ts` (or create if absent)
    - `generate()` with `AiPart[]` containing `inlineData` → request body includes `image_url` block
    - `reformat()` with `attachments` containing `inlineData` → user message content array includes `image_url` block
    - `streamGenerate()` with `AiPart[]` → `mapPartsToOpenAi` is invoked (spy or mock)
    - `fileData` part in `generate()` → `image_url` block with `fileUri` (not silently dropped)
    - _Requirements: 2.1, 2.2, 2.5_

  - Suggested commit: `fix(ai): OpenAiService — use mapPartsToOpenAi, handle fileData and inlineData`

---

- [x] 4. Update `LlmApiService` to use shared utility
  - Edit `apps/backend/src/ai/llm-api.service.ts`
  - Import `mapPartsToOpenAi` from `./utils/map-parts-to-openai`
  - In `generate()`: replace `prompt.map(p => p.text).join('\n')` with the text-only shortcut + multipart fallback:
    ```typescript
    const allText = parts.every(p => p.text && !p.inlineData && !p.fileData);
    const content = allText ? parts.map(p => p.text).join('\n') : mapPartsToOpenAi(parts, this.logger);
    ```
    This preserves existing text-only behavior (Req 3.3) while enabling vision (Req 3.1)
  - In `reformat()`: replace `attachments?.map(p => p.text).filter(Boolean).join('\n')` with `mapPartsToOpenAi(attachments, this.logger)` spread into the user message content array
  - In `streamReformat()`: apply the same fix as `reformat()` for consistency
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.1 Add unit tests for `LlmApiService` vision handling
    - `generate()` with mixed `AiPart[]` (text + `inlineData`) → content array includes `image_url` block
    - `generate()` with text-only parts → content is a plain string (Req 3.3 preserved)
    - `reformat()` with `inlineData` attachments → user message content array includes `image_url` block
    - `fileData` part → `image_url` block with `fileUri` (Req 3.4)
    - No `inlineData` or `fileData` part is silently dropped (Req 3.5)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - Suggested commit: `fix(ai): LlmApiService — use mapPartsToOpenAi, preserve text-only shortcut`

---

- [x] 5. Update `GenericOpenAiService` to use shared utility
  - Edit `apps/backend/src/ai/generic-openai.service.ts`
  - Import `mapPartsToOpenAi` from `./utils/map-parts-to-openai`
  - In `generate()`: replace `prompt.map(p => p.text).join('\n')` with the same text-only shortcut + multipart pattern used in `LlmApiService`
  - Add non-vision provider warning before the fetch call (Req 4.5):
    ```typescript
    const NON_VISION_HOSTS = ['deepseek.com', 'groq.com'];
    const hasImages = parts.some(p => p.inlineData || p.fileData);
    if (hasImages && NON_VISION_HOSTS.some(h => baseUrl.includes(h))) {
      this.logger.warn(`⚠️ [${this.getName()}] Image parts included but model may not support vision (baseUrl: ${baseUrl})`);
    }
    ```
  - In `reformat()`: replace `attachments?.map(p => p.text).filter(Boolean).join('\n')` with `mapPartsToOpenAi(attachments, this.logger)` spread into the user message content array; add the same non-vision warning
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.1 Add unit tests for `GenericOpenAiService` vision handling
    - `generate()` with `inlineData` parts → content array includes `image_url` block
    - `reformat()` with `inlineData` attachments → user message content array includes `image_url` block
    - `fileData` part → `image_url` block with `fileUri` (Req 4.3)
    - No image part silently dropped (Req 4.4)
    - Non-vision host (`deepseek.com`) with image parts → WARN log emitted, parts still forwarded (Req 4.5)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - Suggested commit: `fix(ai): GenericOpenAiService — use mapPartsToOpenAi, add non-vision host warning`

---

- [x] 6. Update `AiQueryService` — inject `StorageService`, add `normalizeImageAttachments()`, apply to both query paths
  - Edit `apps/backend/src/ai/ai-query.service.ts`

  - [x] 6.1 Inject `StorageService` into `AiQueryService`
    - Add `StorageService` to the constructor (import from `../common/services/storage.service`)
    - Ensure `StorageService` is exported from `CommonModule` (or the relevant module) and imported in `AiModule` — check `ai.module.ts` and add if missing
    - _Requirements: 1.1_

  - [x] 6.2 Implement `private async normalizeImageAttachments(attachments)` helper
    - For each attachment where `mimeType` starts with `image/`:
      - If `data` field is present (already inline) → push `{ inlineData: { mimeType, data } }` unchanged, do NOT call `StorageService` (Req 1.3)
      - Else if `url` is set → call `StorageService.getFile(url)`
        - On success (non-null, non-empty buffer): push `{ inlineData: { mimeType, data: buffer.toString('base64') } }` and emit DEBUG log with truncated URL, MIME type, and byte size (Req 8.1)
        - On failure (throws or returns null/empty): emit WARN log with URL and error message (Req 8.4), skip attachment (Req 1.2)
    - Never push a `fileData` part (Req 1.4, 7.4)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.4, 8.1, 8.4_

  - [x] 6.3 Replace inline `fileData` push in `queryInternal()` with `normalizeImageAttachments()`
    - Remove the existing block:
      ```typescript
      if (att.url) {
        aiParts.push({ fileData: { mimeType: att.mimeType || 'image/png', fileUri: att.url } });
      } else if (att.data) {
        aiParts.push({ inlineData: { mimeType: att.mimeType || 'image/png', data: att.data } });
      }
      ```
    - Replace with: `const aiParts = await this.normalizeImageAttachments(attachments ?? []);`
    - _Requirements: 1.1, 7.1_

  - [x] 6.4 Apply `normalizeImageAttachments()` in `streamQuery()` as well
    - Locate the equivalent attachment-building block in `streamQuery()` and replace it with the same `normalizeImageAttachments()` call
    - _Requirements: 7.2_

  - [x] 6.5 Add unit tests for `normalizeImageAttachments()` in `apps/backend/src/ai/ai-query.service.spec.ts`
    - URL-based image → `StorageService.getFile()` called, result is `inlineData` part
    - `StorageService.getFile()` throws → attachment skipped, no exception propagated, WARN logged
    - `StorageService.getFile()` returns `null` → attachment skipped
    - Already-`inlineData` attachment (has `data` field) → pass-through, `StorageService` NOT called
    - Mixed array (image with URL + non-image) → correct `inlineData` count, zero `fileData` parts
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.8 Write property test — Property 7: `normalizeImageAttachments` produces zero `fileData` parts
    - **Property 7: AiQueryService normalization produces zero fileData parts**
    - File: `apps/backend/src/ai/ai-query.service.property.spec.ts` (extend existing or create)
    - For any array of attachment records, output contains zero parts with a `fileData` field
    - Mock `StorageService.getFile` to resolve with `Buffer.from('fake')`
    - **Validates: Requirements 1.4, 7.4**

  - [x] 1.9 Write property test — Property 8: `inlineData` count equals successful fetches
    - **Property 8: AiQueryService inlineData count equals successful fetches**
    - For any array of image attachments with URL, where a random subset of `getFile()` calls succeed (return Buffer) and the rest return null, output `inlineData` count equals the success count
    - **Validates: Requirements 7.5, 1.1, 1.2**

  - [x] 1.10 Write property test — Property 9: already-`inlineData` attachments pass through unchanged
    - **Property 9: Already-inlineData attachments pass through unchanged**
    - For any array of attachments that already have `data` set, `StorageService.getFile` is never called and output `inlineData` values match input
    - **Validates: Requirements 1.3**

  - [x] 1.11 Write property test — Property 10: pipeline does not throw on attachment failures
    - **Property 10: Pipeline does not throw on attachment failures**
    - For any array of image attachments with URL where all `getFile()` calls throw, `normalizeImageAttachments()` resolves to `[]` without throwing
    - **Validates: Requirements 1.5, 5.4**

  - Suggested commit: `fix(ai): AiQueryService — fetch URL images via StorageService, normalize to inlineData`

---

- [x] 7. Update `AiService` — graceful degradation (text-only retry in `reformat()`)
  - Edit `apps/backend/src/ai/ai.service.ts`
  - Modify the `reformat()` method's `executeWithFallback` callback to add a within-provider text-only retry:
    ```typescript
    const result = await provider.reformat(systemPrompt, userQuery, sourceContext, attachments);
    if (result?.response) return result;

    const imageParts = attachments?.filter(p => p.inlineData || p.fileData) ?? [];
    if (imageParts.length > 0) {
      const textOnlyAttachments = attachments?.filter(p => !p.inlineData && !p.fileData);
      this.logger.log(JSON.stringify({
        provider: provider.getName(),
        droppedImageCount: imageParts.length,
        retryWithTextOnly: true,
      }));
      const retryResult = await provider.reformat(systemPrompt, userQuery, sourceContext, textOnlyAttachments);
      if (retryResult?.response) return retryResult;
    }
    return null;
    ```
  - The existing `executeWithFallback` already logs `ERROR` when all providers fail (Req 5.3) — no change needed there
  - _Requirements: 5.2, 5.3, 5.5, 8.3_

  - [x] 7.1 Add unit tests for graceful degradation in `apps/backend/src/ai/ai.service.spec.ts`
    - Provider returns `null` on first call with image parts → `reformat()` called a second time with text-only parts (Req 5.2)
    - Both calls return `null` → `AiService.reformat()` returns `null`, ERROR logged (Req 5.3)
    - Provider returns a result on first call → no retry, result returned directly
    - INFO log entry emitted on degradation with `provider`, `droppedImageCount`, `retryWithTextOnly: true` (Req 8.3)
    - No unhandled exception thrown to caller when both calls fail (Req 5.4)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 8.3_

  - Suggested commit: `fix(ai): AiService.reformat — text-only retry on vision failure (graceful degradation)`

---

- [x] 8. Checkpoint — all tests pass, TypeScript strict mode
  - Run `npx tsc --noEmit` in `apps/backend` and fix any type errors introduced by the new utility and injections
  - Run `npx jest --testPathPattern="map-parts-to-openai|ai-query.service|ai.service|openai.service|llm-api.service|generic-openai.service" --run` and ensure all new and existing tests pass
  - Verify no `fileData` parts appear in any provider's outgoing HTTP request body (grep for `fileData` in test snapshots / mock call args)
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests 1.8–1.11 are grouped under task 6 for proximity to the implementation they validate
- `fast-check` is already in `apps/backend/package.json` — no install step needed
- `StorageService` lives in `apps/backend/src/common/services/storage.service.ts`; verify it is exported from `CommonModule` before wiring the injection in task 6.1
- The text-only shortcut in `LlmApiService.generate()` (task 4) is intentional — it preserves the existing behavior for providers that prefer a plain string over a content array
- `GenericOpenAiService` re-throws errors (unlike `OpenAiService` which returns `null`) — the graceful degradation in `AiService` relies on `executeWithFallback` catching those throws; no change to that error-handling contract is needed
