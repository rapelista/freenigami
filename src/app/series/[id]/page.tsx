import { Suspense } from 'react';

import { SeriesDetail } from '~/components/series/[id]';
import { Chapters } from '~/components/series/[id]/chapters';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <Suspense>
        <SeriesDetail />
      </Suspense>

      <Suspense>
        <Chapters />
      </Suspense>
    </main>
  );
}
