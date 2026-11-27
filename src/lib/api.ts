/** Fresh host used by s1.shinigami.mx. */
const PRIMARY_API_HOST = 'api.shinigami.io';
/** Legacy host; its CDN can serve stale data, so it is only a backup. */
const FALLBACK_API_HOST = 'api.shngm.io';

const API_HOSTS = new Set([PRIMARY_API_HOST, FALLBACK_API_HOST]);

/**
 * Fetch an API URL (either host) from the primary host, retrying on the
 * fallback host when the primary is unreachable or responds with a server
 * error (5xx). Other URLs are fetched as-is.
 */
export async function fetchApi(input: string | URL, init?: RequestInit) {
  const url = new URL(input);

  if (!API_HOSTS.has(url.hostname)) return fetch(url, init);

  url.hostname = PRIMARY_API_HOST;

  try {
    const response = await fetch(url, init);

    if (response.status < 500) return response;
  } catch {
    // Fall through to the fallback host.
  }

  url.hostname = FALLBACK_API_HOST;

  return fetch(url, init);
}
