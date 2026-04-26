import { Logger } from '@nestjs/common';
import { AiPart } from '../interfaces/ai-provider.interface';

/** Represents one content block in an OpenAI chat message. */
export type OpenAiContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

/**
 * Converts an array of AiParts into OpenAI-compatible content blocks.
 *
 * Mapping rules:
 *  - `inlineData`  → `image_url` with a `data:{mimeType};base64,{data}` URL
 *  - `fileData`    → `image_url` with the `fileUri` as the URL
 *  - `text`        → `text` block
 *  - both `inlineData` and `fileData` present → prefer `inlineData`, log DEBUG warning
 *  - no recognized field → skip the part, log WARN
 *
 * The output array has the same length as the input (one block per part),
 * except unrecognized parts which are skipped with a warning.
 *
 * @param parts - The AiPart array to convert.
 * @param logger - Optional NestJS Logger for diagnostic output.
 * @returns An array of OpenAI content blocks.
 */
export function mapPartsToOpenAi(
  parts: AiPart[],
  logger?: Logger,
): OpenAiContentBlock[] {
  const result: OpenAiContentBlock[] = [];

  for (const part of parts) {
    if (part.inlineData) {
      if (part.fileData) {
        logger?.debug(
          `mapPartsToOpenAi: AiPart has both inlineData and fileData — preferring inlineData. fileUri=${part.fileData.fileUri}`,
        );
      }
      result.push({
        type: 'image_url',
        image_url: {
          url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
        },
      });
    } else if (part.fileData) {
      result.push({
        type: 'image_url',
        image_url: { url: part.fileData.fileUri },
      });
    } else if (part.text !== undefined) {
      result.push({ type: 'text', text: part.text });
    } else {
      const keys = Object.keys(part).join(', ') || '(none)';
      logger?.warn(
        `mapPartsToOpenAi: Unrecognized AiPart — skipping. Keys present: ${keys}`,
      );
    }
  }

  return result;
}
