import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { ANIME_SORTS, ANIME_STATUSES } from '~/lib/anime';
import {
  browseAnime,
  getAnimeDetail,
  getEpisodeItems,
  getFacets,
  getHeroAnime,
  getHomeSections,
  getLatestEpisodes,
  getRecommendations,
  getSimilar,
} from '~/services/anime/catalog';
import { getAnimeList, getStreamSources } from '~/services/anime/mikonime';
import { appProcedure, router } from '~/trpc/init';

/** Upstream failures surface as 502 without leaking the source's name. */
async function upstream<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    if (e instanceof TRPCError) throw e;
    throw new TRPCError({
      code: 'BAD_GATEWAY',
      message: 'Sumber anime tidak dapat dihubungi',
      cause: e,
    });
  }
}

const slugInput = z.object({ slug: z.string().min(1).max(200) });
const animeIdInput = z.object({ animeId: z.number().int().positive() });

async function detailOrThrow(slug: string) {
  const anime = await getAnimeDetail(slug);

  if (!anime) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Anime tidak ditemukan',
    });
  }

  return anime;
}

export const animeRouter = router({
  /** Infinite list for the old /anime playground; `cursor` is the offset. */
  list: appProcedure
    .input(
      z.object({
        cursor: z.number().int().min(0).nullish(),
        limit: z.number().int().min(1).max(60).default(30),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await getAnimeList({
          offset: input.cursor ?? 0,
          limit: input.limit,
        });
      } catch (e) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: e instanceof Error ? e.message : 'mikonime unavailable',
        });
      }
    }),

  /** Hand-picked spotlight titles. */
  hero: appProcedure.query(() => upstream(getHeroAnime)),

  /** Newest episode per anime. */
  latestEpisodes: appProcedure.query(() =>
    upstream(() => getLatestEpisodes(18)),
  ),

  /** Airing / popular / top rated / newest rows for the landing page. */
  home: appProcedure.query(() => upstream(() => getHomeSections(18))),

  /** Search + filter + sort over the cached catalog, page by page. */
  browse: appProcedure
    .input(
      z.object({
        search: z.string().trim().max(100).optional(),
        genres: z.array(z.string()).max(10).default([]),
        format: z.string().nullish(),
        status: z.enum(ANIME_STATUSES).nullish(),
        year: z.number().int().nullish(),
        studio: z.string().nullish(),
        sort: z.enum(ANIME_SORTS).nullish(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(60).default(24),
      }),
    )
    .query(({ input }) =>
      upstream(() => browseAnime({ ...input, sort: input.sort ?? undefined })),
    ),

  /** Genre / format / year options for the browse filters. */
  facets: appProcedure.query(() => upstream(getFacets)),

  /** Full detail incl. characters; NOT_FOUND for an unknown slug. */
  detail: appProcedure
    .input(slugInput)
    .query(({ input }) => upstream(() => detailOrThrow(input.slug))),

  episodes: appProcedure
    .input(animeIdInput)
    .query(({ input }) => upstream(() => getEpisodeItems(input.animeId))),

  /** Upstream picks, or same-genre titles from the catalog as fallback. */
  recommendations: appProcedure.input(slugInput).query(({ input }) =>
    upstream(async () => {
      const anime = await detailOrThrow(input.slug);
      const picks = await getRecommendations(anime.id, 12);

      return picks.length > 0
        ? picks
        : await getSimilar(anime, 12).catch(() => []);
    }),
  ),

  /** Playable servers of one episode. */
  sources: appProcedure
    .input(z.object({ episodeId: z.number().int().positive() }))
    .query(({ input }) =>
      upstream(async () => {
        const sources = await getStreamSources(input.episodeId);

        // Server names carry the source's brand ("YL Miko Cloud",
        // "Miko Gamma Drive"); it must not show in our UI.
        return sources.map((s) => ({
          ...s,
          server:
            s.server
              .replace(/\bmiko(?:nime)?(?:\.stream)?\b/gi, '')
              .replace(/\s{2,}/g, ' ')
              .trim() || 'Server',
        }));
      }),
    ),
});
