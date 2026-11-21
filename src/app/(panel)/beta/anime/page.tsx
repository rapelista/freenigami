import type { Metadata } from 'next';

import { AnimeHome } from '~/components/anime-beta/home';

export const metadata: Metadata = { title: 'Anime' };

export default function Page() {
  return <AnimeHome />;
}
