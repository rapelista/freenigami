import type { Metadata } from 'next';

import { AnimeList } from '~/components/anime/anime-list';

export const metadata: Metadata = { title: 'Anime Playground' };

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-xl font-semibold">Anime</h1>
        <p className="text-sm text-muted">
          Playground: katalog dari mikonime, scroll untuk memuat lebih banyak.
        </p>
      </div>
      <AnimeList />
    </main>
  );
}
