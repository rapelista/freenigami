'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '~/lib/utils';

export interface PillTabItem<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

interface PillTabsProps<T extends string> {
  items: ReadonlyArray<PillTabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/**
 * Horizontal pill-shaped tabs; the active pill uses the amber gradient.
 */
export function PillTabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: PillTabsProps<T>) {
  return (
    <div
      aria-label={label}
      className={cn('no-scrollbar flex gap-2 overflow-x-auto', className)}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            aria-selected={active}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'accent-gradient'
                : 'bg-amber-soft/70 text-foreground hover:bg-amber-soft',
            )}
            role="tab"
            type="button"
            onClick={() => onChange(item.id)}
          >
            {Icon && (
              <Icon
                className={cn('size-4', active ? '' : 'text-accent')}
                strokeWidth={2.2}
              />
            )}
            {item.prefix && <span aria-hidden>{item.prefix}</span>}
            {item.label}
            {item.suffix}
          </button>
        );
      })}
    </div>
  );
}
