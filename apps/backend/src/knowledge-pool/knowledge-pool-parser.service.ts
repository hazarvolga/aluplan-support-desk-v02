import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';
import * as csv from 'csv-parser';

@Injectable()
export class KnowledgePoolParserService {
    private readonly logger = new Logger(KnowledgePoolParserService.name);

    async parsePdf(filePath: string): Promise<string> {
        const dataBuffer = fs.readFileSync(filePath);
        // @ts-ignore
        const data = await pdf(dataBuffer);
        return data.text;
    }

    async parseCsv(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const results: string[] = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(JSON.stringify(data)))
                .on('end', () => resolve(results.join('\n')))
                .on('error', (err) => reject(err));
        });
    }

    async parseTxt(filePath: string): Promise<string> {
        return fs.readFileSync(filePath, 'utf-8');
    }

    async parseMd(filePath: string): Promise<string> {
        return fs.readFileSync(filePath, 'utf-8');
    }

    async parseFile(type: string, filePath: string): Promise<string> {
        switch (type) {
            case 'FILE_PDF': return this.parsePdf(filePath);
            case 'FILE_CSV': return this.parseCsv(filePath);
            case 'FILE_TXT': return this.parseTxt(filePath);
            case 'FILE_MD': return this.parseMd(filePath);
            default: throw new Error(`Unsupported file type: ${type}`);
        }
    }
}
