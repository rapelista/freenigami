import { z } from 'zod';

import {
  type AnimeSort,
  type AnimeStatus,
  type EpisodeItem,
  normalizeStatus,
} from '~/lib/anime';

import { getEpisodes, mediaUrl, requestData } from './mikonime';

/*
 * Catalog layer for /beta/anime. The upstream API has no server-side
 * search, filter or sort (unknown params are ignored), and its own site
 * downloads the whole catalog (`route=anime&limit=10000`, ~7MB, ~10s) and
 * filters in the browser. We do that once on the server instead, keep a
 * slim copy in memory, and answer paged queries from it.
 */

const CATALOG_TTL = 10 * 60 * 1000;
const CATALOG_TIMEOUT = 30_000;

const nullableText = z
  .string()
  .nullish()
  .transform((v) => v?.trim() || null);

const RawAnimeSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  slug: z.string(),
  poster: nullableText,
  banner: nullableText,
  trailer_url: nullableText,
  synopsis: nullableText,
  studio: nullableText,
  year: z.coerce.string().nullish(),
  format: nullableText,
  airing_status: nullableText,
  rating: z.coerce.number().nullish(),
  views: z.coerce.number().nullish(),
  likes_count: z.coerce.number().nullish(),
  is_hero: z.coerce.number().nullish(),
  genres: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
  latest_episode_date: nullableText,
  characters_data: z.string().nullish(),
});

type RawAnime = z.infer<typeof RawAnimeSchema>;

export interface Anime {
  id: number;
  slug: string;
  title: string;
  poster: string | null;
  banner: string | null;
  /** YouTube video id of the trailer. */
  trailerId: string | null;
  synopsis: string;
  studio: string | null;
  year: number | null;
  format: string | null;
  status: AnimeStatus | null;
  rating: number | null;
  views: number;
  likes: number;
  genres: string[];
  isHero: boolean;
  createdAt: number;
  latestEpisodeAt: number;
}

/** What a grid/list card needs; sent to the client in bulk. */
export type AnimeCard = Pick<
  Anime,
  | 'id'
  | 'slug'
  | 'title'
  | 'poster'
  | 'year'
  | 'format'
  | 'status'
  | 'rating'
  | 'genres'
>;

export interface Character {
  id: number;
  name: string;
  image: string | null;
  role: string;
  voiceActor: { name: string; image: string | null } | null;
}

export interface AnimeDetail extends Anime {
  characters: Character[];
}

/* ------------------------------------------------------------------ */
/* Normalization                                                       */
/* ------------------------------------------------------------------ */

/**
 * Drop the source site's self-promotion ("By mikonime.stream", "nonton di
 * Miko.Stream!") from synopses; it must not appear in our UI.
 */
const BRAND_SENTENCE =
  /\(?[^.!?\n(]*\b(?:mikonime(?:\.stream)?|miko\.?stream)\b[^.!?\n)]*[.!?]*\)?/gi;

export function scrubBrand(text: string) {
  return text
    .replace(BRAND_SENTENCE, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Parse `YYYY-MM-DD HH:mm:ss` timestamps; 0 when missing. */
const toTime = (value: string | null) =>
  value ? Date.parse(value.replace(' ', 'T')) || 0 : 0;

export function youtubeId(url: string | null | undefined) {
  if (!url) return null;
  const match =
    /youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/i.exec(url) ??
    /youtube\.com\/watch\?v=([\w-]{11})/i.exec(url) ??
    /youtu\.be\/([\w-]{11})/i.exec(url);

  return match?.[1] ?? (/^[\w-]{11}$/.test(url) ? url : null);
}

/** "Action, Comedy,Romance" → ["Action", "Comedy", "Romance"] */
export const splitGenres = (genres: string | null | undefined) => [
  ...new Set(
    (genres ?? '')
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 1),
  ),
];

function normalize(raw: RawAnime): Anime {
  const year = Number.parseInt(raw.year ?? '');

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title.trim(),
    poster: mediaUrl(raw.poster),
    banner: mediaUrl(raw.banner),
    trailerId: youtubeId(raw.trailer_url),
    synopsis: scrubBrand(raw.synopsis ?? ''),
    studio: raw.studio,
    year: Number.isFinite(year) && year > 1900 ? year : null,
    format: raw.format,
    status: normalizeStatus(raw.airing_status),
    rating: raw.rating && raw.rating > 0 ? raw.rating : null,
    views: raw.views ?? 0,
    likes: raw.likes_count ?? 0,
    genres: splitGenres(raw.genres),
    isHero: raw.is_hero === 1,
    createdAt: toTime(raw.created_at),
    latestEpisodeAt: toTime(raw.latest_episode_date ?? raw.updated_at),
  };
}

