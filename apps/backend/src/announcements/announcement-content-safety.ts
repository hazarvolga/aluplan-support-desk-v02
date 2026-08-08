import { BadRequestException } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { AnnouncementEmailCustomerContext } from './announcement-email-context';

// `@types/handlebars` declares its AST types (Node, Program, PathExpression, ...)
// under the ambient global namespace `hbs`, not as exports of the "handlebars"
// module — so they're referenced here as global types (`hbs.AST.*`), not imported.

/**
 * Every real key on AnnouncementEmailCustomerContext. Kept as a literal list
 * (not `Object.keys(...)`) so a typo in a `{{customer.*}}` variable — the
 * root cause of GAP report BUG-02 — is caught even before a real customer
 * object is built.
 */
const KNOWN_CUSTOMER_FIELDS = new Set<keyof AnnouncementEmailCustomerContext>([
    'firstName',
    'lastName',
    'fullName',
    'companyName',
    'customerNo',
    'email',
    'userEmail',
]);

const BRACKET_PLACEHOLDER_PATTERN = /\[[\p{L}][\p{L}\p{N}\s]{0,60}\]/gu;

/**
 * Walks a Handlebars template's AST and returns every distinct variable
 * path it references (e.g. "customer.firstName"), ignoring block helper
 * names (`if`/`each`/...), `@data` variables (`@index`), and `this`.
 *
 * Uses the real Handlebars parser instead of a regex so block helpers
 * (`{{#if x}}`), sub-expressions, and comments are handled correctly.
 */
export function extractHandlebarsVariablePaths(template: string): string[] {
    const ast = Handlebars.parse(template);
    const paths = new Set<string>();

    const visitPath = (node: hbs.AST.Expression | undefined) => {
        if (!node || node.type !== 'PathExpression') return;
        const path = node as hbs.AST.PathExpression;
        if (path.data) return; // @index, @key, ...
        if (path.original === 'this' || path.original === '.') return;
        paths.add(path.original);
    };

    const visit = (node: hbs.AST.Node | undefined) => {
        if (!node) return;
        switch (node.type) {
            case 'Program': {
                const program = node as hbs.AST.Program;
                program.body.forEach((statement) => visit(statement));
                break;
            }
            case 'MustacheStatement': {
                const mustache = node as hbs.AST.MustacheStatement;
                visitPath(mustache.path);
                (mustache.params ?? []).forEach((param) => visitPath(param));
                break;
            }
            case 'BlockStatement': {
                const block = node as hbs.AST.BlockStatement;
                (block.params ?? []).forEach((param) => visitPath(param));
                visit(block.program);
                visit(block.inverse);
                break;
            }
            default:
                break;
        }
    };

    visit(ast);
    return Array.from(paths);
}

/**
 * `customer.*` paths that are not one of the real AnnouncementEmailCustomerContext
 * fields. Non-`customer.*` paths (brand.*, unsubscribe_url, ...) are left
 * alone — the announcement personalization bug this guards against is
 * specifically about the `customer` shape.
 */
export function findUnknownCustomerVariables(paths: string[]): string[] {
    return paths.filter((path) => {
        if (!path.startsWith('customer.')) return false;
        const field = path.slice('customer.'.length);
        return !KNOWN_CUSTOMER_FIELDS.has(field as keyof AnnouncementEmailCustomerContext);
    });
}

/** Manual `[Placeholder]`-style text an admin was meant to replace by hand. */
export function findLeftoverBracketPlaceholders(text: string): string[] {
    const matches = text.match(BRACKET_PLACEHOLDER_PATTERN) ?? [];
    return Array.from(new Set(matches));
}

/**
 * Fail-closed guard run once per announcement, before any customer is
 * queried or any email is enqueued. Throws BadRequestException — never
 * sends silently-broken content.
 */
export function assertAnnouncementContentIsSafeToSend(subject: string, contentMjml: string): void {
    const combinedText = `${subject}\n${contentMjml}`;

    const bracketPlaceholders = findLeftoverBracketPlaceholders(combinedText);
    if (bracketPlaceholders.length > 0) {
        throw new BadRequestException(
            `Announcement contains unresolved placeholder text: ${bracketPlaceholders.join(', ')}`,
        );
    }

    const subjectVariables = extractHandlebarsVariablePaths(subject);
    const contentVariables = extractHandlebarsVariablePaths(contentMjml);
    const unknownVariables = [
        ...findUnknownCustomerVariables(subjectVariables),
        ...findUnknownCustomerVariables(contentVariables),
    ];
    if (unknownVariables.length > 0) {
        throw new BadRequestException(
            `Announcement references unsupported variables: ${Array.from(new Set(unknownVariables)).join(', ')}`,
        );
    }
}

/**
 * Renders the announcement subject through the same customer context the
 * body uses. `noEscape: true` matches the body's rendering options — the
 * subject is plain text, so HTML-escaping (e.g. "A & B" -> "A &amp; B")
 * would be visibly wrong.
 */
export function renderAnnouncementSubject(
    subject: string,
    context: AnnouncementEmailCustomerContext,
): string {
    return Handlebars.compile(subject, { noEscape: true })({ customer: context });
}
