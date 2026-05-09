import * as React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  /** The code / path string to display */
  code: string;
  /**
   * Language hint — used as a data attribute for potential syntax-highlight
   * integrations. Defaults to 'text'.
   */
  language?: 'bash' | 'path' | 'text' | string;
  /**
   * When true, renders as an inline `<code>` element.
   * When false (default), renders as a `<pre><code>` block.
   */
  inline?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CodeBlock — renders technical paths, commands, or code snippets.
 *
 * Inline mode:  `<code>` — suitable for embedding inside prose.
 * Block mode:   `<pre><code>` — full-width, horizontally scrollable.
 */
const CodeBlock = React.forwardRef<HTMLElement, CodeBlockProps>(
  ({ code, language = 'text', inline = false, className, ...props }, ref) => {
    if (inline) {
      return (
        <code
          ref={ref as React.Ref<HTMLElement>}
          data-language={language}
          className={cn(
            'rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm',
            className,
          )}
          {...props}
        >
          {code}
        </code>
      );
    }

    return (
      <pre
        ref={ref as React.Ref<HTMLPreElement>}
        data-language={language}
        className={cn(
          'overflow-x-auto rounded-lg border border-white/10 bg-slate-950 p-4',
          className,
        )}
        {...(props as React.HTMLAttributes<HTMLPreElement>)}
      >
        <code className="font-mono text-sm leading-relaxed text-slate-200">
          {code}
        </code>
      </pre>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };
