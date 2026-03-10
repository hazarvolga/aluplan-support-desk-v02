import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import * as csv from 'csv-parser';

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

    async parsePdf(filePath: string): Promise<string> {
        this.logger.debug(`Starting PDF parsing for: ${filePath}`);
        const dataBuffer = fs.readFileSync(filePath);
        const data = await (pdf as any)(dataBuffer);
        this.logger.debug(`Completed PDF parsing for: ${filePath}. extracted length: ${data?.text?.length || 0}`);
        return this.fixEncoding(data.text);
    }

    async parseCsv(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const results: string[] = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data: any) => results.push(JSON.stringify(data)))
                .on('end', () => resolve(this.fixEncoding(results.join('\n'))))
                .on('error', (err: any) => reject(err));
        });
    }

    async parseTxt(filePath: string): Promise<string> {
        return this.fixEncoding(fs.readFileSync(filePath, 'utf-8'));
    }

    async parseMd(filePath: string): Promise<string> {
        return this.fixEncoding(fs.readFileSync(filePath, 'utf-8'));
    }

    async parseMsg(filePath: string): Promise<string> {
        const { simpleParser } = await import('mailparser');
        const dataBuffer = fs.readFileSync(filePath);
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

    async parseFile(type: string, filePath: string): Promise<string> {
        switch (type) {
            case 'FILE_PDF': return this.parsePdf(filePath);
            case 'FILE_CSV': return this.parseCsv(filePath);
            case 'FILE_TXT': return this.parseTxt(filePath);
            case 'FILE_MD': return this.parseMd(filePath);
            case 'FILE_MSG': return this.parseMsg(filePath);
            default: throw new Error(`Unsupported file type: ${type}`);
        }
    }
}

