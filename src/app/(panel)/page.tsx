import { Suspense } from 'react';

import { Hero } from '~/components/(panel)/hero';
import { Latest } from '~/components/(panel)/latest';
import { Recommendation } from '~/components/(panel)/recommendation';

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-4 md:py-6">
      <h1 className="sr-only">Freenigami — baca komik terbaru</h1>

      <Hero />

      <Suspense>
        <Recommendation />
      </Suspense>

      <Suspense>
        <Latest />
      </Suspense>
    </main>
  );
}
