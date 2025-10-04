import { Suspense } from 'react';

import { ChapterDetail } from '~/components/chapter/[id]';

export default function Page() {
  return (
    <main className="w-full mx-auto h-full">
      <Suspense>
        <ChapterDetail />
      </Suspense>
    </main>
  );
}
