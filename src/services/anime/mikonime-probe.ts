/**
 * Cloudflare block diagnosis for api.mikonime.stream: answers, from whatever
 * egress this code runs on, which header variants pass the upstream's bot
 * checks. Locally every variant passes; the question is what happens on a
 * datacenter IP (Vercel). See docs/superpowers/specs/2026-11-21-mikonime-cloudflare-probe-design.md.
 */
export const PROBE_URL =
  'https://api.mikonime.stream/backend/api/index.php?route=anime&is_hero=1&limit=2';

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

/** Ordered bare → maximally browser-shaped, so the matrix reads as a ramp. */
const VARIANTS: Array<[string, Record<string, string>]> = [
  ['bare', {}],
  [
    'ua',
    {
      'user-agent': CHROME_UA,
    },
  ],
  [
    'site-headers',
    {
      accept: '*/*',
      origin: 'https://mikonime.stream',
      referer: 'https://mikonime.stream/',
    },
  ],
  [
    'full-browser',
    {
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
  ],
];

/** One result per variant, in variant order; never throws. */
export async function probeMikonime(): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];

  // Sequential on purpose: parallel requests could trip rate limiting and
  // make later variants fail for a reason that is not the one under test.
  for (const [variant, headers] of VARIANTS) {
    const startedAt = Date.now();
    const base: ProbeResult = {
      variant,
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
      const res = await fetch(PROBE_URL, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      const contentType = res.headers.get('content-type');
      const isJson = (contentType ?? '').includes('json');
      const body = await res.text();

      results.push({
        ...base,
        status: res.status,
        contentType,
        isJson,
        ok: res.ok && isJson,
        bodyPreview: isJson ? null : body.slice(0, 120).replaceAll('\n', ' '),
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