export const toCard = (a: Anime): AnimeCard => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  poster: a.poster,
  year: a.year,
  format: a.format,
  status: a.status,
  rating: a.rating,
  genres: a.genres,
});

/* ------------------------------------------------------------------ */
/* Catalog cache                                                       */
/* ------------------------------------------------------------------ */

/** Lowercase, accent- and punctuation-free text for matching. */
export const fold = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

interface Indexed {
  anime: Anime;
  title: string;
  meta: string;
  synopsis: string;
}

interface Catalog {
  items: Indexed[];
  bySlug: Map<string, Anime>;
  fetchedAt: number;
}

let cache: Catalog | null = null;
let inflight: Promise<Catalog> | null = null;

async function loadCatalog(): Promise<Catalog> {
  const raw = await requestData(
    { route: 'anime', limit: '10000' },
    z.array(z.unknown()),
    CATALOG_TIMEOUT,
  );

  // Parse item by item: one malformed row must not sink the catalog.
  const items: Indexed[] = [];

  for (const row of raw) {
    const parsed = RawAnimeSchema.omit({ characters_data: true }).safeParse(
      row,
    );

    if (!parsed.success) continue;
    const anime = normalize(parsed.data);

    items.push({
      anime,
      title: fold(anime.title),
      meta: fold(
        [anime.studio, ...anime.genres, anime.format, anime.year].join(' '),
      ),
      synopsis: fold(anime.synopsis),
    });
  }

  return {
    items,
    bySlug: new Map(items.map((i) => [i.anime.slug, i.anime])),
    fetchedAt: Date.now(),
  };
}

/**
 * The whole catalog, from memory. Stale data is served immediately while
 * a refresh runs in the background; concurrent callers share one fetch.
 */
