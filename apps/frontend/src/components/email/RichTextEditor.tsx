'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'İçerik girin...' }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[100px] p-4 bg-white/[0.02] border border-white/5 rounded-b-md',
            },
        },
    });

    // Sync internal editor state when parent content prop changes
    useEffect(() => {
        if (!editor) return;

        // Get current HTML from editor to compare
        const currentHtml = editor.getHTML();

        // Only update if the content prop is truly different from what's in the editor
        // We trim to avoid issues with whitespace-only differences
        if (content !== currentHtml) {
            editor.commands.setContent(content, { emitUpdate: false }); // don't emit update event
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center gap-1 p-1 bg-white/[0.05] border border-white/10 border-b-0 rounded-t-md overflow-x-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-white/10')}
                    type="button"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-white/10')}
                    type="button"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-white/10')}
                    type="button"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-white/10')}
                    type="button"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        const url = window.prompt('URL girin:');
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run();
                        }
                    }}
                    className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-white/10')}
                    type="button"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 p-0"
                    type="button"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 p-0"
                    type="button"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
