'use client';

import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { markdownToHtml } from '@/lib/markdown-to-html';

export function AiAnswerContent({ content, className }: { content: string | null | undefined; className?: string }) {
    if (!content?.trim()) return null;
    return <RichTextRenderer content={markdownToHtml(content)} className={className} />;
}
