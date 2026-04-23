import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires

import * as mammoth from 'mammoth';
import * as xlsx from 'xlsx';

@Injectable()
export class DocumentParserService {
    private readonly logger = new Logger(DocumentParserService.name);
    private readonly MAX_TEXT_LENGTH = 10000; // Limit to 10k chars to protect token budget

    /**
     * Extracts plain text from various document types (PDF, DOCX, XLSX, TXT)
     * Throttles the output to MAX_TEXT_LENGTH to prevent LLM context overflow.
     */
    async extractText(mimeType: string, buffer: Buffer): Promise<string | null> {
        try {
            let extractedText = '';

            if (mimeType === 'application/pdf') {
                let pdfParseLib: any = await import('pdf-parse');
                pdfParseLib = typeof pdfParseLib !== 'function' && pdfParseLib.default ? pdfParseLib.default : pdfParseLib;
                const data = await pdfParseLib(buffer);
                extractedText = data.text;
            } else if (
                mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                mimeType === 'application/msword'
            ) {
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
            } else if (
                mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                mimeType === 'application/vnd.ms-excel'
            ) {
                const workbook = xlsx.read(buffer, { type: 'buffer' });
                const sheetNameList = workbook.SheetNames;

                sheetNameList.forEach(sheetName => {
                    extractedText += `\n--- Sheet: ${sheetName} ---\n`;
                    const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                    extractedText += csvData;
                });
            } else if (mimeType.startsWith('text/') || mimeType === 'application/json') {
                extractedText = buffer.toString('utf-8');
            } else {
                this.logger.debug(`Unsupported document type for parsing: ${mimeType}`);
                return null;
            }

            if (!extractedText || extractedText.trim().length === 0) {
                return null;
            }

            // Cleanup whitespace to save tokens
            extractedText = extractedText.replace(/\s+/g, ' ').trim();

            // Limit length
            if (extractedText.length > this.MAX_TEXT_LENGTH) {
                this.logger.debug(`Truncating document text from ${extractedText.length} to ${this.MAX_TEXT_LENGTH}`);
                extractedText = extractedText.substring(0, this.MAX_TEXT_LENGTH) + '... [METİN ÇOK UZUN OLDUĞU İÇİN KESİLDİ - SADECE İLK KISIM GöSTERİLMEKTEDİR]';
            }

            return extractedText;

        } catch (e: any) {
            this.logger.error(`Document Parsing Failed for mimeType ${mimeType}: ${e.message}`);
            return null;
        }
    }
}
