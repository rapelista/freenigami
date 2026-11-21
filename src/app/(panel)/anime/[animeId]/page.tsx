import type { Metadata } from 'next';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Watch } from '~/components/anime/watch';
import { cn } from '~/lib/utils';
import {
  getEpisodes,
  getStreamSources,
  mediaUrl,
} from '~/services/anime/mikonime';

export const metadata: Metadata = { title: 'Anime Player Playground' };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ animeId: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const [{ animeId }, { ep }] = await Promise.all([params, searchParams]);
  const id = Number(animeId);

  if (!Number.isInteger(id)) notFound();

  const episodes = await getEpisodes(id);
  const href = (episode: number) => `/anime/${id}?ep=${episode}`;
  const current =
    episodes.find((e) => String(e.episode_number) === ep) ?? episodes[0];

  if (!current) {
    return <p className="p-6 text-muted">Belum ada episode untuk anime ini.</p>;
  }

  const sources = await getStreamSources(current.id);
  const index = episodes.indexOf(current);
  const prev = episodes[index - 1];
  const next = episodes[index + 1];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <section className="flex min-w-0 flex-1 flex-col gap-4">
        <Watch
          key={current.id}
          nextHref={next && href(next.episode_number)}
          poster={mediaUrl(current.thumbnail) ?? mediaUrl(current.poster)}
          sources={sources}
          title={`${current.anime_title} · Episode ${current.episode_number}`}
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{current.anime_title}</p>
            <h1 className="text-lg font-semibold">
              Episode {current.episode_number}
            </h1>
          </div>
          <div className="flex gap-2">
            {prev && (
              <Link
                className="rounded-lg bg-amber-soft/70 px-3 py-1.5 text-sm hover:bg-amber-soft"
                href={href(prev.episode_number)}
              >
                Sebelumnya
              </Link>
            )}
            {next && (
              <Link
                className="accent-gradient rounded-lg px-3 py-1.5 text-sm font-medium"
                href={href(next.episode_number)}
              >
                Selanjutnya
              </Link>
            )}
          </div>
        </div>
      </section>

      <aside className="panel flex flex-col gap-3 p-4 lg:w-72">
        <h2 className="font-semibold">Episode</h2>
        <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
          {episodes.map((e) => (
            <Link
              key={e.id}
              aria-current={e.id === current.id ? 'page' : undefined}
              className={cn(
                'rounded-lg py-2 text-center text-sm font-medium transition-colors',
                e.id === current.id
                  ? 'accent-gradient'
                  : 'bg-surface-secondary hover:bg-surface-tertiary',
              )}
              href={href(e.episode_number)}
            >
              {e.episode_number}
            </Link>
          ))}
        </div>
      </aside>
    </main>
  );
}
