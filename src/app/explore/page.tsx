import { Suspense } from 'react';

import { Explore } from '~/components/explore';
import { ExploreSearch } from '~/components/explore/search';
import { ExploreSelect } from '~/components/explore/select';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <Suspense>
        <div className="flex gap-4">
          <ExploreSearch className="flex-1" />
          <ExploreSelect />
        </div>

        <Explore />
      </Suspense>
    </main>
  );
}
