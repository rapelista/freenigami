import { AnimeWatchView } from '~/components/anime-beta/watch-view';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; number: string }>;
}) {
  const { slug, number } = await params;

  return (
    <AnimeWatchView
      // Remount per episode so the player and its state start fresh.
      key={number}
      number={decodeURIComponent(number)}
      slug={decodeURIComponent(slug)}
    />
  );
}
