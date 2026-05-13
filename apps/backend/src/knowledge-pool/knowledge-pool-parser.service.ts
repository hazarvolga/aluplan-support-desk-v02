import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import csv from 'csv-parser';

@Injectable()
export class KnowledgePoolParserService {
    private readonly logger = new Logger(KnowledgePoolParserService.name);

    private fixEncoding(text: string): string {
        if (!text) return text;

        // If string contains any multi-byte character (char code > 255), 
        // it means its UTF-8 strings are already correctly decoded natively.
        for (let i = 0; i < text.length && i < 5000; i++) {
            if (text.charCodeAt(i) > 255) {
                return text;
            }
        }

        // Convert Latin1 (binary) encoded string to raw utf8 format.
        try {
            return Buffer.from(text, 'binary').toString('utf8');
        } catch {
            return text;
        }
    }

    async parsePdf(input: string | Buffer): Promise<string> {
        this.logger.debug(`Starting PDF parsing...`);
        try {
            const dataBuffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);

            const pdfParseLib: any = await import('pdf-parse');
            const PDFParse = pdfParseLib.PDFParse;

            if (typeof PDFParse !== 'function') {
                this.logger.error(`PDFParse constructor is not available. Type: ${typeof PDFParse}`);
                return '';
            }

            const parser = new PDFParse({ data: dataBuffer });
            try {
                const data = await parser.getText();
                this.logger.debug(`Completed PDF parsing. Extracted length: ${data?.text?.length || 0}`);
                return this.fixEncoding(data.text || '');
            } finally {
                await parser.destroy();
            }
        } catch (error: any) {
            this.logger.error(`Failed to parse PDF: ${error.message}`);
            return '';
        }
    }

    async parseCsv(input: string | Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            const results: string[] = [];
            const stream = Buffer.isBuffer(input)
                ? require('stream').Readable.from(input)
                : fs.createReadStream(input);

            stream.pipe(csv())
                .on('data', (data: any) => results.push(JSON.stringify(data)))
                .on('end', () => resolve(this.fixEncoding(results.join('\n'))))
                .on('error', (err: any) => reject(err));
        });
    }

    async parseTxt(input: string | Buffer): Promise<string> {
        const text = Buffer.isBuffer(input) ? input.toString('utf-8') : fs.readFileSync(input, 'utf-8');
        return this.fixEncoding(text);
    }

    async parseMd(input: string | Buffer): Promise<string> {
        const text = Buffer.isBuffer(input) ? input.toString('utf-8') : fs.readFileSync(input, 'utf-8');
        return this.fixEncoding(text);
    }

    async parseMsg(input: string | Buffer): Promise<string> {
        const { simpleParser } = await import('mailparser');
        const dataBuffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
        const parsed = await simpleParser(dataBuffer);
        const content = [
            `Subject: ${parsed.subject}`,
            `From: ${parsed.from?.text}`,
            `Date: ${parsed.date}`,
            `Content:`,
            parsed.text || parsed.html || ''
        ].join('\n');
        return this.fixEncoding(content);
    }

    async parseFile(type: string, input: string | Buffer): Promise<string> {
        switch (type) {
            case 'FILE_PDF': return this.parsePdf(input);
            case 'FILE_CSV': return this.parseCsv(input);
            case 'FILE_TXT': return this.parseTxt(input);
            case 'FILE_MD': return this.parseMd(input);
            case 'FILE_MSG': return this.parseMsg(input);
            default: throw new Error(`Unsupported file type: ${type}`);
        }
    }
}
