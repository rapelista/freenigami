import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { ChapterSchema } from '~/schema/chapter';

/** Legacy page-based host; its CDN can serve stale data. */
const LEGACY_HOST = 'https://api.shngm.io';
/** Fresh cursor-based host used by s1.shinigami.mx. */
const FRESH_HOST = 'https://api.shinigami.io';

/** Cursor separator; fresh-host cursors are base64url so never contain it. */
const SEP = '|';

/** Give up on the legacy backup quickly. */
const LEGACY_TIMEOUT_MS = 6_000;
const FRESH_TIMEOUT_MS = 10_000;
/** Extra attempts for the fresh host on network/5xx/invalid-JSON errors. */
const FRESH_RETRIES = 1;

const LegacyResponseSchema = z.object({
  data: z.array(ChapterSchema),
  meta: z.object({
    total_page: z.number(),
    total_record: z.number(),
  }),
});

const FreshResponseSchema = z.object({
  data: z.array(ChapterSchema),
  meta: z.object({
    has_next: z.boolean().optional(),
    next_cursor: z.string().nullish(),
  }),
});

export interface ChapterListParams {
  seriesId: string;
  page: number;
  pageSize: number;
  search?: string;
  sortOrder: 'asc' | 'desc';
  cursor?: string | null;
}

export interface ChapterListResult {
  data: z.infer<typeof ChapterSchema>[];
  meta: {
    /** Unknown when served by the fresh (cursor-based) host. */
    total_record: number | null;
    next_cursor: string | null;
  };
}

/**
 * The cursor is "<page>" or "<page>|<fresh cursor>". The page number
 * drives the legacy host; the fresh cursor (when known) drives the
 * cursor-based fresh host.
 */
function parseCursor(cursor: string | null | undefined, page: number) {
  if (!cursor) return { page, freshCursor: null };

  const [pagePart, freshCursor] = cursor.split(SEP);
  const parsed = Number.parseInt(pagePart, 10);

  return {
    page: Number.isFinite(parsed) && parsed > 0 ? parsed : page,
    freshCursor: freshCursor || null,
  };
}

async function fetchLegacy(
  params: ChapterListParams,
  page: number,
): Promise<ChapterListResult | null> {
  const url = new URL(`${LEGACY_HOST}/v1/chapter/${params.seriesId}/list`);

  url.searchParams.set('sort_by', 'chapter_number');
  url.searchParams.set('sort_order', params.sortOrder);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(params.pageSize));
  url.searchParams.set('search', params.search || '');

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(LEGACY_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const { data, meta } = LegacyResponseSchema.parse(await response.json());

    return {
      data,
      meta: {
        total_record: meta.total_record,
        next_cursor: page < meta.total_page ? String(page + 1) : null,
      },
    };
  } catch {
    return null;
  }
}

/**
 * GET JSON from the fresh host, retrying transient failures. Network
 * errors and non-JSON bodies used to escape as 500s; they now surface as a
 * 502 only after the retries are spent.
 */
async function fetchFreshJson(url: URL): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= FRESH_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FRESH_TIMEOUT_MS),
      });

      // 4xx will not get better on retry.
      if (response.status >= 400 && response.status < 500) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: `Chapter list request failed (${response.status})`,
        });
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      lastError = error;
    }
  }

  throw new TRPCError({
    code: 'BAD_GATEWAY',
    message: 'Failed to fetch chapter list',
    cause: lastError,
  });
}

async function fetchFresh(
  params: ChapterListParams,
  page: number,
  freshCursor: string | null,
): Promise<ChapterListResult> {
  const url = new URL(`${FRESH_HOST}/v1/chapter/${params.seriesId}/list`);

  url.searchParams.set('sort_by', 'chapter_number');
  url.searchParams.set('sort_order', params.sortOrder);

  if (params.search) url.searchParams.set('search', params.search);

  // Without a fresh cursor (e.g. earlier pages came from the legacy
  // host) fetch everything up to this page and keep only its slice.
  const skip = freshCursor ? 0 : (page - 1) * params.pageSize;

  url.searchParams.set('limit', String(skip + params.pageSize));
  if (freshCursor) url.searchParams.set('cursor', freshCursor);

  const parsed = FreshResponseSchema.safeParse(await fetchFreshJson(url));

  if (!parsed.success) {
    throw new TRPCError({
      code: 'BAD_GATEWAY',
      message: parsed.error.issues.map((issue) => issue.message).join(', '),
    });
  }

  const { data, meta } = parsed.data;
  const hasNext = !!meta.has_next && !!meta.next_cursor;

  return {
    data: data.slice(skip),
    meta: {
      total_record: null,
      next_cursor: hasNext ? `${page + 1}${SEP}${meta.next_cursor}` : null,
    },
  };
}

/**
 * Chapter list from the fresh cursor-based host, falling back to the legacy
 * page-based host when the fresh one fails.
 */
export async function fetchChapterList(
  params: ChapterListParams,
): Promise<ChapterListResult> {
  const { page, freshCursor } = parseCursor(params.cursor, params.page);

  try {
    return await fetchFresh(params, page, freshCursor);
  } catch (error) {
    const legacy = await fetchLegacy(params, page);

    if (legacy) return legacy;

    throw error;
  }
}
