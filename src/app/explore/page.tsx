import { Suspense } from 'react';

import { Explore } from '~/components/explore';
import { ExploreSearch } from '~/components/explore/search';
import {
  ExploreSettings,
  ExploreSettingsButton,
} from '~/components/explore/settings';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <Suspense>
        <div>
          <div className="flex gap-2">
            <ExploreSearch className="flex-1" />
            <ExploreSettingsButton />
          </div>

          <div>
            <ExploreSettings />
          </div>
        </div>

        <Explore />
      </Suspense>
    </main>
  );
}
