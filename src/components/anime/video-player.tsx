'use client';

import type Hls from 'hls.js';

import {
  FastForward,
  Gauge,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Rewind,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '~/lib/utils';

const HIDE_DELAY = 3000;
const SEEK_STEP = 10;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type Flash = 'play' | 'pause' | 'forward' | 'rewind';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  nextHref?: string;
  /** Fatal playback error, e.g. a dead server. */
  onError?: () => void;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Custom player on a native `<video>`: mp4 plays directly, `.m3u8` goes
 * through hls.js (or native HLS on Safari).
 */
export function VideoPlayer({
  src,
  title,
  poster,
  nextHref,
  onError,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [speedMenu, setSpeedMenu] = useState(false);
  const [hover, setHover] = useState<{ pct: number; time: number } | null>(
    null,
  );
  const [flash, setFlash] = useState<Flash | null>(null);

  // Attach the source. hls.js is loaded lazily, only for HLS streams on
  // browsers without native support.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const isHls = /\.m3u8($|\?)/.test(src);
    let hls: Hls | undefined;
    let cancelled = false;

    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: HlsJs }) => {
        if (cancelled || !HlsJs.isSupported()) return;
        hls = new HlsJs();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(HlsJs.Events.ERROR, (_e, data) => {
          if (data.fatal) onErrorRef.current?.();
        });
      });
    } else {
      video.src = src;
    }

    video.play().catch(() => setPlaying(false));

    return () => {
      cancelled = true;
      hls?.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [src]);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);

    document.addEventListener('fullscreenchange', onChange);

    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const showFlash = useCallback((kind: Flash) => {
    setFlash(kind);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 500);
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, HIDE_DELAY);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(hideTimer.current);
      clearTimeout(flashTimer.current);
    },
    [],
  );

  // Paused or menu open: keep controls on screen.
  const showControls = controlsVisible || !playing || speedMenu;

  const togglePlay = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      showFlash('play');
    } else {
      video.pause();
      showFlash('pause');
    }
  }, [showFlash]);

  const seekBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;

      if (!video) return;
      video.currentTime = Math.max(
        0,
        Math.min(video.duration || 0, video.currentTime + delta),
      );
      showFlash(delta > 0 ? 'forward' : 'rewind');
      revealControls();
    },
    [revealControls, showFlash],
  );

  const changeVolume = useCallback((value: number) => {
    const video = videoRef.current;

    if (!video) return;
    const v = Math.max(0, Math.min(1, value));

    video.volume = v;
    video.muted = v === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.5;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await containerRef.current?.requestFullscreen().catch(() => {});
  }, []);

  const togglePip = async () => {
    const video = videoRef.current;

    if (!video) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await video.requestPictureInPicture().catch(() => {});
  };

  const changeSpeed = (value: number) => {
    if (videoRef.current) videoRef.current.playbackRate = value;
    setSpeed(value);
    setSpeedMenu(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      if (
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '') ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      const video = videoRef.current;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          togglePlay();
          break;
        case 'arrowright':
        case 'l':
          seekBy(SEEK_STEP);
          break;
        case 'arrowleft':
        case 'j':
          seekBy(-SEEK_STEP);
          break;
        case 'arrowup':
          changeVolume((video?.volume ?? 1) + 0.1);
          break;
        case 'arrowdown':
          changeVolume((video?.volume ?? 1) - 0.1);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          void toggleFullscreen();
          break;
        default:
          return;
      }
      e.preventDefault();
      revealControls();
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [
    changeVolume,
    revealControls,
    seekBy,
    toggleFullscreen,
    toggleMute,
    togglePlay,
  ]);

  const pctOf = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;

    if (!video || !duration) return;
    video.currentTime = pctOf(e) * duration;
    setCurrent(video.currentTime);
  };

  const progress = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const FlashIcon = {
    play: Play,
    pause: Pause,
    forward: FastForward,
    rewind: Rewind,
  }[flash ?? 'play'];

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative aspect-video w-full select-none bg-black',
        !showControls && 'cursor-none',
      )}
      onPointerLeave={() => playing && setControlsVisible(false)}
      onPointerMove={revealControls}
    >
      <video
        ref={videoRef}
        playsInline
        className="size-full"
        poster={poster}
        preload="metadata"
        onCanPlay={() => setWaiting(false)}
        onClick={togglePlay}
        onDoubleClick={() => void toggleFullscreen()}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onError={() => onErrorRef.current?.()}
        onPause={() => setPlaying(false)}
        onPlay={() => {
          setPlaying(true);
          revealControls();
        }}
        onPlaying={() => setWaiting(false)}
        onProgress={(e) => {
          const b = e.currentTarget.buffered;

          if (b.length) setBuffered(b.end(b.length - 1));
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onWaiting={() => setWaiting(true)}
      />

      {/* Center: spinner while buffering, big play button while paused. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {waiting && playing ? (
          <Loader2 className="size-12 animate-spin text-white/90" />
        ) : (
          !playing && (
            <button
              aria-label="Putar"
              className="accent-gradient pointer-events-auto flex size-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
              type="button"
              onClick={togglePlay}
            >
              <Play className="ml-1 size-7 fill-current" />
            </button>
          )
        )}
      </div>

      {flash && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            key={flash}
            className="flex animate-fade-in flex-col items-center gap-1 rounded-full bg-black/50 p-4 text-white"
          >
            <FlashIcon className="size-8 fill-current" />
            {(flash === 'forward' || flash === 'rewind') && (
              <span className="text-xs font-semibold">{SEEK_STEP}s</span>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/80 to-transparent p-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <p className="truncate text-sm font-medium text-white">{title}</p>
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t from-black/90 via-black/50 to-transparent px-4 pt-10 pb-3 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div
          aria-label="Posisi video"
          aria-valuemax={Math.floor(duration)}
          aria-valuemin={0}
          aria-valuenow={Math.floor(current)}
          className="group/seek relative flex h-4 cursor-pointer items-center"
          role="slider"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            scrub(e);
          }}
          onPointerLeave={() => setHover(null)}
          onPointerMove={(e) => {
            const pct = pctOf(e);

            setHover({ pct: pct * 100, time: pct * duration });
            if (e.currentTarget.hasPointerCapture(e.pointerId)) scrub(e);
          }}
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-[height] group-hover/seek:h-1.5">
            <div
              className="absolute inset-y-0 left-0 bg-white/30"
              style={{ width: `${bufferedPct}%` }}
            />
            {hover && (
              <div
                className="absolute inset-y-0 left-0 bg-white/30"
                style={{ width: `${hover.pct}%` }}
              />
            )}
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-accent to-amber-deep"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div
            className="absolute size-3 -translate-x-1/2 scale-0 rounded-full bg-accent shadow transition-transform group-hover/seek:scale-100"
            style={{ left: `${progress}%` }}
          />
          {hover && duration > 0 && (
            <div
              className="pointer-events-none absolute bottom-5 -translate-x-1/2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white tabular-nums"
              style={{ left: `${Math.min(97, Math.max(3, hover.pct))}%` }}
            >
              {formatTime(hover.time)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-white">
          <ControlButton
            label={playing ? 'Jeda (K)' : 'Putar (K)'}
            onClick={togglePlay}
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </ControlButton>
          <ControlButton
            label="Mundur 10 detik (←)"
            onClick={() => seekBy(-SEEK_STEP)}
          >
            <Rewind className="size-5" />
          </ControlButton>
          <ControlButton
            label="Maju 10 detik (→)"
            onClick={() => seekBy(SEEK_STEP)}
          >
            <FastForward className="size-5" />
          </ControlButton>

          <div className="group/vol flex items-center">
            <ControlButton label="Bisukan (M)" onClick={toggleMute}>
              <VolumeIcon className="size-5" />
            </ControlButton>
            <input
              aria-label="Volume"
              className="h-1 w-0 cursor-pointer accent-(--accent) opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 focus-visible:w-20 focus-visible:opacity-100"
              max={1}
              min={0}
              step={0.05}
              type="range"
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
            />
          </div>

          <span className="ml-2 text-xs font-medium tabular-nums text-white/90">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            {nextHref && (
              <Link
                aria-label="Episode selanjutnya"
                className="flex size-9 items-center justify-center rounded-lg hover:bg-white/10"
                href={nextHref}
                title="Episode selanjutnya"
              >
                <SkipForward className="size-5 fill-current" />
              </Link>
            )}

            <div className="relative">
              <ControlButton
                label="Kecepatan"
                onClick={() => setSpeedMenu((v) => !v)}
              >
                <Gauge className="size-5" />
                {speed !== 1 && (
                  <span className="absolute -top-0.5 -right-0.5 rounded bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {speed}x
                  </span>
                )}
              </ControlButton>
              {speedMenu && (
                <div className="absolute right-0 bottom-11 flex w-28 animate-fade-in flex-col overflow-hidden rounded-lg bg-black/90 py-1 text-sm shadow-xl">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      className={cn(
                        'px-3 py-1.5 text-left hover:bg-white/10',
                        s === speed && 'font-semibold text-accent',
                      )}
                      type="button"
                      onClick={() => changeSpeed(s)}
                    >
                      {s === 1 ? 'Normal' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ControlButton
              label="Picture-in-picture"
              onClick={() => void togglePip()}
            >
              <PictureInPicture2 className="size-5" />
            </ControlButton>
            <ControlButton
              label={fullscreen ? 'Keluar layar penuh (F)' : 'Layar penuh (F)'}
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="relative flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
