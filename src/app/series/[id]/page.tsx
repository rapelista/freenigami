import { Suspense } from 'react';

import { SeriesChapters } from '~/components/series/[id]/chapters';
import { SeriesDetail } from '~/components/series/[id]/detail';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <Suspense>
        <SeriesDetail />
      </Suspense>

      <Suspense>
        <SeriesChapters />
      </Suspense>
    </main>
  );
}
