import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DocAccordionItem {
  /** Unique value used by Radix to track open/closed state */
  id: string;
  /** Trigger label */
  title: string;
  /** Optional icon rendered before the title */
  icon?: LucideIcon;
  /** Content rendered inside the accordion panel */
  children: React.ReactNode;
}

export interface DocAccordionProps {
  items: DocAccordionItem[];
  /**
   * Which items are open by default.
   * Accepts an array of item ids (multi-open) or a single id (single-open).
   * Defaults to all items closed.
   */
  defaultValue?: string | string[];
  /** Additional class names applied to the root Accordion element */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocAccordion — wraps the base Accordion primitives with doc-specific styling.
 *
 * Supports multiple items open simultaneously (type="multiple").
 * Each item can optionally display a Lucide icon next to its title.
 */
export function DocAccordion({ items, defaultValue, className }: DocAccordionProps) {
  // Normalise defaultValue to always be an array for type="multiple"
  const defaultValues = defaultValue
    ? Array.isArray(defaultValue)
      ? defaultValue
      : [defaultValue]
    : [];

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultValues}
      className={cn('w-full', className)}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="gap-2 text-sm font-medium">
              {Icon && (
                <Icon
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="flex-1 text-left">{item.title}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-sm prose-invert max-w-none">
                {item.children}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
