'use client';

import { TriangleAlert } from 'lucide-react';

/**
 * mikonime's API sits behind Cloudflare, which rejects requests from some
 * networks (notably Vercel's data-center IPs answer with 403). Show that
 * instead of a bare 500.
 */
export default function AnimeError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
      <TriangleAlert className="size-8 text-accent" />
      <h1 className="text-lg font-semibold">Sumber anime tidak bisa diakses</h1>
      <p className="text-sm text-muted">
        Server sumber (mikonime) menolak permintaan dari server ini. Halaman ini
        masih playground dan saat ini hanya berjalan di lingkungan lokal.
      </p>
      <button
        className="accent-gradient mt-2 rounded-lg px-4 py-2 text-sm font-medium"
        type="button"
        onClick={reset}
      >
        Coba lagi
      </button>
    </main>
  );
}
