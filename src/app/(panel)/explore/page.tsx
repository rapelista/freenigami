import { Suspense } from 'react';

import { Explore } from '~/components/(panel)/explore';
import { ExploreToolbar } from '~/components/(panel)/explore/toolbar';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Daftar Komik</h1>

      <Suspense>
        <ExploreToolbar />

        <Explore />
      </Suspense>
    </main>
  );
}
