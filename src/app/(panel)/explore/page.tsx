import { Suspense } from 'react';

import { Explore } from '~/components/(panel)/explore';
import { ExploreSearch } from '~/components/(panel)/explore/search';
import { ExploreSort } from '~/components/(panel)/explore/sort';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <Suspense>
        <div className="flex gap-2">
          <ExploreSearch />

          <ExploreSort />
        </div>

        <Explore />
      </Suspense>
    </main>
  );
}
