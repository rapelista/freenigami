/** Base path of the anime section. */
export const ANIME_BASE = '/beta/anime';

export const animeHref = (slug: string) => `${ANIME_BASE}/${slug}`;

export const episodeHref = (slug: string, episode: number | string) =>
  `${ANIME_BASE}/${slug}/episode/${episode}`;

export const ANIME_STATUSES = ['airing', 'completed', 'upcoming'] as const;

export type AnimeStatus = (typeof ANIME_STATUSES)[number];

export const STATUS_LABEL: Record<AnimeStatus, string> = {
  airing: 'Sedang Tayang',
  completed: 'Tamat',
  upcoming: 'Segera Tayang',
};

/** Map the upstream's free-form status text onto our three states. */
export function normalizeStatus(
  value: string | null | undefined,
): AnimeStatus | null {
  const v = value?.toLowerCase().trim() ?? '';

  if (!v) return null;
  if (/airing|ongoing|currently|releasing|sedang/.test(v)) return 'airing';
  if (/complete|finished|tamat/.test(v)) return 'completed';
  if (/upcoming|not yet|segera/.test(v)) return 'upcoming';

  return null;
}

export const ANIME_SORTS = [
  'relevance',
  'updated',
  'popular',
  'rating',
  'latest',
  'year',
  'title',
] as const;

export type AnimeSort = (typeof ANIME_SORTS)[number];

export const SORT_LABEL: Record<AnimeSort, string> = {
  relevance: 'Paling relevan',
  updated: 'Update terbaru',
  popular: 'Paling populer',
  rating: 'Rating tertinggi',
  latest: 'Baru ditambahkan',
  year: 'Tahun rilis',
  title: 'Judul A-Z',
};

type BrowseLink = Partial<{
  search: string;
  genre: string;
  format: string;
  status: AnimeStatus;
  year: number;
  studio: string;
  sort: AnimeSort;
}>;

/** Link to the browse page with some filters preset. */
export function browseHref(params: BrowseLink = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }

  const qs = query.toString();

  return `${ANIME_BASE}/browse${qs ? `?${qs}` : ''}`;
}

/** Compact view counter: 1234 → "1,2 rb". */
export function formatViews(views: number) {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(views);
}

export interface EpisodeItem {
  id: number;
  number: number;
  /** Null when the upstream title is just "Episode N". */
  title: string | null;
}
