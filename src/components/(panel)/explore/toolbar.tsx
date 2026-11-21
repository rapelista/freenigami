'use client';

import { Dropdown, Label } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useQueryStates } from 'nuqs';
import { useState } from 'react';

import {
  exploreParsers,
  FORMAT_OPTIONS,
  MIN_CHAPTER_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  SUBFORMAT_OPTIONS,
  TYPE_OPTIONS,
  type FilterOption,
} from '~/lib/explore';
import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

/** How many genres/themes show before "+N lainnya". */
const COLLAPSED_COUNT = 12;

type Params = ReturnType<typeof useQueryStates<typeof exploreParsers>>[0];

const EMPTY_FILTERS = {
  type: null,
  status: null,
  format: null,
  subformat: null,
  min: null,
  genre: null,
  theme: null,
} as const;

function countFilters(params: Params) {
  return (
    [
      params.type,
      params.status,
      params.format,
      params.subformat,
      params.min,
    ].filter((value) => value !== null).length +
    params.genre.length +
    params.theme.length
  );
}

const labelOf = <T extends string | number>(
  options: FilterOption<T>[],
  value: T | null,
) => options.find((option) => option.value === value)?.label ?? String(value);

export function ExploreToolbar() {
  const [params, setParams] = useQueryStates(exploreParsers);
  const [open, setOpen] = useState(false);

  // Every filter change starts again from the first page.
  const update = (values: Partial<Record<keyof Params, unknown>>) =>
    setParams({ ...values, page: null } as Parameters<typeof setParams>[0]);

  const activeCount = countFilters(params);
  const needsTaxonomy = open || activeCount > 0;

  const genres = useQuery({
    ...trpc.series.taxonomy.queryOptions({ type: 'genre' }),
    enabled: needsTaxonomy,
    staleTime: Infinity,
  });
  const themes = useQuery({
    ...trpc.series.taxonomy.queryOptions({ type: 'theme' }),
    enabled: needsTaxonomy,
    staleTime: Infinity,
  });

  const nameOf = (slug: string, list?: { slug: string; name: string }[]) =>
    list?.find((item) => item.slug === slug)?.name ?? slug;

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === params.sort)?.label ??
    'Urutkan';

  const chips: Array<{ key: string; label: string; remove: () => void }> = [
    ...(params.type
      ? [
          {
            key: 'type',
            label: labelOf(TYPE_OPTIONS, params.type),
            remove: () => update({ type: null }),
          },
        ]
      : []),
    ...(params.status
      ? [
          {
            key: 'status',
            label: labelOf(STATUS_OPTIONS, params.status),
            remove: () => update({ status: null }),
          },
        ]
      : []),
    ...(params.format
      ? [
          {
            key: 'format',
            label: labelOf(FORMAT_OPTIONS, params.format),
            remove: () => update({ format: null }),
          },
        ]
      : []),
    ...(params.subformat
      ? [
          {
            key: 'subformat',
            label: labelOf(SUBFORMAT_OPTIONS, params.subformat),
            remove: () => update({ subformat: null }),
          },
        ]
      : []),
    ...params.genre.map((slug) => ({
      key: `genre-${slug}`,
      label: nameOf(slug, genres.data),
      remove: () =>
        update({ genre: params.genre.filter((value) => value !== slug) }),
    })),
    ...params.theme.map((slug) => ({
      key: `theme-${slug}`,
      label: nameOf(slug, themes.data),
      remove: () =>
        update({ theme: params.theme.filter((value) => value !== slug) }),
    })),
    ...(params.min !== null
      ? [
          {
            key: 'min',
            label: `Min ${params.min} ch`,
            remove: () => update({ min: null }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Cari judul komik</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="h-10 w-full rounded-xl border border-border bg-(--field-background) pl-9 pr-9 text-sm outline-none placeholder:text-muted focus:border-accent"
            placeholder="Cari judul komik..."
            type="search"
            value={params.search}
            onChange={(e) =>
              setParams(
                { search: e.target.value, page: null },
                { history: 'replace' },
              )
            }
          />
          {params.search && (
            <button
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-foreground"
              type="button"
              onClick={() =>
                setParams({ search: null, page: null }, { history: 'replace' })
              }
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <button
          aria-controls="explore-filters"
          aria-expanded={open}
          className={cn(
            'relative flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors',
            open ? 'accent-gradient' : 'bg-amber-soft hover:bg-amber-soft/70',
          )}
          type="button"
          onClick={() => setOpen((value) => !value)}
        >
          <SlidersHorizontal className={cn('size-4', !open && 'text-accent')} />
          <span className="max-sm:hidden">Filter</span>
          {activeCount > 0 && (
            <span
              aria-label={`${activeCount} filter aktif`}
              className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent ring-2 ring-background"
            />
          )}
        </button>

        <Dropdown>
          <Dropdown.Trigger
            aria-label={`Urutkan: ${sortLabel}`}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-amber-soft px-3.5 text-sm font-semibold outline-none transition-colors hover:bg-amber-soft/70 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowUpDown className="size-4 text-accent" />
            <span className="max-sm:hidden">{sortLabel}</span>
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu
              disallowEmptySelection
              selectedKeys={new Set([params.sort])}
              selectionMode="single"
              onAction={(key) =>
                update({ sort: key as (typeof params)['sort'] })
              }
            >
              {SORT_OPTIONS.map((option) => (
                <Dropdown.Item
                  key={option.value}
                  id={option.value}
                  textValue={option.label}
                >
                  <Label>{option.label}</Label>
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      {open && (
        <FilterPanel
          genres={genres.data}
          params={params}
          themes={themes.data}
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
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

interface FilterPanelProps {
  params: Params;
  genres?: { slug: string; name: string }[];
  themes?: { slug: string; name: string }[];
  onUpdate: (values: Partial<Record<keyof Params, unknown>>) => void;
  onClear: () => void;
}

function FilterPanel({
  params,
  genres,
  themes,
  onUpdate,
  onClear,
}: FilterPanelProps) {
  const [query, setQuery] = useState('');

  const toggle = (list: string[], slug: string) =>
    list.includes(slug)
      ? list.filter((value) => value !== slug)
      : [...list, slug];

  return (
    <div
      className="panel animate-fade-in space-y-5 border border-border p-4 md:p-5"
      id="explore-filters"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FilterGroup
          label="Tipe"
          options={TYPE_OPTIONS}
          value={params.type}
          onChange={(type) => onUpdate({ type })}
        />
        <FilterGroup
          label="Status"
          options={STATUS_OPTIONS}
          value={params.status}
          onChange={(status) => onUpdate({ status })}
        />
        <FilterGroup
          label="Format"
          options={FORMAT_OPTIONS}
          value={params.format}
          onChange={(format) => onUpdate({ format })}
        />
        <FilterGroup
          allowAll={false}
          label="Sub format"
          options={SUBFORMAT_OPTIONS}
          value={params.subformat}
          onChange={(subformat) => onUpdate({ subformat })}
        />
        <FilterGroup
          label="Minimal chapter"
          options={MIN_CHAPTER_OPTIONS}
          value={params.min}
          onChange={(min) => onUpdate({ min })}
        />
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">Genre &amp; tema</p>
          <label className="relative w-full sm:w-80">
            <span className="sr-only">Cari genre atau tema</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-9 w-full rounded-lg border border-border bg-(--field-background) pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent"
              placeholder="Cari genre atau tema"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <TaxonomyGroup
          items={genres}
          label="Genre"
          query={query}
          selected={params.genre}
          onToggle={(slug) => onUpdate({ genre: toggle(params.genre, slug) })}
        />
        <TaxonomyGroup
          items={themes}
          label="Tema"
          query={query}
          selected={params.theme}
          onToggle={(slug) => onUpdate({ theme: toggle(params.theme, slug) })}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="text-sm font-medium text-accent underline underline-offset-4 hover:text-amber-deep"
          type="button"
          onClick={onClear}
        >
          Hapus semua
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
        'h-8 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm transition-colors',
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

function FilterGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  allowAll = true,
}: {
  label: string;
  options: FilterOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Show a "Semua" chip; otherwise clicking the active chip clears it. */
  allowAll?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {allowAll && (
          <Chip active={value === null} onClick={() => onChange(null)}>
            Semua
          </Chip>
        )}
        {options.map((option) => (
          <Chip
            key={option.value}
            active={value === option.value}
            onClick={() =>
              onChange(
                !allowAll && value === option.value ? null : option.value,
              )
            }
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

function TaxonomyGroup({
  label,
  items,
  selected,
  query,
  onToggle,
}: {
  label: string;
  items?: { slug: string; name: string }[];
  selected: string[];
  query: string;
  onToggle: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!items) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">{label}</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="h-8 w-20 animate-pulse rounded-lg bg-surface-secondary"
            />
          ))}
        </div>
      </div>
    );
  }

  const term = query.trim().toLowerCase();
  // Selected items first, then the rest in API order.
  const ordered = [
    ...items.filter((item) => selected.includes(item.slug)),
    ...items.filter((item) => !selected.includes(item.slug)),
  ];
  const matches = term
    ? ordered.filter(
        (item) =>
          selected.includes(item.slug) ||
          item.name.toLowerCase().includes(term),
      )
    : ordered;
  const matchCount = term
    ? matches.filter((item) => item.name.toLowerCase().includes(term)).length
    : null;

  const limit = Math.max(COLLAPSED_COUNT, selected.length);
  const visible = term || expanded ? matches : matches.slice(0, limit);
  const hiddenCount = matches.length - visible.length;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted">
        {label}
        {matchCount !== null && (
          <span className="ml-2 text-xs">{matchCount} cocok</span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => (
          <Chip
            key={item.slug}
            active={selected.includes(item.slug)}
            onClick={() => onToggle(item.slug)}
          >
            {item.name}
          </Chip>
        ))}

        {term && matchCount === 0 && (
          <p className="self-center text-sm text-muted">
            Tidak ada {label.toLowerCase()} yang cocok
          </p>
        )}

        {!term && (hiddenCount > 0 || expanded) && (
          <button
            className="h-8 px-2 text-sm font-medium text-accent hover:text-amber-deep"
            type="button"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Lebih sedikit' : `+${hiddenCount} lainnya`}
          </button>
        )}
      </div>
    </div>
  );
}
