import { AnimeDetailView } from '~/components/anime-beta/detail';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <AnimeDetailView slug={decodeURIComponent(slug)} />;
}
