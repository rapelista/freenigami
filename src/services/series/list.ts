import { TRPCError } from '@trpc/server';
import { getStatusKeyFromCode } from '@trpc/server/unstable-core-do-not-import';

import { CACHE_TAGS } from '~/configs/cache';
import { generateFullUrl } from '~/utils/misc';

const PRIMARY_URL = 'https://api.shngm.io/v1/manga/list';
const FALLBACK_URL = 'https://api.shinigami.io/v1/manga/list';

/** The fallback host rejects larger pages (returns an empty body). */
const FALLBACK_MAX_LIMIT = 100;

type ListParams = Record<string, string | number | boolean | null | undefined>;

interface FallbackResponse {
  data?: unknown[];
  meta?: { has_next?: boolean };
}

/**
 * Fetch a manga list page from the primary host; when it fails, fetch the
 * same page from the offset-based fallback host and rebuild page metadata.
 *
 * The fallback does not report totals, so `total_page` is "this page, plus
 * one more if there is a next page" — enough for the pagination to keep
 * moving forward.
 */
export async function fetchMangaList(
  params: ListParams,
  init?: RequestInit,
): Promise<unknown> {
  try {
    const response = await fetch(generateFullUrl(PRIMARY_URL, params), init);

    if (response.ok) return await response.json();

    // Client errors are real errors, not outages: surface them.
    if (response.status < 500) {
      throw new TRPCError({
        code: getStatusKeyFromCode(response.status),
        message: 'Failed to fetch series list',
      });
    }
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    // Network failure: fall through to the fallback host.
  }

  const { page: rawPage, page_size: rawPageSize, ...filters } = params;
  const page = Math.max(Number(rawPage) || 1, 1);
  const pageSize = Math.min(Number(rawPageSize) || 24, FALLBACK_MAX_LIMIT);

  const response = await fetch(
    generateFullUrl(FALLBACK_URL, {
      ...filters,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    init,
  );

  if (!response.ok) {
    throw new TRPCError({
      code: getStatusKeyFromCode(response.status),
      message: 'Failed to fetch series list',
    });
  }

  const body = (await response.json()) as FallbackResponse;
  const data = body.data ?? [];
  const hasNext = !!body.meta?.has_next && data.length > 0;

  return {
    data,
    meta: {
      page,
      page_size: pageSize,
      total_page: hasNext ? page + 1 : Math.max(page, 1),
    },
  };
}

export async function fetchSeriesList(params: object) {
  return fetchMangaList(params as ListParams, {
    cache: 'force-cache',
    next: {
      revalidate: 3_600,
      tags: [CACHE_TAGS.SERIES_LIST],
    },
  });
}
