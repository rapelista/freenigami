import { Suspense } from 'react';

import { BookmarkList } from '~/components/bookmark/list';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Bookmark</h1>

        <Suspense>
          <BookmarkList />
        </Suspense>
      </div>
    </main>
  );
}
