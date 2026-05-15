'use client';

import { cn } from '@/lib/utils';
import { ContentSanitizer } from '@/lib/content-sanitizer';

interface RichTextRendererProps {
    content: string | null | undefined;
    className?: string;
}

const richTextClassName = [
    'rich-text-content text-[13px] leading-relaxed tracking-tight',
    '[&_strong]:font-bold [&_em]:italic',
    '[&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1',
    '[&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:space-y-1',
    '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1',
    '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1',
    '[&_p]:mb-2 [&_p:last-child]:mb-0',
    '[&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80',
    '[&_code]:font-mono [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded',
    '[&_pre]:font-mono [&_pre]:text-xs [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto',
    '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
].join(' ');

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
    if (!content) return null;

    if (!ContentSanitizer.containsAllowedHtml(content)) {
        const text = ContentSanitizer.sanitize(content);
        if (!text.trim()) return null;
        return <p className={cn(richTextClassName, className)}>{text}</p>;
    }

    const html = ContentSanitizer.sanitize(content);
    if (!html.trim()) return null;

    return (
        <div
            className={cn(richTextClassName, className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

