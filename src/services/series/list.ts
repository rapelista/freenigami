import { TRPCError } from '@trpc/server';
import { getStatusKeyFromCode } from '@trpc/server/unstable-core-do-not-import';

import { CACHE_TAGS } from '~/configs/cache';
import { generateFullUrl } from '~/utils/misc';

export async function fetchSeriesList(params: object) {
  const baseUrl = 'https://api.shngm.io/v1/manga/list';
  const url = generateFullUrl(baseUrl, params);

  const response = await fetch(url, {
    cache: 'force-cache',
    next: {
      revalidate: 3_600,
      tags: [CACHE_TAGS.SERIES_LIST],
    },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: getStatusKeyFromCode(response.status),
      message: 'Failed to fetch series list',
    });
  }

  return await response.json();
}
