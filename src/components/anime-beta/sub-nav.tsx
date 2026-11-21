'use client';

import { Compass, History, House, Radio } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { ANIME_BASE, browseHref } from '~/lib/anime';
import { cn } from '~/lib/utils';

const ITEMS = [
  { href: ANIME_BASE, label: 'Beranda', icon: House },
  { href: browseHref(), label: 'Jelajah', icon: Compass },
  {
    href: browseHref({ status: 'airing' }),
    label: 'Sedang Tayang',
    icon: Radio,
  },
  { href: `${ANIME_BASE}/history`, label: 'Riwayat', icon: History },
] as const;

/** Section navigation + search, shown above every /beta/anime page. */
export function AnimeSubNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const airing = params.get('status') === 'airing';

  const isActive = (label: (typeof ITEMS)[number]['label']) => {
    switch (label) {
      case 'Beranda':
        return pathname === ANIME_BASE;
      case 'Jelajah':
        return pathname === `${ANIME_BASE}/browse` && !airing;
      case 'Sedang Tayang':
        return pathname === `${ANIME_BASE}/browse` && airing;
      case 'Riwayat':
        return pathname === `${ANIME_BASE}/history`;
    }
  };

  return (
    <div>
      <nav
        aria-label="Anime"
        className="no-scrollbar -mx-4 overflow-x-auto px-4"
      >
        <ul className="flex gap-1.5">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(label);

            return (
              <li key={label}>
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'accent-gradient'
                      : 'bg-amber-soft/60 hover:bg-amber-soft',
                  )}
                  href={href}
                >
                  <Icon className={cn('size-4', !active && 'text-accent')} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
