import { Bookmark } from 'lucide-react';
import { Suspense } from 'react';

import { BookmarkList } from '~/components/bookmark/list';

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Bookmark className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Bookmarks</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Your saved series and chapters in one place
            </p>
          </div>
        </div>
      </div>

      {/* Bookmark List */}
      <Suspense fallback={<BookmarkListSkeleton />}>
        <BookmarkList />
      </Suspense>
    </main>
  );
}

// Loading skeleton component
function BookmarkListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border">
        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-5/10 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
