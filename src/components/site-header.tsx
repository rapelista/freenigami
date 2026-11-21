'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '~/lib/utils';
import { useSearchStore } from '~/stores/search';

export const NAV_ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/explore', label: 'Komik' },
  { href: '/bookmarks', label: 'Bookmark' },
] as const;

export function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const openSearch = useSearchStore((state) => state.setOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight"
          href="/"
        >
          FREENIGAMI
          <span className="rounded-md bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground">
            FREE
          </span>
        </Link>

        <nav aria-label="Main" className="mx-auto max-md:hidden">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex h-16 items-center text-sm font-semibold transition-colors hover:text-accent',
                      active &&
                        'text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent',
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            aria-keyshortcuts="Meta+K Control+K"
            aria-label="Cari (Ctrl+K)"
            className="flex h-10 items-center gap-2 rounded-full px-2.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
            type="button"
            onClick={() => openSearch(true)}
          >
            <Search className="size-5 text-foreground" />
            <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] lg:block">
              Ctrl K
            </kbd>
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav aria-label="Mobile" className="border-t border-border md:hidden">
        <ul className="grid grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-11 items-center justify-center text-sm font-semibold',
                    active &&
                      'text-accent after:absolute after:inset-x-6 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent',
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
