import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { sanitizeRichTextHtml, stripHtml } from '../utils/rich-text-sanitizer';

/**
 * GAP-14: Backend HTML Sanitization
 * A global pipe that recursively sanitizes any string inputs
 * to protect against XSS (Cross-Site Scripting) attacks.
 */
@Injectable()
export class XssValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) return value;

        // Only sanitize body and query payloads
        if (metadata.type !== 'body' && metadata.type !== 'query') {
            return value;
        }

        return this.sanitize(value);
    }

    private sanitize(obj: any, key?: string, parent?: any): any {
        if (typeof obj === 'string') {
            if (key === 'message' && parent?.contentFormat === 'HTML') {
                return sanitizeRichTextHtml(obj);
            }

            return stripHtml(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitize(item));
        }

        if (typeof obj === 'object' && obj !== null) {
            const sanitizedObj: any = {};
            for (const key of Object.keys(obj)) {
                sanitizedObj[key] = this.sanitize(obj[key], key, obj);
            }
            return sanitizedObj;
        }

        // Return numbers, booleans, etc. as-is
        return obj;
    }
}
