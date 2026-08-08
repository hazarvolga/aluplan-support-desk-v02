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

/**
 * Every brand.* field actually present in the render context built by
 * email.templates.ts (compile) and email.controller.ts (preview) — see
 * `brandDefaults` in both call sites. Kept in sync manually; a field
 * referenced here that isn't in the real render context would itself be a
 * silent-empty bug, so this list is deliberately literal, not derived.
 */
const KNOWN_BRAND_FIELDS = new Set([
    'name',
    'logo_url',
    'api_base_url',
    'address',
    'phone',
    'email',
    'social_linkedin',
    'social_twitter',
    'social_facebook',
    'social_instagram',
    'social_pinterest',
    'help_center_url',
]);

/** Top-level (no-prefix) paths that exist in the render context regardless of template. */
const KNOWN_ROOT_PATHS = new Set(['unsubscribe_url']);

const BRACKET_PLACEHOLDER_PATTERN = /\[[\p{L}][\p{L}\p{N}\s]{0,60}\]/gu;

function visitParamOrSubExpression(node: hbs.AST.Expression | undefined, onPath: (path: hbs.AST.PathExpression) => void): void {
    if (!node) return;
    if (node.type === 'PathExpression') {
        onPath(node as hbs.AST.PathExpression);
        return;
    }
    if (node.type === 'SubExpression') {
        const sub = node as hbs.AST.SubExpression;
        onPath(sub.path);
        (sub.params ?? []).forEach((param) => visitParamOrSubExpression(param, onPath));
        visitHash(sub.hash, onPath);
    }
}

function visitHash(hash: hbs.AST.Hash | undefined, onPath: (path: hbs.AST.PathExpression) => void): void {
    if (!hash) return;
    (hash.pairs ?? []).forEach((pair) => visitParamOrSubExpression(pair.value, onPath));
}

/**
 * Walks a Handlebars template's AST and returns every distinct variable
 * path it references (e.g. "customer.firstName"), ignoring block helper
 * names (`if`/`each`/...), `@data` variables (`@index`), and `this`.
 *
 * Uses the real Handlebars parser instead of a regex so block helpers
 * (`{{#if x}}`), sub-expressions (`{{#if (lookup customer 'x')}}`), hash
 * arguments (`{{log value=customer.x}}`), partials, and comments are all
 * handled correctly rather than only the top-level mustache/block form.
 */
export function extractHandlebarsVariablePaths(template: string): string[] {
    const ast = Handlebars.parse(template);
    const paths = new Set<string>();

    const recordPath = (path: hbs.AST.PathExpression) => {
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
                visitParamOrSubExpression(mustache.path as hbs.AST.Expression, recordPath);
                (mustache.params ?? []).forEach((param) => visitParamOrSubExpression(param, recordPath));
                visitHash(mustache.hash, recordPath);
                break;
            }
            case 'BlockStatement': {
                const block = node as hbs.AST.BlockStatement;
                (block.params ?? []).forEach((param) => visitParamOrSubExpression(param, recordPath));
                visitHash(block.hash, recordPath);
                visit(block.program);
                visit(block.inverse);
                break;
            }
            case 'PartialStatement': {
                const partial = node as hbs.AST.PartialStatement;
                visitParamOrSubExpression(partial.name as hbs.AST.Expression, recordPath);
                (partial.params ?? []).forEach((param) => visitParamOrSubExpression(param, recordPath));
                visitHash(partial.hash, recordPath);
                break;
            }
            case 'PartialBlockStatement': {
                const partialBlock = node as hbs.AST.PartialBlockStatement;
                visitParamOrSubExpression(partialBlock.name as hbs.AST.Expression, recordPath);
                (partialBlock.params ?? []).forEach((param) => visitParamOrSubExpression(param, recordPath));
                visitHash(partialBlock.hash, recordPath);
                visit(partialBlock.program);
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
 * Any referenced path that isn't one of the variables actually present in
 * the announcement render context: `customer.<real field>`, `brand.<real
 * field>`, or the top-level `unsubscribe_url`. Everything else — an unknown
 * root (`{{unknownRoot}}`), a typo'd brand/customer field, a bare
 * `{{customer}}`/`{{brand}}` object reference, or a ticket/system field that
 * exists in the shared render context but is meaningless for announcements
 * (`{{ticketId}}`) — is rejected. This intentionally covers more than the
 * customer-only bug this module was originally built for (GAP report
 * BUG-02); Codex's independent review found the customer-only scope let
 * unrelated unknown variables through silently.
 */
export function findUnknownAnnouncementVariables(paths: string[]): string[] {
    return paths.filter((path) => {
        if (KNOWN_ROOT_PATHS.has(path)) return false;
        if (path.startsWith('customer.')) {
            const field = path.slice('customer.'.length);
            return !KNOWN_CUSTOMER_FIELDS.has(field as keyof AnnouncementEmailCustomerContext);
        }
        if (path.startsWith('brand.')) {
            const field = path.slice('brand.'.length);
            return !KNOWN_BRAND_FIELDS.has(field);
        }
        return true;
    });
}

/**
 * Subject-specific variant: `renderAnnouncementSubject()` only ever compiles
 * the subject against `{customer}` (see below) — it has no `brand` or
 * `unsubscribe_url` data available. A subject referencing `{{brand.name}}`
 * would pass `findUnknownAnnouncementVariables` (it's a real content
 * variable) but silently render empty in the subject, since that context
 * genuinely isn't there. So the subject is checked against a narrower,
 * customer-only allowlist that matches what it can actually resolve.
 */
export function findUnknownSubjectVariables(paths: string[]): string[] {
    return paths.filter((path) => {
        if (!path.startsWith('customer.')) return true;
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

    let subjectVariables: string[];
    let contentVariables: string[];
    try {
        subjectVariables = extractHandlebarsVariablePaths(subject);
        contentVariables = extractHandlebarsVariablePaths(contentMjml);
    } catch (error: any) {
        // Handlebars.parse() throws a raw parser exception for genuinely
        // malformed syntax (e.g. an unterminated `{{`, an unclosed
        // `{{#if}}`). The real send-time renderer would fail on this exact
        // content too (email.templates.ts also calls Handlebars.compile on
        // it), so rejecting it here — cleanly, before anything is queued —
        // is the correct fail-closed outcome, not an unhandled crash.
        throw new BadRequestException(
            `Announcement subject or content is not valid Handlebars syntax: ${error.message}`,
        );
    }
    const unknownVariables = [
        ...findUnknownSubjectVariables(subjectVariables),
        ...findUnknownAnnouncementVariables(contentVariables),
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
