'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserMenu } from '~/components/(panel)/user-menu';
import { cn } from '~/lib/utils';

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
          <Link
            aria-label="Cari"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
            href="/explore"
          >
            <Search className="size-5" />
          </Link>

          <UserMenu />
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
