import type { Metadata } from 'next';

import { AnimeHistory } from '~/components/anime-beta/history';

export const metadata: Metadata = { title: 'Riwayat' };

export default function Page() {
  return (
    <main>
      <AnimeHistory />
    </main>
  );
}
