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
import { SupportAnswerOrchestrator } from './support-answer-orchestrator.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';

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
            knowledgeSource: {
                findUnique: jest.fn(),
            },
        };
        mockAi = {
            generate: jest.fn(),
            reformat: jest.fn(),
            getActiveModelName: jest.fn().mockResolvedValue('gemini-2.5-flash'),
        };
        mockPromptBuilder = { buildContext: jest.fn().mockResolvedValue('Mock Context') };
        mockEmbedding = {
            search: jest.fn().mockResolvedValue({
                results: [{
                    id: 'approved-support-source',
                    title: 'Approved ALLPLAN support procedure',
                    content: 'Approved ALLPLAN support procedure for the ticket topic.',
                    similarity: 0.92,
                }],
            }),
        };
        mockStorage = { getFile: jest.fn() };
        mockDiagnosis = { analyze: jest.fn().mockResolvedValue({ isProblemShift: false }) };
        mockDocParser = { extractText: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiCopilotService,
                SupportAnswerOrchestrator,
                MaintenanceWorkService,
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
            userId: 'u1',
            messages: [{ id: 'm1', message: 'Hello', attachments: [] }],
            creator: { id: 'u1', fullName: 'Test Customer', language: 'tr', customerProfile: { hotinfoData: {} } }
        };

        const cloudLicenseTicket = {
            ...mockTicket,
            subject: 'ALLPLAN 2026 Connect lisansım görünmüyor',
            description: 'Connect platformundan lisansımı alamıyorum.',
            messages: [{ id: 'm1', senderId: 'u1', message: 'Lisans yöneticisiyim; koltuk görünmüyor.', attachments: [] }],
            hotinfoSnapshot: null,
            creator: { ...mockTicket.creator, customerProfile: { hotinfoData: null } },
            licensingIntake: {
                categoryKey: 'licensing',
                allplanVersion: '2026',
                licenseIssueType: 'SEAT',
                licenseUserRole: 'LICENSE_ADMIN',
            },
        };

        const cloudSource = {
            id: 'cloud-2026',
            licenseEra: 'cloud_2024_2_plus',
            title: 'ALLPLAN 2026 Connect 2.0 lisans yöneticisi ve koltuk yönetimi',
            content: 'ALLPLAN ID bulut lisansı Connect 2.0 üzerinde lisans yöneticisi tarafından yönetilir.',
            similarity: 0.92,
        };

        it('uses structured 2026 cloud seat/admin intake when creating a staff draft without Hotinfo', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(cloudLicenseTicket);
            mockEmbedding.search.mockResolvedValue({ results: [cloudSource] });
            mockAi.generate.mockResolvedValue('Connect lisans yöneticisi koltuk atamasını kontrol etmelidir.');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('Connect lisans yöneticisi');
            expect(mockPromptBuilder.buildContext).toHaveBeenCalledWith(expect.objectContaining({
                allplanVersion: '2026',
            }));
            const prompt = mockAi.generate.mock.calls[0]?.[0] || '';
            expect(prompt).toContain('CLOUD');
            expect(prompt).toContain('SEAT');
            expect(prompt).toContain('LICENSE_ADMIN');
            expect(prompt).not.toContain('CodeMeter hizmetini yeniden başlat');
        });

        it('includes consented ticket Hotinfo alongside structured license intake when supplied', async () => {
            const hotinfoSnapshot = { allplanVersion: 'Allplan 2026-1-3', allplanBuildId: '39.1613.8530.664' };
            mockPrisma.ticket.findUnique.mockResolvedValue({ ...cloudLicenseTicket, hotinfoSnapshot });
            mockEmbedding.search.mockResolvedValue({ results: [cloudSource] });
            mockAi.generate.mockResolvedValue('Connect lisans yöneticisi koltuk atamasını kontrol etmelidir.');

            await service.generateDraft('tik-1');

            expect(mockPromptBuilder.buildContext).toHaveBeenCalledWith(expect.objectContaining({
                allplanVersion: '2026',
                hotinfoSnapshot,
                skipHotinfoProfile: false,
            }));
        });

        it.each([
            ['empty', []],
            ['weak', [{ ...cloudSource, similarity: 0.1 }]],
        ])('requires manual review instead of invoking an LLM with %s retrieval', async (_case, results) => {
            mockPrisma.ticket.findUnique.mockResolvedValue(cloudLicenseTicket);
            mockEmbedding.search.mockResolvedValue({ results });

            const result = await service.generateDraft('tik-1');

            expect(mockAi.generate).not.toHaveBeenCalled();
            expect(result.draft).toMatch(/bilgi kaynağ|güvenilir|uzman|inceleme/i);
            expect(result.draft).not.toMatch(/CodeMeter hizmetini yeniden başlat/i);
        });

        it('does not use a legacy CodeMeter-only match as evidence for a 2026 cloud seat ticket', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(cloudLicenseTicket);
            mockEmbedding.search.mockResolvedValue({
                results: [{
                    id: 'legacy-codemeter',
                    licenseEra: 'codemeter_2016_2024_1_10',
                    title: 'ALLPLAN 2023 CodeMeter product key and license server',
                    content: 'CodeMeter hizmetini yeniden başlatın ve ürün anahtarıyla lisansı etkinleştirin.',
                    similarity: 0.98,
                }],
            });

            const result = await service.generateDraft('tik-1');

            expect(mockAi.generate).not.toHaveBeenCalled();
            expect(result.draft).toMatch(/bilgi kaynağ|güvenilir|uzman|inceleme/i);
            expect(result.draft).not.toContain('CodeMeter hizmetini yeniden başlatın');
        });

        it.each([
            ['2015', 'SINGLE_USER', 'legacy_pre_2016', 'codemeter_2016_2024_1_10'],
            ['2023', 'LICENSE_SERVER', 'codemeter_2016_2024_1_10', 'legacy_pre_2016'],
        ])('rejects mismatched licensing eras for %s', async (version, topology, _expectedEra, wrongEra) => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                licensingIntake: {
                    categoryKey: 'licensing',
                    allplanVersion: version,
                    licenseIssueType: 'ACTIVATION',
                    licenseTopology: topology,
                },
            });
            mockEmbedding.search.mockResolvedValue({ results: [{
                ...cloudSource,
                licenseEra: wrongEra,
            }] });

            const result = await service.generateDraft('tik-1');

            expect(mockAi.generate).not.toHaveBeenCalled();
            expect(result.reviewReason).toBe('LICENSE_ERA_MISMATCH');
        });

        it('does not trust untagged legacy material just because it mentions a newer year', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(cloudLicenseTicket);
            mockEmbedding.search.mockResolvedValue({ results: [{
                ...cloudSource,
                licenseEra: null,
                title: 'CodeMeter 2023 procedure with 2026 comparison',
                content: 'Restart CodeMeter service; 2026 differs.',
            }] });

            const result = await service.generateDraft('tik-1');

            expect(mockAi.generate).not.toHaveBeenCalled();
            expect(result.reviewReason).toBe('LICENSE_ERA_MISMATCH');
        });

        it('does not recycle the previous customer answer in a structured cloud license draft', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...cloudLicenseTicket,
                interaction: { responseGenerated: 'Restart CodeMeter service', userContext: {} },
            });
            mockEmbedding.search.mockResolvedValue({ results: [cloudSource] });
            mockAi.generate.mockResolvedValue('Connect üzerinden koltuk atamasını inceleyin.');

            await service.generateDraft('tik-1');

            expect(mockAi.generate.mock.calls[0]?.[0]).not.toContain('Restart CodeMeter service');
        });

        it('does not use hardcoded CodeMeter fallback when cloud-license generation has no answer', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...cloudLicenseTicket,
                description: 'Lisans sunucusu kullanıcı erişim hakkı görünmüyor',
            });
            mockEmbedding.search.mockResolvedValue({ results: [cloudSource] });
            mockAi.generate.mockResolvedValue('');

            const result = await service.generateDraft('tik-1');

            expect(result.reviewReason).toBe('GENERATION_ERROR');
            expect(result.draft).not.toMatch(/CodeMeter|lisans sunucusunda/i);
        });

        it('requires manual review for older licensing tickets without persisted choices', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                tags: [],
                department: { slug: 'billing-payments' },
                product: { name: 'ALLPLAN' },
                licensingIntake: null,
            });

            const result = await service.generateDraft('tik-1');

            expect(result.reviewReason).toBe('MISSING_LICENSING_INTAKE');
            expect(mockAi.generate).not.toHaveBeenCalled();
        });

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

        it('targets the ticket requester, not the support agent generating the draft', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                userId: 'customer-1',
                creator: {
                    id: 'customer-1',
                    fullName: 'Melih Dinekli',
                    language: 'tr',
                    customerProfile: { hotinfoData: {} },
                },
                messages: [
                    {
                        id: 'm2',
                        senderId: 'admin-1',
                        sender: { fullName: 'Hazar Volga' },
                        message: 'Admin internal review note',
                        isInternal: false,
                        attachments: [],
                    },
                    {
                        id: 'm1',
                        senderId: 'customer-1',
                        sender: { fullName: 'Melih Dinekli' },
                        message: 'License server istemcide otomatik bulunmuyor, manuel server nasıl eklenir?',
                        isInternal: false,
                        attachments: [],
                    },
                ],
            });
            mockAi.generate.mockResolvedValue('Generated draft response');

            await service.generateDraft('tik-1');

            const prompt = mockAi.generate.mock.calls[0][0];
            expect(prompt).toContain('[TICKET_RESPONSE_TARGET]');
            expect(prompt).toContain('Melih Dinekli');
            expect(prompt).toContain('The support agent/admin generating this draft is NOT the recipient');
            expect(prompt).toContain('Do not address Hazar Volga');
            expect(mockPromptBuilder.buildContext).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'customer-1',
                    userQuery: 'License server istemcide otomatik bulunmuyor, manuel server nasıl eklenir?',
                    messages: expect.arrayContaining([
                        expect.objectContaining({ role: 'user', content: expect.stringContaining('License server') }),
                        expect.objectContaining({ role: 'assistant', content: expect.stringContaining('Admin internal review note') }),
                    ]),
                }),
            );
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

        it('repairs admin drafts that use a Turkish greeting for an English ticket-opening interaction', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                subject: 'How to handle licenses when upgrading to Allplan 2024',
                description: 'What license issues do I need to consider when upgrading from Allplan 2021/2022/2023 to Allplan 2024?',
                interaction: {
                    userContext: {
                        responseLanguage: 'en',
                        requestLocale: 'en',
                    },
                },
                creator: { id: 'u1', fullName: 'hazarvolga', language: 'tr', customerProfile: { hotinfoData: {} } },
            });
            mockAi.generate
                .mockResolvedValueOnce([
                    'Merhaba hazarvolga,',
                    '',
                    '## 📌 Issue Summary',
                    'You are asking about license considerations for upgrading to Allplan 2024.',
                    '',
                    '## 🛠️ Solution Steps',
                    '1. Open CodeMeter Control Center and verify the license container.',
                ].join('\n'))
                .mockResolvedValueOnce([
                    'Hello hazarvolga,',
                    '',
                    '## 📌 Issue Summary',
                    'You are asking about license considerations for upgrading to Allplan 2024.',
                    '',
                    '## 🛠️ Solution Steps',
                    '1. Open CodeMeter Control Center and verify the license container.',
                ].join('\n'));

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('Hello hazarvolga,');
            expect(result.draft).not.toContain('Merhaba');
            expect(mockAi.generate).toHaveBeenCalledTimes(2);
            expect(mockAi.generate.mock.calls[1][0]).toContain('Rewrite the support agent draft below entirely in English.');
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

        it('returns ticket-opening visual evidence with the admin draft', async () => {
            const visuals = [
                {
                    url: 'https://learnnow.allplan.com/pluginfile.php/example/trial.png',
                    summary: 'FRILO trial button is highlighted.',
                    sourceTitle: 'Activating a FRILO trial version',
                    sourceId: 'learnnow-11851',
                },
            ];
            mockPrisma.ticket.findUnique.mockResolvedValue({
                ...mockTicket,
                interaction: {
                    responseGenerated: 'Hello, this FRILO trial answer has enough detail for reuse.',
                    userContext: {
                        responseLanguage: 'en',
                        requestLocale: 'en',
                        source: {
                            id: 'learnnow-11851',
                            title: 'Activating a FRILO trial version',
                        },
                        visuals,
                    },
                },
            });
            mockAi.generate.mockResolvedValue('Generated admin draft');

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toBe('Generated admin draft');
            expect(result.visuals).toEqual(visuals);
        });

        it('requires current retrieval instead of reusing an unverified linked opening answer', async () => {
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

            expect(result.draft).toMatch(/güvenilir|manuel incele/i);
            expect(mockAi.generate).not.toHaveBeenCalled();
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

        it('should return a safe manual-review message when AI generation fails', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockAi.generate.mockRejectedValue(new Error('AI Service Down'));

            const result = await service.generateDraft('tik-1');

            expect(result.draft).toContain('manuel inceleyin');
            expect(result.draft).not.toContain('AI Service Down');
            expect(result.reviewReason).toBe('GENERATION_ERROR');
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