export async function getCatalog(): Promise<Catalog> {
  const refresh = () =>
    (inflight ??= loadCatalog()
      .then((fresh) => (cache = fresh))
      .finally(() => (inflight = null)));

  if (!cache) return refresh();

  if (Date.now() - cache.fetchedAt > CATALOG_TTL) {
    refresh().catch(() => {
      // keep serving the stale copy
    });
  }

  return cache;
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export interface BrowseQuery {
  search?: string | null;
  genres?: string[];
  format?: string | null;
  status?: AnimeStatus | null;
  year?: number | null;
  studio?: string | null;
  sort?: AnimeSort;
  page?: number;
  pageSize?: number;
}

/** Higher is better; 0 means the anime does not match the query at all. */
function relevance(item: Indexed, query: string, tokens: string[]) {
  const haystack = `${item.title} ${item.meta} ${item.synopsis}`;

  if (!tokens.every((t) => haystack.includes(t))) return 0;

  if (item.title === query) return 100;
  if (item.title.startsWith(query)) return 60;
  if (item.title.includes(query)) return 40;
  if (tokens.every((t) => item.title.includes(t))) return 25;
  if (tokens.every((t) => `${item.title} ${item.meta}`.includes(t))) return 10;

  return 1;
}

const comparators: Record<AnimeSort, (a: Anime, b: Anime) => number> = {
  updated: (a, b) => b.latestEpisodeAt - a.latestEpisodeAt,
  popular: (a, b) => b.views - a.views,
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.views - a.views,
  latest: (a, b) => b.createdAt - a.createdAt || b.id - a.id,
  title: (a, b) => a.title.localeCompare(b.title),
  year: (a, b) => (b.year ?? 0) - (a.year ?? 0) || b.views - a.views,
  relevance: () => 0,
};

export async function browseAnime(query: BrowseQuery) {
  const { items } = await getCatalog();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 24;
  const search = fold(query.search ?? '');
  const tokens = search.split(' ').filter(Boolean);
  const genres = (query.genres ?? []).map((g) => g.toLowerCase());
  const studio = query.studio?.toLowerCase();

  const scored: Array<{ anime: Anime; score: number }> = [];

  for (const item of items) {
    const a = item.anime;

    if (query.format && a.format !== query.format) continue;
    if (query.status && a.status !== query.status) continue;
    if (query.year && a.year !== query.year) continue;
    if (studio && !a.studio?.toLowerCase().includes(studio)) continue;
    if (
      genres.length &&
      !genres.every((g) => a.genres.some((x) => x.toLowerCase() === g))
    ) {
      continue;
    }

    const score = tokens.length ? relevance(item, search, tokens) : 1;

    if (score > 0) scored.push({ anime: a, score });
  }

  // With a search term, "relevance" (the default then) ranks by match
  // quality, ties broken by popularity.
  const sort = query.sort ?? (tokens.length ? 'relevance' : 'updated');
  const compare = comparators[sort];

  scored.sort((x, y) =>
    sort === 'relevance'
      ? y.score - x.score || y.anime.views - x.anime.views
      : compare(x.anime, y.anime),
  );

  const total = scored.length;
  const start = (page - 1) * pageSize;

  return {
    items: scored.slice(start, start + pageSize).map((s) => toCard(s.anime)),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Filter options with counts, derived from the catalog itself. */
export async function getFacets() {
  const { items } = await getCatalog();
  const genres = new Map<string, { name: string; count: number }>();
  const formats = new Map<string, number>();
  const years = new Map<number, number>();

  for (const { anime } of items) {
    for (const g of anime.genres) {
      const key = g.toLowerCase();
      const entry = genres.get(key) ?? { name: g, count: 0 };

      entry.count++;
      genres.set(key, entry);
    }
    if (anime.format)
      formats.set(anime.format, (formats.get(anime.format) ?? 0) + 1);
    if (anime.year) years.set(anime.year, (years.get(anime.year) ?? 0) + 1);
  }

  return {
    // Scraper typos ("ction", "Action,") are rare or start lowercase.
    genres: [...genres.values()]
      .filter((g) => g.count > 1 && /^[A-Z0-9]/.test(g.name))
      .toSorted((a, b) => a.name.localeCompare(b.name)),
    formats: [...formats]
      .map(([name, count]) => ({ name, count }))
      .toSorted((a, b) => b.count - a.count),
    years: [...years.keys()].toSorted((a, b) => b - a),
    total: items.length,
  };
}

/** Rows for the landing page, all from one catalog pass. */
export async function getHomeSections(size = 18) {
  const { items } = await getCatalog();
  const all = items.map((i) => i.anime);
  const top = (list: Anime[], compare: (a: Anime, b: Anime) => number) =>
    list.toSorted(compare).slice(0, size).map(toCard);

  return {
    airing: top(
      all.filter((a) => a.status === 'airing'),
      comparators.updated,
    ),
    popular: top(all, comparators.popular),
    topRated: top(
      all.filter((a) => a.views >= 20),
      comparators.rating,
    ),
    newest: top(all, comparators.latest),
  };
}

/** Same-genre picks from the catalog, used when the API has none. */
export async function getSimilar(anime: Anime, size = 12) {
  const { items } = await getCatalog();
  const genres = new Set(anime.genres.map((g) => g.toLowerCase()));

  return items
    .filter((i) => i.anime.id !== anime.id)
    .map((i) => ({
      anime: i.anime,
      overlap: i.anime.genres.filter((g) => genres.has(g.toLowerCase())).length,
    }))
    .filter((x) => x.overlap > 0)
    .toSorted((a, b) => b.overlap - a.overlap || b.anime.views - a.anime.views)
    .slice(0, size)
    .map((x) => toCard(x.anime));
}

/* ------------------------------------------------------------------ */
/* Lightweight upstream calls (no catalog needed)                      */
/* ------------------------------------------------------------------ */

const CharacterSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  image: z.string().nullish(),
  role: z.string().nullish(),
  voice_actor: z
    .object({ name: z.string(), image: z.string().nullish() })
    .nullish(),
});

function parseCharacters(json: string | null | undefined): Character[] {
  try {
    const list = z.array(CharacterSchema).parse(JSON.parse(json || '[]'));

    return list.map((c) => ({
      id: c.id,
      // MAL lists names as "Family, Given".
      name: c.name.split(', ').reverse().join(' '),
      image: c.image ?? null,
      role: c.role ?? '',
      voiceActor: c.voice_actor
        ? {
            name: c.voice_actor.name.split(', ').reverse().join(' '),
            image: c.voice_actor.image ?? null,
          }
        : null,
    }));
  } catch {
    return [];
  }
}

/** Fresh detail by slug; null when the slug is unknown. */
async function fetchAnimeDetail(slug: string): Promise<AnimeDetail | null> {
  const raw = await requestData(
    { route: 'anime', slug },
    z.union([RawAnimeSchema, z.null(), z.array(z.unknown())]),
  ).catch((error: unknown) => {
    // An unknown slug answers `status: error`, which fails the schema.
    if (error instanceof z.ZodError) return null;
    throw error;
  });

  if (!raw || Array.isArray(raw)) return null;

  return {
    ...normalize(raw),
    characters: parseCharacters(raw.characters_data),
  };
}

/** Upstream's own recommendations; [] when it has none. */
export async function getRecommendations(animeId: number, size = 12) {
  const rows = await requestData(
    {
      route: 'recommendations',
      anime_id: String(animeId),
      limit: String(size),
    },
    z.array(z.unknown()),
  ).catch(() => []);

  return rows.flatMap((row): AnimeCard[] => {
    const parsed = RawAnimeSchema.pick({
      id: true,
      title: true,
      slug: true,
      poster: true,
      year: true,
      format: true,
      rating: true,
      genres: true,
    }).safeParse(row);

    if (!parsed.success) return [];
    const a = parsed.data;
    const year = Number.parseInt(a.year ?? '');

    return [
      {
        id: a.id,
        slug: a.slug,
        title: a.title,
        poster: mediaUrl(a.poster),
        year: Number.isFinite(year) ? year : null,
        format: a.format,
        status: null,
        rating: a.rating && a.rating > 0 ? a.rating : null,
        genres: splitGenres(a.genres),
      },
    ];
  });
}

const LatestEpisodeSchema = z.object({
  id: z.coerce.number(),
  anime_id: z.coerce.number(),
  episode_number: z.coerce.number(),
  anime_title: z.string(),
  slug: z.string(),
  poster: z.string().nullish(),
  thumbnail: z.string().nullish(),
  created_at: z.string().nullish(),
});

export interface LatestEpisode {
  id: number;
  animeId: number;
  slug: string;
  title: string;
  episode: number;
  image: string | null;
  createdAt: number;
}

/** Newest episode per anime, newest first. */
export async function getLatestEpisodes(size = 18): Promise<LatestEpisode[]> {
  const rows = await requestData(
    { route: 'episodes' },
    z.array(LatestEpisodeSchema),
  );
  const newest = new Map<number, LatestEpisode>();

  for (const e of rows) {
    const current = newest.get(e.anime_id);

    if (current && current.episode >= e.episode_number) continue;
    newest.set(e.anime_id, {
      id: e.id,
      animeId: e.anime_id,
      slug: e.slug,
      title: e.anime_title,
      episode: e.episode_number,
      image: mediaUrl(e.poster) ?? mediaUrl(e.thumbnail),
      createdAt: toTime(e.created_at ?? null),
    });
  }

  return [...newest.values()]
    .toSorted((a, b) => b.createdAt - a.createdAt)
    .slice(0, size);
}

/** The hand-picked hero rotation; cheap (one small API call). */
export async function getHeroAnime(): Promise<Anime[]> {
  const rows = await requestData(
    { route: 'anime', is_hero: '1', limit: '8' },
    z.array(z.unknown()),
  );

  return rows.flatMap((row) => {
    const parsed = RawAnimeSchema.safeParse(row);

    return parsed.success ? [normalize(parsed.data)] : [];
  });
}

/*
 * Detail and recommendations are requested side by side for one slug;
 * a short-lived memo keeps that to a single upstream call.
 */
const DETAIL_TTL = 60_000;
const detailMemo = new Map<
  string,
  { at: number; value: Promise<AnimeDetail | null> }
>();

export function getAnimeDetail(slug: string) {
  const hit = detailMemo.get(slug);

  if (hit && Date.now() - hit.at < DETAIL_TTL) return hit.value;

  const value = fetchAnimeDetail(slug);

  value.catch(() => detailMemo.delete(slug));
  detailMemo.set(slug, { at: Date.now(), value });

  if (detailMemo.size > 200) {
    for (const [key, entry] of detailMemo) {
      if (Date.now() - entry.at >= DETAIL_TTL) detailMemo.delete(key);
    }
  }

  return value;
}

export async function getEpisodeItems(animeId: number): Promise<EpisodeItem[]> {
  const episodes = await getEpisodes(animeId);

  return episodes.map((e) => ({
    id: e.id,
    number: e.episode_number,
    // Upstream titles are mostly "<Anime> Episode N Subtitle Indonesia",
    // which says nothing the number does not; keep only real titles.
    title: /\bepisode\s*[\d.]+/i.test(e.title) ? null : e.title.trim(),
  }));
}
