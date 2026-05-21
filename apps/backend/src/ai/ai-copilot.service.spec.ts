import { Test, TestingModule } from '@nestjs/testing';
import { AiCopilotService } from './ai-copilot.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { EmbeddingService } from './embedding.service';
import { StorageService } from '../common/services/storage.service';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { DocumentParserService } from '../common/services/document-parser.service';
import { NotFoundException } from '@nestjs/common';

describe('AiCopilotService', () => {
    let service: AiCopilotService;
    let mockPrisma: any;
    let mockAi: any;
    let mockPromptBuilder: any;
    let mockEmbedding: any;
    let mockStorage: any;
    let mockDiagnosis: any;
    let mockDocParser: any;

    beforeEach(async () => {
        mockPrisma = {
            ticket: {
                findUnique: jest.fn(),
            },
        };
        mockAi = { generate: jest.fn() };
        mockPromptBuilder = { buildContext: jest.fn().mockResolvedValue('Mock Context') };
        mockEmbedding = { search: jest.fn().mockResolvedValue({ results: [] }) };
        mockStorage = { getFile: jest.fn() };
        mockDiagnosis = { analyze: jest.fn().mockResolvedValue({ isProblemShift: false }) };
        mockDocParser = { extractText: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiCopilotService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: AiService, useValue: mockAi },
                { provide: PromptContextBuilderService, useValue: mockPromptBuilder },
                { provide: EmbeddingService, useValue: mockEmbedding },
                { provide: StorageService, useValue: mockStorage },
                { provide: AiDiagnosisService, useValue: mockDiagnosis },
                { provide: DocumentParserService, useValue: mockDocParser },
            ],
        }).compile();

        service = module.get<AiCopilotService>(AiCopilotService);
    });

    describe('generateDraft', () => {
        const mockTicket = {
            id: 'tik-1',
            ticketNumber: 'SUP-001',
            subject: 'Subject',
            description: 'Desc',
            messages: [{ id: 'm1', message: 'Hello', attachments: [] }],
            creator: { id: 'u1', language: 'tr', customerProfile: { hotinfoData: {} } }
        };

        it('should throw NotFoundException if ticket not found', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(null);
            await expect(service.generateDraft('invalid')).rejects.toThrow(NotFoundException);
        });

        it('should generate draft correctly without attachments', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockAi.generate.mockResolvedValue('Generated draft response');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toBe('Generated draft response');
            expect(mockAi.generate).toHaveBeenCalled();
            const prompt = mockAi.generate.mock.calls[0][0];
            expect(prompt).toContain('## SHARED ANSWER CONTRACT');
            expect(prompt).toContain('Audience: support agent draft');
            expect(prompt).toContain('Keep the same core solution for customer and agent outputs');
            expect(prompt).toContain('do not convert it into an outage/root-cause diagnosis');
        });

        it('uses the ticket-opening interaction language before the creator profile language', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                interaction: {
                    userContext: {
                        responseLanguage: 'en',
                        requestLocale: 'en',
                        languageSource: 'ui',
                    },
                },
                creator: { id: 'u1', language: 'tr', customerProfile: { hotinfoData: {} } },
            });
            mockAi.generate.mockResolvedValue('Generated English draft response');

            await service.generateDraft('tik-1');

            const prompt = mockAi.generate.mock.calls[0][0];
            expect(prompt).toContain('Output language must be English');
            expect(prompt).toContain('## 📌 Issue Summary');
            expect(prompt).not.toContain('Output language must be Turkish');
        });

        it('grounds the admin draft in the linked ticket-opening AI answer', async () => {
            const openingAnswer = [
                'Merhaba,',
                '',
                '## 📌 Sorun Yorumu',
                'İstemci bilgisayar lisans sunucusunu otomatik olarak bulamıyorsa, sunucu manuel olarak eklenmelidir.',
                '',
                '## 🛠️ Çözüm Adımları',
                'Allplan lisans ayarlarında manuel sunucu alanına lisans sunucusunun adını veya IP adresini girin.',
            ].join('\n');
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                interaction: {
                    responseGenerated: openingAnswer,
                    userContext: {
                        responseLanguage: 'tr',
                        requestLocale: 'tr',
                    },
                },
            });
            mockAi.generate.mockResolvedValue('Generated admin draft');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toBe('Generated admin draft');
            const prompt = mockAi.generate.mock.calls[0][0];
            expect(prompt).toContain('[LINKED_CUSTOMER_AI_ANSWER]');
            expect(prompt).toContain('Use it as the primary grounding signal');
            expect(prompt).toContain('sunucu manuel olarak eklenmelidir');
        });

        it('reuses the linked ticket-opening AI answer when the admin model returns no-knowledge', async () => {
            const openingAnswer = [
                'Merhaba,',
                '',
                '## 📌 Sorun Yorumu',
                'İstemci bilgisayar lisans sunucusunu otomatik bulamıyorsa manuel sunucu ekleme akışı kullanılmalıdır.',
                '',
                '## 🛠️ Çözüm Adımları',
                'Lisans ayarlarında sunucu adını veya IP adresini girin ve lisans listesini yenileyin.',
                '',
                'Kaynak: FAQ_TR_test',
            ].join('\n');
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                interaction: {
                    responseGenerated: openingAnswer,
                    userContext: {
                        responseLanguage: 'tr',
                        requestLocale: 'tr',
                    },
                },
            });
            mockEmbedding.search.mockResolvedValue({ results: [] });
            mockAi.generate.mockResolvedValue('Bilgi kaynağımda yeterli döküman bulunmuyor. Lütfen destek talebi oluşturun.');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('manuel sunucu ekleme akışı kullanılmalıdır');
            expect(result.draft).not.toContain('yeterli döküman bulunmuyor');
            expect(result.draft).not.toContain('Kaynak:');
        });

        it('removes problem-shift sections when no problem shift was detected', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockDiagnosis.analyze.mockResolvedValue({ isProblemShift: false });
            mockAi.generate.mockResolvedValue([
                'Merhaba,',
                '',
                '## 📌 Sorun Yorumu',
                'Lisans sunucusu taşınmak isteniyor.',
                '',
                '## 🔄 Problem Değişimi',
                'Önceki sorgudan farklı bir konuya geçildi.',
                '',
                '## 🛠️ Çözüm Adımları',
                'Lisansı eski sunucudan iade edip yeni sunucuda etkinleştirin.',
            ].join('\n'));

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('## 📌 Sorun Yorumu');
            expect(result.draft).toContain('## 🛠️ Çözüm Adımları');
            expect(result.draft).not.toContain('Problem Değişimi');
            expect(result.draft).not.toContain('Önceki sorgudan farklı');

            const prompt = mockAi.generate.mock.calls[0][0];
            expect(prompt).toContain('KONU DEĞİŞİKLİĞİ YOK');
        });

        it('keeps problem-shift sections when a problem shift was detected', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockDiagnosis.analyze.mockResolvedValue({ isProblemShift: true });
            mockAi.generate.mockResolvedValue([
                'Merhaba,',
                '',
                '## 📌 Sorun Yorumu',
                'Yeni konuya geçildi.',
                '',
                '## 🔄 Problem Değişimi',
                'Önceki lisans sorusundan farklı bir konu soruldu.',
                '',
                '## 🛠️ Çözüm Adımları',
                'Yeni konuya göre ilerleyin.',
            ].join('\n'));

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('Problem Değişimi');
            expect(result.draft).toContain('Önceki lisans sorusundan farklı');
        });

        it('should handle image attachments correctly', async () => {
            const ticketWithImg = {
                ...mockTicket,
                messages: [{
                    id: 'm1', message: 'See image',
                    attachments: [{ url: 'img.jpg', mimeType: 'image/jpeg', fileName: 'test.jpg' }]
                }]
            };
            mockPrisma.ticket.findUnique.mockResolvedValue(ticketWithImg);
            mockStorage.getFile.mockResolvedValue(Buffer.from('fake-image-data'));
            mockAi.generate.mockResolvedValue('Draft with image context');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toBe('Draft with image context');
            // Check that aiParts were passed to generate (containing base64 data)
            const lastCallArgs = mockAi.generate.mock.calls[0];
            expect(lastCallArgs[2]).toHaveLength(1);
            expect(lastCallArgs[2][0].inlineData.data).toBeDefined();
        });

        it('should handle document attachments correctly', async () => {
            const ticketWithDoc = {
                ...mockTicket,
                messages: [{
                    id: 'm1', message: 'See doc',
                    attachments: [{ url: 'doc.pdf', mimeType: 'application/pdf', fileName: 'test.pdf' }]
                }]
            };
            mockPrisma.ticket.findUnique.mockResolvedValue(ticketWithDoc);
            mockStorage.getFile.mockResolvedValue(Buffer.from('fake-pdf-data'));
            mockDocParser.extractText.mockResolvedValue('Extracted text from PDF');
            mockAi.generate.mockResolvedValue('Draft with PDF content');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toBe('Draft with PDF content');
            expect(mockDocParser.extractText).toHaveBeenCalled();
        });

        it('should return error message when AI generation fails', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockAi.generate.mockRejectedValue(new Error('AI Service Down'));

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('AI_ERROR');
        });

        it('does not replace no-knowledge draft with raw unrelated source excerpts', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                subject: 'IFC aktarımı',
                description: 'IFC aktarımında hangi ayarlar kritik?',
                messages: [{ id: 'm1', message: 'IFC aktarımında hangi ayarlar kritik?', attachments: [] }],
            });
            mockEmbedding.search.mockResolvedValue({
                results: [
                    {
                        title: 'faq-license-FAQ-TR-Lisansi-yeni-bir-bilgisayara-veya-baska-bir-bilgisayara-aktarma',
                        content: 'Lisansı bir Ürün Anahtarı girerek çevrimiçi olarak etkinleştirdiyseniz, Ürün Anahtarını iade edebilirsiniz.',
                        similarity: 0.94,
                    },
                ],
            });
            mockAi.generate.mockResolvedValue('Bilgi kaynağımda yeterli döküman bulunmuyor. Lütfen destek talebi oluşturun.');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('Bu konu için bilgi kaynağında yeterince güvenilir');
            expect(result.draft).not.toContain('Bilgi kaynağındaki en güçlü eşleşme');
            expect(result.draft).not.toContain('faq-license');
            expect(result.draft).not.toContain('Ürün Anahtarı');
        });

        it('uses a structured fallback for manual license server discovery questions', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                subject: 'License server istemcide otomatik bulunmuyor, manuel server nasıl eklenir?',
                description: 'License server istemcide otomatik bulunmuyor, manuel server nasıl eklenir?',
                messages: [{ id: 'm1', message: 'License server istemcide otomatik bulunmuyor, manuel server nasıl eklenir?', attachments: [] }],
            });
            mockEmbedding.search.mockResolvedValue({
                results: [
                    {
                        title: 'FAQ_TR_Lisans sunucusu otomatik bulunmuyor',
                        content: 'License server otomatik bulunmazsa ek sunucu manuel girilebilir. CodeMeter ve 22350 portu kontrol edilmelidir.',
                        similarity: 0.91,
                    },
                ],
            });
            mockAi.generate.mockResolvedValue('Bilgi kaynağımda yeterli döküman bulunmuyor. Lütfen destek talebi oluşturun.');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('## 📌 Sorun Yorumu');
            expect(result.draft).toContain('manuel olarak eklenmelidir');
            expect(result.draft).toContain('## 🛠️ Çözüm Adımları');
            expect(result.draft).not.toContain('yeterli döküman bulunmuyor');
        });
    });

    describe('generateDraft — Shift Detection Messages Trimming', () => {
        const mockTicketWith3Messages = {
            id: 'tik-1',
            ticketNumber: 'SUP-001',
            subject: 'Subject',
            description: 'Desc',
            productId: null,
            hotinfoSnapshot: null,
            messages: [
                { id: 'm3', message: 'Third message', attachments: [], sender: { fullName: 'User' } },
                { id: 'm2', message: 'Second message', attachments: [], sender: { fullName: 'User' } },
                { id: 'm1', message: 'First message', attachments: [], sender: null },
            ],
            creator: { id: 'u1', language: 'tr', customerProfile: { hotinfoData: {} } },
            interaction: null,
        };

        beforeEach(() => {
            mockAi.generate.mockResolvedValue('Generated draft response');
        });

        it('isProblemShift=true and messages.length > 1 → messages trimmed to last message only', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicketWith3Messages);
            mockDiagnosis.analyze.mockResolvedValue({ isProblemShift: true });

            let capturedMessages: any[] | undefined;
            mockPromptBuilder.buildContext.mockImplementation((args: any) => {
                capturedMessages = args.messages;
                return Promise.resolve('Mock Context');
            });

            await service.generateDraft('tik-1');

            expect(capturedMessages).toHaveLength(1);
        });

        it('isProblemShift=false → messages unchanged', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicketWith3Messages);
            mockDiagnosis.analyze.mockResolvedValue({ isProblemShift: false });

            let capturedMessages: any[] | undefined;
            mockPromptBuilder.buildContext.mockImplementation((args: any) => {
                capturedMessages = args.messages;
                return Promise.resolve('Mock Context');
            });

            await service.generateDraft('tik-1');

            expect(capturedMessages).toHaveLength(3);
        });

        it('messages.length === 1 → splice NOT called (no trimming needed)', async () => {
            const mockTicketWith1Message = {
                ...mockTicketWith3Messages,
                messages: [
                    { id: 'm1', message: 'Only message', attachments: [], sender: { fullName: 'User' } },
                ],
            };
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicketWith1Message);
            mockDiagnosis.analyze.mockResolvedValue({ isProblemShift: true });

            let capturedMessages: any[] | undefined;
            mockPromptBuilder.buildContext.mockImplementation((args: any) => {
                capturedMessages = args.messages;
                return Promise.resolve('Mock Context');
            });

            await service.generateDraft('tik-1');

            expect(capturedMessages).toHaveLength(1);
        });
    });
});
