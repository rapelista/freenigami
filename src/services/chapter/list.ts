import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { ChapterSchema } from '~/schema/chapter';

const PRIMARY_HOST = 'https://api.shngm.io';
const FALLBACK_HOST = 'https://api.shinigami.io';

/** Cursor separator; fallback cursors are base64url so never contain it. */
const SEP = '|';

/** Give up on the primary host quickly so the fallback can answer. */
const PRIMARY_TIMEOUT_MS = 6_000;
const FALLBACK_TIMEOUT_MS = 10_000;
/** Extra attempts for the fallback host on network/5xx/invalid-JSON errors. */
const FALLBACK_RETRIES = 1;

const PrimaryResponseSchema = z.object({
  data: z.array(ChapterSchema),
  meta: z.object({
    total_page: z.number(),
    total_record: z.number(),
  }),
});

const FallbackResponseSchema = z.object({
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
    /** Unknown when served by the fallback host. */
    total_record: number | null;
    next_cursor: string | null;
  };
}

/**
 * The cursor is "<page>" or "<page>|<fallback cursor>". The page number
 * drives the primary host; the fallback cursor (when known) drives the
 * cursor-based fallback host.
 */
function parseCursor(cursor: string | null | undefined, page: number) {
  if (!cursor) return { page, fallbackCursor: null };

  const [pagePart, fallbackCursor] = cursor.split(SEP);
  const parsed = Number.parseInt(pagePart, 10);

  return {
    page: Number.isFinite(parsed) && parsed > 0 ? parsed : page,
    fallbackCursor: fallbackCursor || null,
  };
}

async function fetchPrimary(
  params: ChapterListParams,
  page: number,
): Promise<ChapterListResult | null> {
  const url = new URL(`${PRIMARY_HOST}/v1/chapter/${params.seriesId}/list`);

  url.searchParams.set('sort_by', 'chapter_number');
  url.searchParams.set('sort_order', params.sortOrder);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(params.pageSize));
  url.searchParams.set('search', params.search || '');

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(PRIMARY_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const { data, meta } = PrimaryResponseSchema.parse(await response.json());

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
 * GET JSON from the fallback host, retrying transient failures. Network
 * errors and non-JSON bodies used to escape as 500s; they now surface as a
 * 502 only after the retries are spent.
 */
async function fetchFallbackJson(url: URL): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= FALLBACK_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FALLBACK_TIMEOUT_MS),
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

async function fetchFallback(
  params: ChapterListParams,
  page: number,
  fallbackCursor: string | null,
): Promise<ChapterListResult> {
  const url = new URL(`${FALLBACK_HOST}/v1/chapter/${params.seriesId}/list`);

  url.searchParams.set('sort_by', 'chapter_number');
  url.searchParams.set('sort_order', params.sortOrder);

  if (params.search) url.searchParams.set('search', params.search);

  // Without a fallback cursor (e.g. earlier pages came from the primary
  // host) fetch everything up to this page and keep only its slice.
  const skip = fallbackCursor ? 0 : (page - 1) * params.pageSize;

  url.searchParams.set('limit', String(skip + params.pageSize));
  if (fallbackCursor) url.searchParams.set('cursor', fallbackCursor);

  const parsed = FallbackResponseSchema.safeParse(await fetchFallbackJson(url));

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
 * Chapter list that keeps paginating even when the primary host fails and
 * the cursor-based fallback host answers instead.
 */
export async function fetchChapterList(
  params: ChapterListParams,
): Promise<ChapterListResult> {
  const { page, fallbackCursor } = parseCursor(params.cursor, params.page);

  // Once on the fallback cursor chain, stay on it so pages line up.
  if (!fallbackCursor) {
    const primary = await fetchPrimary(params, page);

    if (primary) return primary;
  }

  return fetchFallback(params, page, fallbackCursor);
}
