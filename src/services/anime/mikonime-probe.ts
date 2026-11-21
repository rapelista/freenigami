import https from 'node:https';

/**
 * Cloudflare block diagnosis for api.mikonime.stream: answers, from whatever
 * egress this code runs on, which header variants pass the upstream's bot
 * checks. Locally every variant passes; the question is what happens on a
 * datacenter IP (Vercel). See docs/superpowers/specs/2026-11-21-mikonime-cloudflare-probe-design.md.
 */
export const PROBE_URL =
  'https://api.mikonime.stream/backend/api/index.php?route=anime&is_hero=1&limit=2';

const API_HOST = 'api.mikonime.stream';

/**
 * Origin server behind Cloudflare (serves a Cloudflare Origin CA cert, so
 * TLS verification must be off — the cert is untrusted by design). Found via
 * --resolve probing; see the spec addendum. Fragile: changes if they move.
 */
const ORIGIN_IP = '195.88.211.20';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36';

export interface ProbeResult {
  variant: string;
  headers: Record<string, string>;
  status: number | null;
  contentType: string | null;
  isJson: boolean;
  ok: boolean;
  bodyPreview: string | null;
  error: string | null;
  ms: number;
}

interface ProbeVariant {
  name: string;
  headers: Record<string, string>;
  /** When set, bypass Cloudflare by connecting straight to this origin IP. */
  originIp?: string;
}

/** Ordered bare → maximally browser-shaped → direct-to-origin. */
const VARIANTS: ProbeVariant[] = [
  { name: 'bare', headers: {} },
  {
    name: 'ua',
    headers: { 'user-agent': CHROME_UA },
  },
  {
    name: 'site-headers',
    headers: {
      accept: '*/*',
      origin: 'https://mikonime.stream',
      referer: 'https://mikonime.stream/',
    },
  },
  {
    name: 'full-browser',
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,id;q=0.8',
      origin: 'https://mikonime.stream',
      referer: 'https://mikonime.stream/',
      'sec-ch-ua': '"Chromium";v="158", "Not.A/Brand";v="24", "Google Chrome";v="158"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': CHROME_UA,
    },
  },
  {
    name: 'origin-ip',
    headers: { host: API_HOST },
    originIp: ORIGIN_IP,
  },
];

/** GET via node:https pinned to an origin IP: SNI + Host stay on the real hostname. */
function originRequest(
  url: URL,
  headers: Record<string, string>,
  originIp: string,
): Promise<{ status: number; contentType: string | null; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: originIp,
        port: 443,
        path: `${url.pathname}${url.search}`,
        servername: url.hostname,
        // Cloudflare Origin CA certificates are untrusted by design.
        rejectUnauthorized: false,
        headers,
        signal: AbortSignal.timeout(8000),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            contentType: res.headers['content-type'] ?? null,
            body: Buffer.concat(chunks).toString('utf8'),
          }),
        );
      },
    );

    req.on('error', reject);
    req.end();
  });
}

/** One result per variant, in variant order; never throws. */
export async function probeMikonime(): Promise<ProbeResult[]> {
  const url = new URL(PROBE_URL);
  const results: ProbeResult[] = [];

  // Sequential on purpose: parallel requests could trip rate limiting and
  // make later variants fail for a reason that is not the one under test.
  for (const { name, headers, originIp } of VARIANTS) {
    const startedAt = Date.now();
    const base: ProbeResult = {
      variant: name,
      headers,
      status: null,
      contentType: null,
      isJson: false,
      ok: false,
      bodyPreview: null,
      error: null,
      ms: 0,
    };

    try {
      const res = originIp
        ? await originRequest(url, headers, originIp)
        : await fetch(PROBE_URL, {
            headers,
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
          }).then(async (r) => ({
            status: r.status,
            contentType: r.headers.get('content-type'),
            body: await r.text(),
          }));

      const isJson = (res.contentType ?? '').includes('json');

      results.push({
        ...base,
        status: res.status,
        contentType: res.contentType,
        isJson,
        ok: res.status === 200 && isJson,
        bodyPreview: isJson
          ? null
          : res.body.slice(0, 120).replaceAll('\n', ' '),
        ms: Date.now() - startedAt,
      });
    } catch (e) {
      results.push({
        ...base,
        error: e instanceof Error ? e.message : String(e),
        ms: Date.now() - startedAt,
      });
    }
  }

  return results;
}
