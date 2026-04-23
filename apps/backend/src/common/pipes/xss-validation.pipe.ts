import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

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

    private sanitize(obj: any): any {
        if (typeof obj === 'string') {
            // Remove any potentially dangerous HTML payload
            return purify.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitize(item));
        }

        if (typeof obj === 'object' && obj !== null) {
            const sanitizedObj: any = {};
            for (const key of Object.keys(obj)) {
                sanitizedObj[key] = this.sanitize(obj[key]);
            }
            return sanitizedObj;
        }

        // Return numbers, booleans, etc. as-is
        return obj;
    }
}
