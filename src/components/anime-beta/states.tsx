import { SearchX, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

import { browseHref } from '~/lib/anime';

/** True when a tRPC query failed with 404. */
export const isNotFound = (error: unknown) =>
  (error as { data?: { httpStatus?: number } } | null)?.data?.httpStatus ===
  404;

export function NotFoundState() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-24 text-center">
      <SearchX className="size-8 text-accent" />
      <h1 className="text-lg font-semibold">
        Anime atau episode tidak ditemukan
      </h1>
      <p className="text-sm text-muted">
        Mungkin sudah dihapus atau tautannya salah.
      </p>
      <Link
        className="accent-gradient mt-2 rounded-lg px-4 py-2 text-sm font-medium"
        href={browseHref()}
      >
        Jelajahi anime
      </Link>
    </div>
  );
}

export function ErrorState({
  onRetry,
  compact,
}: {
  onRetry: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
        Bagian ini gagal dimuat.
        <button
          className="font-medium text-accent hover:text-amber-deep"
          type="button"
          onClick={onRetry}
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-24 text-center">
      <TriangleAlert className="size-8 text-accent" />
      <h1 className="text-lg font-semibold">Gagal memuat data</h1>
      <p className="text-sm text-muted">
        Sumber data sedang tidak bisa dihubungi. Coba lagi beberapa saat lagi.
      </p>
      <button
        className="accent-gradient mt-2 rounded-lg px-4 py-2 text-sm font-medium"
        type="button"
        onClick={onRetry}
      >
        Coba lagi
      </button>
    </div>
  );
}
