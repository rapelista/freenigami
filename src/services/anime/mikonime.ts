import { z } from 'zod';

/**
 * Playground-only client for the public mikonime.stream API.
 */
const API_URL = 'https://api.mikonime.stream/backend/api/index.php';
const MEDIA_URL = 'https://api.mikonime.stream';

const EpisodeSchema = z.object({
  id: z.number(),
  anime_id: z.number(),
  episode_number: z.number(),
  title: z.string(),
  thumbnail: z.string().nullable(),
  anime_title: z.string(),
  poster: z.string().nullable(),
});

const SourceSchema = z.object({
  id: z.number(),
  server_name: z.string(),
  quality: z.string(),
  source_type: z.string(),
  format: z.string(),
  url: z.string(),
  is_default: z.number(),
  is_locked: z.boolean(),
});

export type Episode = z.infer<typeof EpisodeSchema>;

export interface StreamSource {
  id: number;
  server: string;
  quality: string;
  /** `video` plays in the custom player, `embed` needs an iframe. */
  kind: 'video' | 'embed';
  url: string;
}

const responseOf = <T extends z.ZodType>(schema: T) =>
  z.object({ status: z.literal('success'), data: z.array(schema) });

async function request<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T,
): Promise<z.infer<T>[]> {
  const url = `${API_URL}?${new URLSearchParams(params)}`;

  // Cloudflare occasionally answers with an HTML interstitial instead of
  // JSON. Not cached (a cached interstitial would stick), retried once.
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { cache: 'no-store' });
    const isJson = res.headers.get('content-type')?.includes('json');

    if (res.ok && isJson) {
      return responseOf(schema).parse(await res.json()).data;
    }

    if (attempt >= 2) {
      throw new Error(
        `mikonime ${params.route}: ${res.status} ${isJson ? '' : '(non-JSON response)'}`,
      );
    }
  }
}

/** Resolve the API's site-relative asset paths to absolute URLs. */
export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;

  return path.startsWith('http') ? path : `${MEDIA_URL}${path}`;
}

export function getEpisodes(animeId: number) {
  return request(
    { route: 'episodes', anime_id: String(animeId) },
    EpisodeSchema,
  ).then((episodes) =>
    episodes.toSorted((a, b) => a.episode_number - b.episode_number),
  );
}

const qualityRank = (quality: string) => Number.parseInt(quality) || 0;

/**
 * mikonime's `/v/e_*.html` embed links are wrapper pages that send
 * `X-Frame-Options: SAMEORIGIN`, so they cannot be framed here. Each one
 * just iframes the provider's own embed (vidhide, mega, filedon, ...),
 * which is meant to be embedded, so frame that URL directly instead.
 * Returns null when the wrapper has no player (server down/maintenance).
 */
async function resolveEmbed(url: string): Promise<string | null> {
  if (!url.includes('mikonime.stream/v/')) return url;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    const src = /<iframe[^>]*?\ssrc="(https:\/\/[^"]+)"/i.exec(html)?.[1];

    return src && !src.includes('mikonime.stream') ? src : null;
  } catch {
    return null;
  }
}

/**
 * Streamable sources for an episode, highest quality first, with direct
 * video files ahead of embeds. Download-only links are dropped.
 */
export async function getStreamSources(
  episodeId: number,
): Promise<StreamSource[]> {
  const sources = await request(
    { route: 'episode_sources', episode_id: String(episodeId) },
    SourceSchema,
  );

  const streams = await Promise.all(
    sources
      .filter((s) => s.source_type === 'stream' && !s.is_locked)
      .map(async (s): Promise<StreamSource | null> => {
        const kind = s.format === 'embed' ? 'embed' : 'video';
        const url = kind === 'embed' ? await resolveEmbed(s.url) : s.url;

        return url
          ? { id: s.id, server: s.server_name, quality: s.quality, kind, url }
          : null;
      }),
  );

  return streams
    .filter((s) => s !== null)
    .toSorted(
      (a, b) =>
        Number(a.kind === 'embed') - Number(b.kind === 'embed') ||
        qualityRank(b.quality) - qualityRank(a.quality) ||
        a.server.localeCompare(b.server),
    );
}
