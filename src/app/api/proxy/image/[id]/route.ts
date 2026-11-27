import { NextRequest, NextResponse } from 'next/server';

/**
 * Image file names are content-addressed (they embed an upload timestamp and
 * random suffix), so a given id never changes: cache it for a year in the
 * browser and on the CDN (`s-maxage`), so repeat views never reach the server.
 */
const CACHE_HIT = 'public, max-age=31536000, s-maxage=31536000, immutable';

/** Short cache for misses so a temporarily missing image can recover. */
const CACHE_MISS = 'public, max-age=60, s-maxage=300';

// Where api.shinigami.io (the current data source) points image URLs.
const PRIMARY_BASES = [
  'https://cdn.shinigami.gg/assets/cover/',
  'https://cdn.shinigami.gg/assets/image/',
  'https://cdn.shinigami.gg/thumbnail/cover/',
  'https://cdn.shinigami.gg/thumbnail/image/',
];

// Legacy hosts, for older ids; only tried after every primary base failed.
const FALLBACK_BASES = [
  'https://storage.shngm.id/thumbnail/cover/',
  'https://storage.shngm.id/low/unsafe/filters:format(webp):quality(70)/thumbnail/image/',
  'https://assets.shngm.id/thumbnail/image/',
  'https://assets.shngm.id/thumbnail/cover/',
];

function fetchFirst(bases: string[], id: string) {
  return Promise.any(
    bases.map((base) =>
      fetch(`${base}${id}`).then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);

        return res;
      }),
    ),
  );
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let response: Response;

  try {
    response = await fetchFirst(PRIMARY_BASES, id).catch(() =>
      fetchFirst(FALLBACK_BASES, id),
    );
  } catch {
    return new NextResponse(null, {
      status: 404,
      headers: { 'Cache-Control': CACHE_MISS },
    });
  }

  const headers = new Headers({ 'Cache-Control': CACHE_HIT });

  const contentType = response.headers.get('Content-Type');
  const contentLength = response.headers.get('Content-Length');

  if (contentType) headers.set('Content-Type', contentType);
  if (contentLength) headers.set('Content-Length', contentLength);

  // Stream the upstream body instead of buffering it in memory.
  return new NextResponse(response.body, { headers });
}
