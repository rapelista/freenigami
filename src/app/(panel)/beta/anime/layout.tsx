import type { Metadata } from 'next';

import { Suspense } from 'react';

import { AnimeSubNav } from '~/components/anime-beta/sub-nav';

export const metadata: Metadata = {
  title: { template: '%s · Anime', default: 'Anime' },
  // The media host 403s any request carrying a foreign Referer (hotlink
  // rule); <img>, <video poster> and iframes follow the document policy.
  referrer: 'no-referrer',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5">
      <Suspense>
        <AnimeSubNav />
      </Suspense>
      {children}
    </div>
  );
}
