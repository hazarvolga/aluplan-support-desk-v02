import * as React from 'react';
import { Zap, AlertTriangle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Variant definitions
// ─────────────────────────────────────────────────────────────────────────────

const tipBoxVariants = cva(
  'flex gap-3 rounded-lg border p-4 text-sm',
  {
    variants: {
      variant: {
        tip:     'bg-amber-900/20  border-amber-500/20  text-amber-100',
        warning: 'bg-red-900/20    border-red-500/20    text-red-100',
        info:    'bg-blue-900/20   border-blue-500/20   text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

const iconVariants = cva('mt-0.5 h-4 w-4 shrink-0', {
  variants: {
    variant: {
      tip:     'text-amber-400',
      warning: 'text-red-400',
      info:    'text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TipBoxVariant = 'tip' | 'warning' | 'info';

export interface TipBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tipBoxVariants> {
  /** Optional bold title rendered above the body content */
  title?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon map
// ─────────────────────────────────────────────────────────────────────────────

const ICONS: Record<TipBoxVariant, React.ElementType> = {
  tip:     Zap,
  warning: AlertTriangle,
  info:    Info,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const TipBox = React.forwardRef<HTMLDivElement, TipBoxProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    const resolvedVariant: TipBoxVariant = variant ?? 'info';
    const Icon = ICONS[resolvedVariant];

    return (
      <div
        ref={ref}
        role="note"
        className={cn(tipBoxVariants({ variant: resolvedVariant }), className)}
        {...props}
      >
        {/* Icon column */}
        <Icon
          className={iconVariants({ variant: resolvedVariant })}
          aria-hidden="true"
        />

        {/* Content column */}
        <div className="flex-1 space-y-1">
          {title && (
            <p className="font-semibold leading-none tracking-tight">{title}</p>
          )}
          <div className="leading-relaxed [&_p]:mt-1">{children}</div>
        </div>
      </div>
    );
  },
);

TipBox.displayName = 'TipBox';

export { TipBox, tipBoxVariants, iconVariants };
