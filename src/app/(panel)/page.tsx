import { Suspense } from 'react';

import { Latest } from '~/components/(panel)/latest';
import { Recommendation } from '~/components/(panel)/recommendation';

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Rekomendasi</h1>

        <Suspense>
          <Recommendation />
        </Suspense>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Update Terbaru</h1>

        <Suspense>
          <Latest />
        </Suspense>
      </div>
    </main>
  );
}
