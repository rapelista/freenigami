import { Suspense } from 'react';

import { SeriesChapters } from '~/components/(panel)/series/[seriesId]/chapters';
import { SeriesDetail } from '~/components/(panel)/series/[seriesId]/detail';

export default async function Page({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <Suspense>
        <SeriesDetail seriesId={seriesId} />
      </Suspense>

      <Suspense>
        <SeriesChapters seriesId={seriesId} />
      </Suspense>
    </main>
  );
}
