import { VisualContentService } from './visual-content.service';

const makeService = (env: Record<string, string | boolean | number | undefined>, generate = jest.fn()) => {
    const config = {
        get: jest.fn((key: string) => env[key]),
    };
    const aiService = {
        generate,
    };

    return { service: new VisualContentService(config as any, aiService as any), generate };
};

describe('VisualContentService', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    it('appends useful vision summaries to URL content and metadata', async () => {
        const generate = jest.fn().mockResolvedValue('- The dialog shows the Wireframe option selected.\n- The OK button confirms the setting.');
        const { service } = makeService({
            KNOWLEDGE_URL_VISION_ENABLED: 'true',
            KNOWLEDGE_URL_VISION_MAX_IMAGES: '2',
        }, generate);
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            headers: { get: jest.fn().mockReturnValue('image/png') },
            arrayBuffer: async () => Buffer.from('png-bytes'),
        }) as any;

        const result = await service.enrichUrlContent({
            sourceUrl: 'https://learnnow.allplan.com/article',
            title: 'Always display fixtures as wireframe',
            content: 'Article text about fixtures.',
            language: 'en',
            images: [{
                url: 'https://learnnow.allplan.com/pluginfile.php/dialog.png',
                alt: 'Wireframe dialog',
                caption: 'Display fixtures as wireframe',
                width: 640,
                height: 480,
            }],
        });

        expect(generate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ text: expect.stringContaining('official Allplan support article image') }),
                expect.objectContaining({ inlineData: expect.objectContaining({ mimeType: 'image/png' }) }),
            ]),
            45000,
        );
        expect(result.content).toContain('VISUAL EVIDENCE EXTRACTED FROM SOURCE IMAGES');
        expect(result.content).toContain('The dialog shows the Wireframe option selected.');
        expect(result.summaries).toEqual([
            expect.objectContaining({
                url: 'https://learnnow.allplan.com/pluginfile.php/dialog.png',
                alt: 'Wireframe dialog',
                summary: expect.stringContaining('Wireframe option'),
            }),
        ]);
        expect(result.metadata.visualEnrichment).toEqual(expect.objectContaining({
            enabled: true,
            selectedImageCount: 1,
            summarizedImageCount: 1,
        }));
    });

    it('skips decorative images and does not call AI', async () => {
        const { service, generate } = makeService({ KNOWLEDGE_URL_VISION_ENABLED: 'true' });

        const result = await service.enrichUrlContent({
            sourceUrl: 'https://learnnow.allplan.com/article',
            title: 'Article',
            content: 'Article text.',
            images: [{
                url: 'https://learnnow.allplan.com/theme/logo.svg',
                alt: 'Allplan logo',
                width: 80,
                height: 40,
            }],
        });

        expect(generate).not.toHaveBeenCalled();
        expect(result.content).toBe('Article text.');
        expect(result.summaries).toEqual([]);
    });

    it('reuses cached summaries without refetching images', async () => {
        const { service, generate } = makeService({ KNOWLEDGE_URL_VISION_ENABLED: 'true' });
        global.fetch = jest.fn();

        const result = await service.enrichUrlContent({
            sourceUrl: 'https://learnnow.allplan.com/article',
            title: 'Article',
            content: 'Article text.',
            existingMetadata: {
                visualSummaries: [{
                    url: 'https://learnnow.allplan.com/images/dialog.png',
                    summary: 'Cached visual summary.',
                }],
            },
            images: [{
                url: 'https://learnnow.allplan.com/images/dialog.png',
                width: 640,
                height: 480,
            }],
        });

        expect(global.fetch).not.toHaveBeenCalled();
        expect(generate).not.toHaveBeenCalled();
        expect(result.content).toContain('Cached visual summary.');
    });

    it('keeps sync safe when vision fetch or generation fails', async () => {
        const { service } = makeService({ KNOWLEDGE_URL_VISION_ENABLED: 'true' }, jest.fn().mockRejectedValue(new Error('vision timeout')));
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            headers: { get: jest.fn().mockReturnValue('image/png') },
            arrayBuffer: async () => Buffer.from('png-bytes'),
        }) as any;

        const result = await service.enrichUrlContent({
            sourceUrl: 'https://learnnow.allplan.com/article',
            title: 'Article',
            content: 'Article text.',
            images: [{
                url: 'https://learnnow.allplan.com/images/dialog.png',
                width: 640,
                height: 480,
            }],
        });

        expect(result.content).toBe('Article text.');
        expect(result.summaries).toEqual([]);
    });
});
