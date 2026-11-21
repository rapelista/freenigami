/**
 * One-off Cloudflare probe baseline (no framework tests in this repo).
 * Standalone: duplicates the variants in src/services/anime/mikonime-probe.ts
 * on purpose — it must keep running even if the probe module changes.
 *
 * Usage: node scripts/probe-once.mjs
 */
const PROBE_URL =
  'https://api.mikonime.stream/backend/api/index.php?route=anime&is_hero=1&limit=2';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36';

const VARIANTS = [
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

for (const [name, headers] of VARIANTS) {
  try {
    const res = await fetch(PROBE_URL, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const contentType = res.headers.get('content-type') ?? '';
    const body = await res.text();
    console.log(
      `${name.padEnd(13)} status=${res.status} type=${contentType.split(';')[0]} isJson=${contentType.includes('json')} body=${body.slice(0, 60).replaceAll('\n', ' ')}`,
    );
  } catch (e) {
    console.log(`${name.padEnd(13)} FETCH_ERROR ${e.message}`);
  }
}
