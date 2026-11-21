import { Bookmark } from 'lucide-react';
import { Suspense } from 'react';

import { BookmarkList } from '~/components/(panel)/bookmark/list';
import { BookmarkTabs } from '~/components/(panel)/bookmark/tabs';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-foreground/10">
            <Bookmark className="w-6 h-6 text-surface-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookmark Saya</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Series dan chapter yang kamu simpan di browser ini
            </p>
          </div>
        </div>
      </div>

      <Suspense>
        <BookmarkTabs />
      </Suspense>

      <Suspense>
        <BookmarkList />
      </Suspense>
    </main>
  );
}
