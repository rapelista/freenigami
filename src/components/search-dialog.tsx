'use client';

/* eslint-disable @next/next/no-img-element */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Check, Clock, Filter, Search, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { useDebounceValue } from 'usehooks-ts';

import { proxyImage, timeAgo } from '~/lib/format';
import { cn } from '~/lib/utils';
import { useSearchStore } from '~/stores/search';
import { trpc } from '~/trpc/client';

const RESULT_LIMIT = 7;
const TRENDING_LIMIT = 3;
/** Results shown under "Paling cocok"; the rest go under "Lainnya". */
const TOP_MATCHES = 2;

interface SearchItem {
  manga_id: string;
  title: string;
  cover_image_url: string;
  cover_portrait_url: string;
  latest_chapter_number?: number;
  latest_chapter_time?: string;
  rank?: number;
  taxonomy?: { Format?: { name: string }[] };
}

/**
 * Global search dialog. Opens from the header search button or with
 * Cmd/Ctrl+K anywhere in the app.
 */
export function SearchDialog() {
  const isOpen = useSearchStore((state) => state.isOpen);
  const setOpen = useSearchStore((state) => state.setOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!useSearchStore.getState().isOpen);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  return (
    <ModalOverlay
      isDismissable
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-3 pt-[10svh] backdrop-blur-[2px]',
        'data-[entering]:animate-fade-in data-[exiting]:animate-fade-in data-[exiting]:[animation-direction:reverse]',
      )}
      isOpen={isOpen}
      onOpenChange={setOpen}
    >
      <Modal className="w-full max-w-2xl outline-none data-[entering]:animate-fade-in">
        <Dialog
          aria-label="Cari komik"
          className="flex max-h-[75svh] flex-col overflow-hidden rounded-2xl border border-border bg-overlay shadow-2xl outline-none"
        >
          <SearchContent onClose={() => setOpen(false)} />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function SearchContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [debouncedQuery] = useDebounceValue(query.trim(), 300);

  const history = useSearchStore((state) => state.history);
  const addHistory = useSearchStore((state) => state.addHistory);
  const removeHistory = useSearchStore((state) => state.removeHistory);
  const clearHistory = useSearchStore((state) => state.clearHistory);

  const hasQuery = query.trim().length > 0;

  const results = useQuery({
    ...trpc.series.list.queryOptions(
      { q: debouncedQuery, page: 1, page_size: RESULT_LIMIT },
      { placeholderData: keepPreviousData },
    ),
    enabled: debouncedQuery.length > 0,
  });

  const trending = useQuery(
    trpc.series.list.queryOptions({
      page: 1,
      page_size: TRENDING_LIMIT,
      sort: 'popularity',
      sort_order: 'desc',
    }),
  );

  const items: SearchItem[] = hasQuery
    ? (results.data?.data ?? []).slice(0, RESULT_LIMIT)
    : (trending.data?.data ?? []).slice(0, TRENDING_LIMIT);

  // Keep the highlighted row in range when the list changes.
  const [listKey, setListKey] = useState('');
  const currentKey = items.map((item) => item.manga_id).join();

  if (listKey !== currentKey) {
    setListKey(currentKey);
    setActiveIndex(0);
  }

  const open = (item: SearchItem) => {
    if (hasQuery) addHistory(query);
    onClose();
    router.push(`/series/${item.manga_id}`);
  };

  const exploreHref = `/explore?search=${encodeURIComponent(query.trim())}`;

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && items.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
    } else if (event.key === 'ArrowUp' && items.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();

      const item = items[activeIndex];

      if (item) {
        open(item);
      } else if (hasQuery) {
        addHistory(query);
        onClose();
        router.push(exploreHref);
      }
    }
  };

  const isSearching =
    hasQuery && (results.isFetching || debouncedQuery !== query.trim());
  const noResults =
    hasQuery && !isSearching && results.isSuccess && items.length === 0;

  return (
    <>
      <Heading className="sr-only" slot="title">
        Cari komik
      </Heading>

      <div className="p-3">
        <div className="flex h-12 items-center gap-2 rounded-xl border-2 border-accent/80 bg-(--field-background) px-3 shadow-[0_0_0_4px] shadow-accent/15">
          {hasQuery ? (
            <button
              aria-label="Hapus pencarian"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted hover:text-foreground"
              type="button"
              onClick={() => setQuery('')}
            >
              <X className="size-4" />
            </button>
          ) : (
            <Search className="size-4 shrink-0 text-muted" />
          )}

          <input
            autoFocus
            aria-activedescendant={
              items[activeIndex]
                ? `search-item-${items[activeIndex].manga_id}`
                : undefined
            }
            aria-controls="search-results"
            aria-expanded={items.length > 0}
            aria-label="Cari judul komik"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            placeholder="Cari judul komik..."
            role="combobox"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
            Esc
          </kbd>

          <span className="h-6 w-px shrink-0 bg-border" />

          <Link
            aria-label="Cari dengan filter"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-amber-soft"
            href={hasQuery ? exploreHref : '/explore'}
            title="Cari dengan filter"
            onClick={() => {
              if (hasQuery) addHistory(query);
              onClose();
            }}
          >
            <Filter className="size-4" />
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2" id="search-results">
        {!hasQuery && (
          <section className="px-3 pb-2">
            <div className="flex items-center justify-between px-2 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-accent">
                Riwayat
              </h3>
              {history.length > 0 && (
                <button
                  className="text-xs text-muted hover:text-foreground"
                  type="button"
                  onClick={clearHistory}
                >
                  Hapus semua
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="px-2 py-3 text-sm">
                <p>Belum ada riwayat pencarian</p>
                <p className="text-muted">Coba cari judul komik favoritmu</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 px-2">
                {history.map((term) => (
                  <span
                    key={term}
                    className="flex h-8 items-center gap-1 rounded-lg bg-amber-soft/70 pl-2.5 text-sm"
                  >
                    <Clock className="size-3.5 text-muted" />
                    <button
                      className="max-w-48 truncate hover:text-accent"
                      type="button"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                    <button
                      aria-label={`Hapus "${term}" dari riwayat`}
                      className="flex size-7 items-center justify-center text-muted hover:text-foreground"
                      type="button"
                      onClick={() => removeHistory(term)}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {!hasQuery ? (
          <ResultGroup
            showRank
            activeIndex={activeIndex}
            icon={<TrendingUp className="size-3.5" />}
            items={items}
            loading={trending.isLoading}
            startIndex={0}
            title="Lagi trending"
            onHover={setActiveIndex}
            onSelect={open}
          />
        ) : (
          <>
            <ResultGroup
              activeIndex={activeIndex}
              items={items.slice(0, TOP_MATCHES)}
              loading={results.isLoading || (isSearching && !results.data)}
              startIndex={0}
              title="Paling cocok"
              onHover={setActiveIndex}
              onSelect={open}
            />
            {items.length > TOP_MATCHES && (
              <ResultGroup
                activeIndex={activeIndex}
                items={items.slice(TOP_MATCHES)}
                startIndex={TOP_MATCHES}
                title="Lainnya"
                onHover={setActiveIndex}
                onSelect={open}
              />
            )}
          </>
        )}

        {noResults && (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Tidak ada komik yang cocok dengan &ldquo;{query.trim()}&rdquo;.
          </p>
        )}

        {items.length > 0 && (
          <p
            aria-live="polite"
            className={cn(
              'pt-2 text-center text-sm text-muted transition-opacity',
              isSearching && 'opacity-50',
            )}
          >
            <span className="font-semibold text-accent">{items.length}</span>{' '}
            {hasQuery ? 'hasil' : 'judul'}
          </p>
        )}
      </div>
    </>
  );
}

function ResultGroup({
  title,
  icon,
  items,
  startIndex,
  activeIndex,
  loading,
  showRank,
  onHover,
  onSelect,
}: {
  title: string;
  icon?: React.ReactNode;
  items: SearchItem[];
  startIndex: number;
  activeIndex: number;
  loading?: boolean;
  showRank?: boolean;
  onHover: (index: number) => void;
  onSelect: (item: SearchItem) => void;
}) {
  if (!loading && items.length === 0) return null;

  return (
    <section>
      <h3 className="flex items-center gap-1.5 px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-accent">
        {icon}
        {title}
      </h3>

      <ul aria-label={title} role="listbox">
        {loading && items.length === 0
          ? Array.from({ length: 2 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-2">
                <span className="h-14 w-10 animate-pulse rounded-md bg-surface-secondary" />
                <span className="h-4 w-1/2 animate-pulse rounded bg-surface-secondary" />
              </li>
            ))
          : items.map((item, i) => {
              const index = startIndex + i;
              const active = index === activeIndex;
              const format = item.taxonomy?.Format?.[0]?.name;

              return (
                <li
                  key={item.manga_id}
                  aria-selected={active}
                  id={`search-item-${item.manga_id}`}
                  role="option"
                >
                  <button
                    className={cn(
                      'relative flex w-full items-center gap-3 px-5 py-2 text-left transition-colors',
                      active && 'bg-surface-secondary',
                    )}
                    tabIndex={-1}
                    type="button"
                    onClick={() => onSelect(item)}
                    onMouseMove={() => onHover(index)}
                  >
                    {active && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-accent" />
                    )}
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-surface-secondary">
                      <img
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                        src={proxyImage(
                          item.cover_portrait_url || item.cover_image_url,
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {item.title}
                      </span>
                      {item.latest_chapter_number !== undefined && (
                        <span className="block text-xs text-muted">
                          Ch.{item.latest_chapter_number}
                          {item.latest_chapter_time &&
                            ` · ${timeAgo(item.latest_chapter_time)}`}
                        </span>
                      )}
                    </span>
                    {format && (
                      <span className="shrink-0 rounded-md bg-amber-soft px-2 py-1 text-xs">
                        {format}
                      </span>
                    )}
                    {showRank && (
                      <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold text-accent">
                        #{index + 1}
                      </span>
                    )}
                    {active && !showRank && (
                      <Check className="size-4 shrink-0 text-accent" />
                    )}
                  </button>
                </li>
              );
            })}
      </ul>
    </section>
  );
}
