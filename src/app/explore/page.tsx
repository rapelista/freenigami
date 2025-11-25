import { Suspense } from 'react';

import { Explore } from '~/components/explore';
import { ExploreSearch } from '~/components/explore/search';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <Suspense>
        <ExploreSearch className="flex-1" />

        <Explore />
      </Suspense>
    </main>
  );
}
