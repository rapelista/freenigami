import type { Metadata } from 'next';

import { Suspense } from 'react';

import { AnimeBrowse } from '~/components/anime-beta/browse';

export const metadata: Metadata = { title: 'Jelajah' };

export default function Page() {
  return (
    <main>
      <Suspense>
        <AnimeBrowse />
      </Suspense>
    </main>
  );
}
