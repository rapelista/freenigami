import { Suspense } from 'react';

import { Explore } from '~/components/(panel)/explore';
import { ExploreSearch } from '~/components/(panel)/explore/search';
import { ExploreSort } from '~/components/(panel)/explore/sort';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Daftar Komik</h1>

      <Suspense>
        <div className="flex gap-2">
          <ExploreSearch />

          <ExploreSort />
        </div>

        <Explore />
      </Suspense>
    </main>
  );
}
