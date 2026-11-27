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
  data?: { is_pinned?: boolean }[];
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
 * Pass `offset` (from a previous page's `meta.next_offset`) to continue an
 * infinite list; otherwise it is derived from `page`.
 *
 * The primary puts pinned series on the first page on top of `limit`, so a
 * page can hold more than `page_size` items. Pages are trimmed back to
 * `page_size`, and `next_offset` only advances past the regular (unpinned)
 * items actually returned, so nothing trimmed is skipped.
 *
 * The primary does not report totals, so `total_page` is "this page, plus
 * one more if there is a next page", which is enough for the pagination to
 * keep moving forward.
 */
export async function fetchMangaList(
  params: ListParams,
  init?: RequestInit,
): Promise<unknown> {
  const {
    page: rawPage,
    page_size: rawPageSize,
    offset: rawOffset,
    ...filters
  } = params;
  const pageSize = Math.min(Number(rawPageSize) || 24, PRIMARY_MAX_LIMIT);
  const offset =
    rawOffset === undefined || rawOffset === null
      ? (Math.max(Number(rawPage) || 1, 1) - 1) * pageSize
      : Math.max(Number(rawOffset) || 0, 0);
  const page = Math.floor(offset / pageSize) + 1;

  try {
    const response = await fetch(
      generateFullUrl(PRIMARY_URL, { ...filters, limit: pageSize, offset }),
      init,
    );

    if (response.ok) {
      const body = (await response.json()) as PrimaryResponse;
      const all = body.data ?? [];
      const data = all.slice(0, pageSize);
      const regular = data.filter((item) => !item.is_pinned).length;
      const hasNext =
        all.length > pageSize || (!!body.meta?.has_next && regular > 0);

      return {
        data,
        meta: {
          page,
          page_size: pageSize,
          total_page: hasNext ? page + 1 : page,
          next_offset: hasNext ? offset + regular : null,
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

  const body = (await response.json()) as {
    data?: unknown[];
    meta?: { total_page?: number };
  };
  const hasNext = page < (body.meta?.total_page ?? page);

  return {
    ...body,
    meta: {
      ...body.meta,
      next_offset: hasNext ? page * pageSize : null,
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
