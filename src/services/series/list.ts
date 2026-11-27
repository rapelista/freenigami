import { TRPCError } from '@trpc/server';
import { getStatusKeyFromCode } from '@trpc/server/unstable-core-do-not-import';

import { CACHE_TAGS } from '~/configs/cache';
import { generateFullUrl } from '~/utils/misc';

/** Fresh host used by s1.shinigami.mx (offset/limit pagination). */
const PRIMARY_URL = 'https://api.shinigami.io/v1/manga/list';
/** Legacy host (page/page_size); its CDN can serve stale data. */
const FALLBACK_URL = 'https://api.shngm.io/v1/manga/list';

/** The offset-based host rejects larger pages (returns an empty body). */
const PRIMARY_MAX_LIMIT = 100;

type ListParams = Record<string, string | number | boolean | null | undefined>;

interface PrimaryResponse {
  data?: unknown[];
  meta?: { has_next?: boolean };
}

function listError(status: number) {
  return new TRPCError({
    code: getStatusKeyFromCode(status),
    message: 'Failed to fetch series list',
  });
}

/**
 * Fetch a manga list page from the offset-based primary host and rebuild
 * page metadata; when it fails, fetch the same page from the legacy
 * page-based host.
 *
 * The primary does not report totals, so `total_page` is "this page, plus
 * one more if there is a next page", which is enough for the pagination to
 * keep moving forward.
 */
export async function fetchMangaList(
  params: ListParams,
  init?: RequestInit,
): Promise<unknown> {
  const { page: rawPage, page_size: rawPageSize, ...filters } = params;
  const page = Math.max(Number(rawPage) || 1, 1);
  const pageSize = Math.min(Number(rawPageSize) || 24, PRIMARY_MAX_LIMIT);

  try {
    const response = await fetch(
      generateFullUrl(PRIMARY_URL, {
        ...filters,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      init,
    );

    if (response.ok) {
      const body = (await response.json()) as PrimaryResponse;
      const data = body.data ?? [];
      const hasNext = !!body.meta?.has_next && data.length > 0;

      return {
        data,
        meta: {
          page,
          page_size: pageSize,
          total_page: hasNext ? page + 1 : page,
        },
      };
    }

    // Client errors are real errors, not outages: surface them.
    if (response.status < 500) throw listError(response.status);
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    // Network failure or invalid JSON: fall through to the legacy host.
  }

  const response = await fetch(
    generateFullUrl(FALLBACK_URL, { ...filters, page, page_size: pageSize }),
    init,
  );

  if (!response.ok) throw listError(response.status);

  return response.json();
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
