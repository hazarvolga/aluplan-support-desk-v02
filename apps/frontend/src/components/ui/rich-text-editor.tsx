'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TipTapLink from '@tiptap/extension-link';
import { Bold, Heading2, Heading3, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    onSubmit?: () => void;
    'aria-label'?: string;
}

const buttonClassName = 'h-8 w-8 p-0 rounded-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    disabled = false,
    className,
    onSubmit,
    'aria-label': ariaLabel,
}: RichTextEditorProps) {
    const t = useTranslations('richTextEditor.toolbar');
    const editor = useEditor({
        immediatelyRender: false,
        editable: !disabled,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TipTapLink.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-label': ariaLabel || placeholder || '',
                class: 'min-h-24 px-3 py-3 text-[13px] leading-relaxed outline-none prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_a]:text-cyan-400 [&_a]:underline hover:[&_a]:text-cyan-300',
            },
            handleKeyDown: (_view, event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !disabled) {
                    event.preventDefault();
                    onSubmit?.();
                    return true;
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!disabled);
    }, [disabled, editor]);

    useEffect(() => {
        if (!editor) return;
        const nextValue = value || '';
        if (nextValue !== editor.getHTML()) {
            editor.commands.setContent(nextValue);
        }
    }, [editor, value]);

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    const runCommand = (command: () => void) => {
        if (!editor || disabled) return;
        command();
        editor.chain().focus().run();
    };

    const toolbarButtons = [
        {
            label: t('bold'),
            icon: Bold,
            active: editor?.isActive('bold') ?? false,
            onClick: () => runCommand(() => editor?.chain().focus().toggleBold().run()),
        },
        {
            label: t('italic'),
            icon: Italic,
            active: editor?.isActive('italic') ?? false,
            onClick: () => runCommand(() => editor?.chain().focus().toggleItalic().run()),
        },
        {
            label: 'Link',
            icon: LinkIcon,
            active: editor?.isActive('link') ?? false,
            onClick: () => {
                if (!editor || disabled) return;
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL Girin (http:// veya https:// ile başlamalı):', previousUrl || '');
                if (url === null) return; // cancelled
                if (url === '') {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    return;
                }
                if (!/^https?:\/\//i.test(url)) {
                    window.alert('URL http:// veya https:// ile başlamalıdır!');
                    return;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            },
        },
        {
            label: t('bulletList'),
            icon: List,
            active: editor?.isActive('bulletList') ?? false,
            onClick: () => runCommand(() => editor?.chain().focus().toggleBulletList().run()),
        },
        {
            label: t('orderedList'),
            icon: ListOrdered,
            active: editor?.isActive('orderedList') ?? false,
            onClick: () => runCommand(() => editor?.chain().focus().toggleOrderedList().run()),
        },
        {
            label: t('heading2'),
            icon: Heading2,
            active: editor?.isActive('heading', { level: 2 }) ?? false,
            onClick: () => runCommand(() => editor?.chain().focus().toggleHeading({ level: 2 }).run()),
        },
        {
            label: t('heading3'),
            icon: Heading3,
            active: editor?.isActive('heading', { level: 3 }) ?? false,
            onClick: () => runCommand(() => editor?.chain().focus().toggleHeading({ level: 3 }).run()),
        },
    ];

    return (
        <div className={cn('rounded-md border border-border/40 bg-black/20 shadow-inner', disabled && 'opacity-70', className)}>
            <div className="flex items-center gap-1 border-b border-border/40 bg-muted/10 px-2 py-1">
                {toolbarButtons.map(({ label, icon: Icon, active, onClick }) => (
                    <Button
                        key={label}
                        type="button"
                        variant={active ? 'secondary' : 'ghost'}
                        size="icon"
                        aria-label={label}
                        aria-pressed={active}
                        disabled={disabled}
                        onClick={onClick}
                        className={cn(buttonClassName, disabled && 'cursor-not-allowed opacity-50')}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                ))}
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
