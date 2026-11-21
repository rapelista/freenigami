const PRIMARY_API_HOST = 'api.shngm.io';
const FALLBACK_API_HOST = 'api.shinigami.io';

/**
 * Fetch from the primary API host, retrying on the fallback host when the
 * primary is unreachable or responds with a server error (5xx).
 */
export async function fetchApi(input: string | URL, init?: RequestInit) {
  const url = new URL(input);

  try {
    const response = await fetch(url, init);

    if (response.status < 500 || url.hostname !== PRIMARY_API_HOST) {
      return response;
    }
  } catch (error) {
    if (url.hostname !== PRIMARY_API_HOST) {
      throw error;
    }
  }

  url.hostname = FALLBACK_API_HOST;

  return fetch(url, init);
}
