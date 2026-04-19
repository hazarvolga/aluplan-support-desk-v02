import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DocumentAiService {
    private readonly logger = new Logger(DocumentAiService.name);
    private client: DocumentProcessorServiceClient | null = null;
    private initialized = false;

    constructor(
        private readonly config: ConfigService,
        @InjectQueue('document-parsing') private readonly parsingQueue: Queue,
    ) { }

    private initClient(): DocumentProcessorServiceClient | null {
        if (this.initialized && this.client) return this.client;

        try {
            this.client = new DocumentProcessorServiceClient();
            this.initialized = true;
            return this.client;
        } catch (error) {
            this.logger.error(`❌ Failed to initialize Document AI client: ${error.message}`);
            return null;
        }
    }

    /**
     * Enqueues a heavy PDF for asynchronous Document AI Batch Processing
     */
    async enqueueManualForParsing(fileUrl: string, manualId: string, mimeType = 'application/pdf') {
        const job = await this.parsingQueue.add('parse-pdf', {
            fileUrl,
            manualId,
            mimeType
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });

        this.logger.log(`📦 Enqueued manual ${manualId} for Document AI Parsing (Job ID: ${job.id})`);
        return job;
    }

    /**
     * Synchronous Document AI parsing for smaller files (under 15 pages)
     */
    async parseDocumentSync(fileBuffer: Buffer, mimeType: string, processorId: string) {
        const client = this.initClient();
        if (!client) throw new Error('Document AI client not initialized');

        const projectId = this.config.get<string>('gcp.projectId');
        const location = this.config.get<string>('gcp.region') || 'eu'; // Document AI usually uses 'eu' or 'us'

        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

        const request = {
            name,
            rawDocument: {
                content: fileBuffer.toString('base64'),
                mimeType,
            },
        };

        try {
            const [result] = await client.processDocument(request);
            const { document } = result;
            return document;
        } catch (error) {
            this.logger.error(`❌ Document AI Sync Parse Failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Extracts text, tables, and logical chunks from Document AI schema
     * Highly optimized to preserve ALLPLAN metraj (quantity) tables.
     */
    extractLogicalChunks(document: any): string[] {
        const { text, pages } = document;
        const chunks: string[] = [];

        if (!pages || pages.length === 0) {
            return [text]; // Fallback to raw text if no layout is parsed
        }

        pages.forEach((page: any, pageIndex: number) => {
            // Extract Tables First
            if (page.tables) {
                page.tables.forEach((table: any) => {
                    let tableMarkdown = `\n### [Tablo - Sayfa ${pageIndex + 1}]\n`;
                    table.headerRows?.forEach((headerRow: any) => {
                        const rowText = this.extractRowText(headerRow, text);
                        tableMarkdown += `| ${rowText.join(' | ')} |\n`;
                        tableMarkdown += `| ${rowText.map(() => '---').join(' | ')} |\n`;
                    });
                    table.bodyRows?.forEach((bodyRow: any) => {
                        const rowText = this.extractRowText(bodyRow, text);
                        tableMarkdown += `| ${rowText.join(' | ')} |\n`;
                    });
                    chunks.push(tableMarkdown);
                });
            }

            // Extract Paragraphs
            if (page.paragraphs) {
                page.paragraphs.forEach((para: any) => {
                    const paraText = this.extractTextSegment(para.layout.textAnchor, text);
                    if (paraText.trim().length > 20) { // Ignore tiny noise
                        chunks.push(paraText);
                    }
                });
            }
        });

        return chunks;
    }

    private extractRowText(row: any, fullText: string): string[] {
        return row.cells.map((cell: any) => {
            return this.extractTextSegment(cell.layout.textAnchor, fullText).replace(/\n/g, ' ').trim();
        });
    }

    private extractTextSegment(textAnchor: any, fullText: string): string {
        if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
            return '';
        }
        let segmentText = '';
        for (const segment of textAnchor.textSegments) {
            const startIndex = segment.startIndex || 0;
            const endIndex = segment.endIndex;
            segmentText += fullText.substring(startIndex, endIndex);
        }
        return segmentText;
    }
}
