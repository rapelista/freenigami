'use client';

import { MonitorPlay, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { cn } from '~/lib/utils';
import type { StreamSource } from '~/services/anime/mikonime';

import { VideoPlayer } from './video-player';

interface WatchProps {
  sources: StreamSource[];
  title: string;
  poster?: string | null;
  nextHref?: string;
}

/**
 * Source switcher around the player: direct video files go to the custom
 * player, embed-only servers fall back to an iframe.
 */
export function Watch({ sources, title, poster, nextHref }: WatchProps) {
  const [selectedId, setSelectedId] = useState(sources[0]?.id);
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const source = sources.find((s) => s.id === selectedId);

  // On a fatal playback error, move on to the next video source that has
  // not failed yet, so a dead server does not leave a black screen.
  const handleError = () => {
    if (!source) return;
    const nextFailed = new Set(failed).add(source.id);

    setFailed(nextFailed);
    const fallback = sources.find(
      (s) => s.kind === 'video' && !nextFailed.has(s.id),
    );

    if (fallback) setSelectedId(fallback.id);
  };

  const groups = Map.groupBy(sources, (s) => s.quality);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl bg-black">
        {!source ? (
          <div className="flex aspect-video items-center justify-center gap-2 text-muted">
            <TriangleAlert className="size-5" />
            Belum ada sumber streaming untuk episode ini.
          </div>
        ) : source.kind === 'video' ? (
          <VideoPlayer
            key={source.id}
            nextHref={nextHref}
            poster={poster ?? undefined}
            src={source.url}
            title={title}
            onError={handleError}
          />
        ) : (
          <iframe
            key={source.id}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            className="aspect-video w-full"
            referrerPolicy="no-referrer"
            src={source.url}
            title={title}
          />
        )}
      </div>

      {sources.length > 0 && (
        <div className="panel flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MonitorPlay className="size-4 text-accent" />
            Server
          </div>
          {[...groups].map(([quality, items]) => (
            <div key={quality} className="flex items-start gap-3">
              <span className="w-12 shrink-0 pt-1.5 text-xs font-semibold text-muted">
                {quality}
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <button
                    key={s.id}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      s.id === selectedId
                        ? 'accent-gradient'
                        : 'bg-surface-secondary hover:bg-surface-tertiary',
                      failed.has(s.id) && s.id !== selectedId && 'opacity-40',
                    )}
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                  >
                    {s.server}
                    {s.kind === 'embed' && (
                      <span className="ml-1 opacity-60">(embed)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
