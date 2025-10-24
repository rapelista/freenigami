import { Suspense } from 'react';

import { ChapterDetail } from '~/components/read/[seriesId]/[chapterId]/detail';

export default async function Page({
  params,
}: {
  params: Promise<{
    seriesId: string;
    chapterId: string;
  }>;
}) {
  const { seriesId, chapterId } = await params;

  return (
    <main className="w-full mx-auto h-full">
      <Suspense>
        <ChapterDetail chapterId={chapterId} seriesId={seriesId} />
      </Suspense>
    </main>
  );
}
