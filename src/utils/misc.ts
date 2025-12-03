export function generateFullUrl(base: string, params: object) {
  const url = new URL(base);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}
