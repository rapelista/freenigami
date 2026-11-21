'use client';

import { TriangleAlert } from 'lucide-react';

export default function AnimeError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-3 py-24 text-center">
      <TriangleAlert className="size-8 text-accent" />
      <h1 className="text-lg font-semibold">Halaman anime gagal dimuat</h1>
      <p className="text-sm text-muted">
        Sumber data sedang tidak bisa dihubungi. Coba lagi beberapa saat lagi.
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
