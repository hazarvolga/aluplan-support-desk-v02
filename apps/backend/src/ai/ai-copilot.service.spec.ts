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
    });
});
