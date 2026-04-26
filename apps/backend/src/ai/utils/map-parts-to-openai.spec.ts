import { Logger } from '@nestjs/common';
import { mapPartsToOpenAi, OpenAiContentBlock } from './map-parts-to-openai';
import { AiPart } from '../interfaces/ai-provider.interface';

describe('mapPartsToOpenAi', () => {
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
  });

  it('should map a text part to a text block', () => {
    const parts: AiPart[] = [{ text: 'Hello, world!' }];
    const result = mapPartsToOpenAi(parts);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ type: 'text', text: 'Hello, world!' });
  });

  it('should map an inlineData part to an image_url block with correct data: URI', () => {
    const parts: AiPart[] = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: 'abc123base64data',
        },
      },
    ];
    const result = mapPartsToOpenAi(parts);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'image_url',
      image_url: { url: 'data:image/png;base64,abc123base64data' },
    });
  });

  it('should map a fileData part to an image_url block with fileUri', () => {
    const parts: AiPart[] = [
      {
        fileData: {
          mimeType: 'image/jpeg',
          fileUri: 'https://storage.example.com/files/image.jpg',
        },
      },
    ];
    const result = mapPartsToOpenAi(parts);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'image_url',
      image_url: { url: 'https://storage.example.com/files/image.jpg' },
    });
  });

  it('should prefer inlineData over fileData when both are present', () => {
    const parts: AiPart[] = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: 'inlinebase64data',
        },
        fileData: {
          mimeType: 'image/png',
          fileUri: 'https://storage.example.com/files/image.png',
        },
      },
    ];
    const result = mapPartsToOpenAi(parts, mockLogger);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'image_url',
      image_url: { url: 'data:image/png;base64,inlinebase64data' },
    });
    expect(mockLogger.debug).toHaveBeenCalledTimes(1);
  });

  it('should skip an unrecognized part (empty object) and shorten the output array', () => {
    const parts: AiPart[] = [
      { text: 'before' },
      {} as AiPart,
      { text: 'after' },
    ];
    const result = mapPartsToOpenAi(parts, mockLogger);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: 'text', text: 'before' });
    expect(result[1]).toEqual({ type: 'text', text: 'after' });
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array for an empty input', () => {
    const result = mapPartsToOpenAi([]);
    expect(result).toEqual([]);
  });

  it('should handle mixed parts in order', () => {
    const parts: AiPart[] = [
      { text: 'describe this image:' },
      { inlineData: { mimeType: 'image/jpeg', data: 'jpegdata' } },
      { text: 'and this one:' },
      { fileData: { mimeType: 'image/gif', fileUri: 'https://example.com/img.gif' } },
    ];
    const result = mapPartsToOpenAi(parts);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ type: 'text', text: 'describe this image:' });
    expect(result[1]).toEqual({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,jpegdata' } });
    expect(result[2]).toEqual({ type: 'text', text: 'and this one:' });
    expect(result[3]).toEqual({ type: 'image_url', image_url: { url: 'https://example.com/img.gif' } });
  });

  it('should work without a logger (no errors thrown)', () => {
    const parts: AiPart[] = [
      {} as AiPart,
      { inlineData: { mimeType: 'image/png', data: 'data' }, fileData: { mimeType: 'image/png', fileUri: 'uri' } },
    ];
    expect(() => mapPartsToOpenAi(parts)).not.toThrow();
    const result = mapPartsToOpenAi(parts);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('image_url');
  });
});
