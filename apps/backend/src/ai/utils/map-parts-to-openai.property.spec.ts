/**
 * Property-based tests for mapPartsToOpenAi.
 * Feature: attachment-vision-support
 */
import * as fc from 'fast-check';
import { mapPartsToOpenAi, OpenAiContentBlock } from './map-parts-to-openai';
import { AiPart } from '../interfaces/ai-provider.interface';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a valid mimeType string like "image/png" */
const mimeTypeArbitrary = fc.constantFrom(
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
);

/** Generates a non-empty base64-like string */
const base64Arbitrary = fc.string({ minLength: 1, maxLength: 200 });

/** Generates a non-empty URI string */
const fileUriArbitrary = fc
  .tuple(
    fc.constantFrom('https://', 'http://'),
    fc.string({ minLength: 1, maxLength: 50, unit: 'grapheme-ascii' }),
  )
  .map(([scheme, path]) => `${scheme}example.com/${path}`);

/** Generates an AiPart with only inlineData */
const inlineDataPartArbitrary = (): fc.Arbitrary<AiPart> =>
  fc.record({
    inlineData: fc.record({
      mimeType: mimeTypeArbitrary,
      data: base64Arbitrary,
    }),
  });

/** Generates an AiPart with only fileData (no inlineData) */
const fileDataPartArbitrary = (): fc.Arbitrary<AiPart> =>
  fc.record({
    fileData: fc.record({
      mimeType: mimeTypeArbitrary,
      fileUri: fileUriArbitrary,
    }),
  });

/** Generates an AiPart with only text */
const textPartArbitrary = (): fc.Arbitrary<AiPart> =>
  fc.record({ text: fc.string({ minLength: 1 }) });

/** Generates a valid AiPart (has at least one recognized field) */
const validAiPartArbitrary = (): fc.Arbitrary<AiPart> =>
  fc.oneof(inlineDataPartArbitrary(), fileDataPartArbitrary(), textPartArbitrary());

/** Generates an AiPart with BOTH inlineData and fileData */
const ambiguousPartArbitrary = (): fc.Arbitrary<AiPart> =>
  fc.record({
    inlineData: fc.record({
      mimeType: mimeTypeArbitrary,
      data: base64Arbitrary,
    }),
    fileData: fc.record({
      mimeType: mimeTypeArbitrary,
      fileUri: fileUriArbitrary,
    }),
  });

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('mapPartsToOpenAi — property tests', () => {
  /**
   * Property 1: mapPartsToOpenAi preserves array length
   * Validates: Requirements 6.4
   */
  it('Property 1: output length equals input length for valid parts', () => {
    fc.assert(
      fc.property(fc.array(validAiPartArbitrary()), (parts) => {
        const output = mapPartsToOpenAi(parts);
        expect(output).toHaveLength(parts.length);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: mapPartsToOpenAi preserves structural type order
   * Validates: Requirements 2.6, 6.4
   */
  it('Property 2: output type sequence matches input part type sequence', () => {
    fc.assert(
      fc.property(fc.array(validAiPartArbitrary()), (parts) => {
        const output = mapPartsToOpenAi(parts);
        expect(output).toHaveLength(parts.length);
        parts.forEach((part, i) => {
          if (part.inlineData || part.fileData) {
            expect(output[i].type).toBe('image_url');
          } else {
            expect(output[i].type).toBe('text');
          }
        });
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: inlineData parts produce correct data URIs
   * Validates: Requirements 2.1, 3.1, 4.1
   */
  it('Property 3: inlineData part produces data: URI matching data:{mimeType};base64,{data}', () => {
    fc.assert(
      fc.property(inlineDataPartArbitrary(), (part) => {
        const output = mapPartsToOpenAi([part]);
        expect(output).toHaveLength(1);
        const block = output[0];
        expect(block.type).toBe('image_url');
        const imageBlock = block as { type: 'image_url'; image_url: { url: string } };
        expect(imageBlock.image_url.url).toBe(
          `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`,
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: fileData parts produce image_url blocks with the fileUri
   * Validates: Requirements 2.2, 3.4, 4.3
   */
  it('Property 4: fileData part (no inlineData) produces image_url with fileUri', () => {
    fc.assert(
      fc.property(fileDataPartArbitrary(), (part) => {
        const output = mapPartsToOpenAi([part]);
        expect(output).toHaveLength(1);
        const block = output[0];
        expect(block.type).toBe('image_url');
        const imageBlock = block as { type: 'image_url'; image_url: { url: string } };
        expect(imageBlock.image_url.url).toBe(part.fileData!.fileUri);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: text parts produce text blocks with identical content
   * Validates: Requirements 2.3, 3.3
   */
  it('Property 5: text part produces text block with identical content', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (text) => {
        const output = mapPartsToOpenAi([{ text }]);
        expect(output).toHaveLength(1);
        const block = output[0];
        expect(block.type).toBe('text');
        const textBlock = block as { type: 'text'; text: string };
        expect(textBlock.text).toBe(text);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: inlineData preferred over fileData when both present
   * Validates: Requirements 6.5
   */
  it('Property 6: when both inlineData and fileData present, output URL starts with data:', () => {
    fc.assert(
      fc.property(ambiguousPartArbitrary(), (part) => {
        const output = mapPartsToOpenAi([part]);
        expect(output).toHaveLength(1);
        const block = output[0];
        expect(block.type).toBe('image_url');
        const imageBlock = block as { type: 'image_url'; image_url: { url: string } };
        expect(imageBlock.image_url.url).toMatch(/^data:/);
      }),
      { numRuns: 100 },
    );
  });
});
