'use client';

import { Dropdown, Label } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ArrowUpDown,
  Search,
  SearchX,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from 'lucide-react';
import { debounce, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { Pagination } from '~/components/ui/pagination';
import {
  ANIME_SORTS,
  ANIME_STATUSES,
  type AnimeSort,
  SORT_LABEL,
  STATUS_LABEL,
} from '~/lib/anime';
import { browseParsers } from '~/lib/anime-parsers';
import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

import { ANIME_GRID, AnimeCardItem, AnimeCardSkeleton } from './card';

const PAGE_SIZE = 24;
const SEARCH_DELAY = 300;
const COLLAPSED_GENRES = 18;

type Params = ReturnType<typeof useQueryStates<typeof browseParsers>>[0];
type Update = Partial<Record<keyof Params, unknown>>;

const EMPTY_FILTERS = {
  genre: null,
  format: null,
  status: null,
  year: null,
  studio: null,
} as const;

export function AnimeBrowse() {
  const [params, setParams] = useQueryStates(browseParsers);
  const [open, setOpen] = useState(false);

  // Any filter change goes back to the first page.
  const update = (values: Update) =>
    setParams({ ...values, page: null } as Parameters<typeof setParams>[0]);

  // The field follows every keystroke (nuqs state is immediate); the URL
  // and the query only catch up after a pause in typing.
  const setSearch = (value: string) =>
    setParams(
      { search: value || null, page: null },
      { history: 'replace', limitUrlUpdates: debounce(SEARCH_DELAY) },
    );
  const [debounced] = useDebounceValue(params.search, SEARCH_DELAY);
  // Clearing the field applies at once rather than after the pause.
  const query = (params.search ? debounced : '').trim();

  // "relevance" only means something while searching.
  const sort: AnimeSort =
    params.sort && (params.sort !== 'relevance' || query)
      ? params.sort
      : query
        ? 'relevance'
        : 'updated';

  const facets = useQuery({
    ...trpc.anime.facets.queryOptions(),
    staleTime: 10 * 60_000,
  });

  const result = useQuery({
    ...trpc.anime.browse.queryOptions({
      search: query || undefined,
      genres: params.genre,
      format: params.format,
      status: params.status,
      year: params.year,
      studio: params.studio,
      sort,
      page: params.page,
      pageSize: PAGE_SIZE,
    }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const chips: Array<{ key: string; label: string; remove: () => void }> = [
    ...(params.status
      ? [
          {
            key: 'status',
            label: STATUS_LABEL[params.status],
            remove: () => update({ status: null }),
          },
        ]
      : []),
    ...(params.format
      ? [
          {
            key: 'format',
            label: params.format,
            remove: () => update({ format: null }),
          },
        ]
      : []),
    ...(params.year
      ? [
          {
            key: 'year',
            label: String(params.year),
            remove: () => update({ year: null }),
          },
        ]
      : []),
    ...(params.studio
      ? [
          {
            key: 'studio',
            label: `Studio: ${params.studio}`,
            remove: () => update({ studio: null }),
          },
        ]
      : []),
    ...params.genre.map((g) => ({
      key: `genre-${g}`,
      label: g,
      remove: () => update({ genre: params.genre.filter((x) => x !== g) }),
    })),
  ];

  const data = result.data;
  const heading =
    params.status === 'airing' ? 'Sedang Tayang' : 'Jelajah Anime';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">{heading}</h1>
        {data && (
          <p aria-live="polite" className="text-sm text-muted">
            {query ? (
              <>
                hasil untuk “<span className="text-foreground">{query}</span>”
              </>
            ) : (
              <>{data.total.toLocaleString('id-ID')} anime</>
            )}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Cari judul, studio, atau genre</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full rounded-xl border border-border bg-(--field-background) pr-9 pl-9 text-sm outline-none placeholder:text-muted focus:border-accent"
              enterKeyHint="search"
              placeholder="Cari judul, studio, genre, atau sinopsis…"
              type="text"
              value={params.search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {params.search && (
              <button
                aria-label="Hapus pencarian"
                className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-foreground"
                type="button"
                onClick={() =>
                  setParams(
                    { search: null, page: null },
                    { history: 'replace' },
                  )
                }
              >
                <X className="size-4" />
              </button>
            )}
          </label>

          <button
            aria-controls="anime-filters"
            aria-expanded={open}
            className={cn(
              'relative flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors',
              open ? 'accent-gradient' : 'bg-amber-soft hover:bg-amber-soft/70',
            )}
            type="button"
            onClick={() => setOpen((v) => !v)}
          >
            <SlidersHorizontal
              className={cn('size-4', !open && 'text-accent')}
            />
            <span className="max-sm:hidden">Filter</span>
            {chips.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground max-sm:absolute max-sm:-top-1.5 max-sm:-right-1.5">
                {chips.length}
              </span>
            )}
          </button>

          <Dropdown>
            <Dropdown.Trigger
              aria-label={`Urutkan: ${SORT_LABEL[sort]}`}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-amber-soft px-3.5 text-sm font-semibold outline-none transition-colors hover:bg-amber-soft/70 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowUpDown className="size-4 text-accent" />
              <span className="max-sm:hidden">{SORT_LABEL[sort]}</span>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu
                disallowEmptySelection
                selectedKeys={new Set([sort])}
                selectionMode="single"
                onAction={(key) => update({ sort: key as AnimeSort })}
              >
                {ANIME_SORTS.filter((s) => s !== 'relevance' || query).map(
                  (s) => (
                    <Dropdown.Item key={s} id={s} textValue={SORT_LABEL[s]}>
                      <Label>{SORT_LABEL[s]}</Label>
                      <Dropdown.ItemIndicator />
                    </Dropdown.Item>
                  ),
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {open && (
          <FilterPanel
            facets={facets.data}
            params={params}
            onClear={() => update(EMPTY_FILTERS)}
            onUpdate={update}
          />
        )}

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                aria-label={`Hapus filter ${chip.label}`}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-amber-soft px-3 text-sm transition-colors hover:bg-amber-soft/70"
                type="button"
                onClick={chip.remove}
              >
                {chip.label}
                <X className="size-3.5 text-accent" />
              </button>
            ))}
            <button
              className="px-1 text-sm font-medium text-accent underline underline-offset-4 hover:text-amber-deep"
              type="button"
              onClick={() => update(EMPTY_FILTERS)}
            >
              Hapus semua
            </button>
          </div>
        )}
      </div>

      {result.isError && !data ? (
        <EmptyState
          action={{ label: 'Coba lagi', onClick: () => result.refetch() }}
          icon={TriangleAlert}
          text="Katalog anime belum bisa dimuat. Pemuatan pertama bisa memakan waktu sekitar 10 detik."
          title="Gagal memuat katalog"
        />
      ) : !data ? (
        <div className={ANIME_GRID}>
          {Array.from({ length: 12 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          action={
            chips.length || params.search
              ? {
                  label: 'Reset pencarian & filter',
                  onClick: () =>
                    setParams({
                      ...EMPTY_FILTERS,
                      search: null,
                      page: null,
                      sort: null,
                    }),
                }
              : undefined
          }
          icon={SearchX}
          text="Coba kata kunci lain atau kurangi filter."
          title="Tidak ada anime yang cocok"
        />
      ) : (
        <>
          <div
            className={cn(
              ANIME_GRID,
              'transition-opacity',
              result.isPlaceholderData && 'opacity-60',
            )}
          >
            {data.items.map((anime, i) => (
              <AnimeCardItem key={anime.id} anime={anime} eager={i < 6} />
            ))}
          </div>
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => {
              setParams({ page });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}

interface Facets {
  genres: { name: string; count: number }[];
  formats: { name: string; count: number }[];
  years: number[];
}

function FilterPanel({
  params,
  facets,
  onUpdate,
  onClear,
}: {
  params: Params;
  facets?: Facets;
  onUpdate: (values: Update) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const genres = (facets?.genres ?? []).filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase().trim()),
  );
  // Selected genres always stay visible, even when collapsed.
  const visible =
    expanded || query
      ? genres
      : genres.filter(
          (g, i) => i < COLLAPSED_GENRES || params.genre.includes(g.name),
        );
  const hidden = genres.length - visible.length;

  const toggleGenre = (name: string) =>
    onUpdate({
      genre: params.genre.includes(name)
        ? params.genre.filter((g) => g !== name)
        : [...params.genre, name],
    });

  return (
    <div
      className="panel animate-fade-in space-y-5 border border-border p-4 md:p-5"
      id="anime-filters"
    >
      <div className="grid gap-5 md:grid-cols-[1fr_1fr_auto]">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm text-muted">Status</legend>
          <div className="flex flex-wrap gap-2">
            <Chip
              active={!params.status}
              onClick={() => onUpdate({ status: null })}
            >
              Semua
            </Chip>
            {ANIME_STATUSES.map((s) => (
              <Chip
                key={s}
                active={params.status === s}
                onClick={() => onUpdate({ status: s })}
              >
                {STATUS_LABEL[s]}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm text-muted">Format</legend>
          <div className="flex flex-wrap gap-2">
            <Chip
              active={!params.format}
              onClick={() => onUpdate({ format: null })}
            >
              Semua
            </Chip>
            {facets?.formats.map((f) => (
              <Chip
                key={f.name}
                active={params.format === f.name}
                onClick={() => onUpdate({ format: f.name })}
              >
                {f.name}
              </Chip>
            ))}
          </div>
        </fieldset>

        <label className="space-y-2">
          <span className="block text-sm text-muted">Tahun</span>
          <select
            className="h-8 w-36 rounded-lg border border-border bg-(--field-background) px-2 text-sm outline-none focus:border-accent"
            value={params.year ?? ''}
            onChange={(e) =>
              onUpdate({ year: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">Semua tahun</option>
            {facets?.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">
            Genre
            {params.genre.length > 1 && (
              <span className="ml-1 text-xs">
                (anime harus punya semua genre terpilih)
              </span>
            )}
          </p>
          <label className="relative w-full sm:ml-auto sm:w-64">
            <span className="sr-only">Cari genre</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-9 w-full rounded-lg border border-border bg-(--field-background) pr-3 pl-9 text-sm outline-none placeholder:text-muted focus:border-accent"
              placeholder="Cari genre"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {!facets &&
            Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className="h-8 w-20 animate-pulse rounded-lg bg-amber-soft/60"
              />
            ))}
          {visible.map((g) => (
            <Chip
              key={g.name}
              active={params.genre.includes(g.name)}
              onClick={() => toggleGenre(g.name)}
            >
              {g.name}
              <span className="ml-1 text-xs opacity-60">{g.count}</span>
            </Chip>
          ))}
          {hidden > 0 && (
            <button
              className="h-8 px-2 text-sm font-medium text-accent hover:text-amber-deep"
              type="button"
              onClick={() => setExpanded(true)}
            >
              +{hidden} lainnya
            </button>
          )}
          {facets && genres.length === 0 && (
            <p className="text-sm text-muted">
              Genre “{query}” tidak ditemukan.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="text-sm font-medium text-accent underline underline-offset-4 hover:text-amber-deep"
          type="button"
          onClick={onClear}
        >
          Hapus semua filter
        </button>
      </div>
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        'h-8 shrink-0 rounded-lg px-3 text-sm whitespace-nowrap transition-colors',
        active
          ? 'accent-gradient font-semibold'
          : 'bg-amber-soft/70 hover:bg-amber-soft',
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <Icon className="size-9 text-accent" />
      <p className="font-semibold">{title}</p>
      <p className="max-w-md text-sm text-muted">{text}</p>
      {action && (
        <button
          className="accent-gradient mt-1 rounded-lg px-4 py-2 text-sm font-medium"
          type="button"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
