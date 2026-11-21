import type { Metadata } from 'next';

import { PROBE_URL, probeMikonime } from '~/services/anime/mikonime-probe';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Beta · Anime Probe' };

/** Diagnostics only: renders the Cloudflare probe matrix for this egress. */
export default async function Page() {
  const results = await probeMikonime();
  const passing = results.filter((r) => r.ok).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Mikonime Cloudflare Probe</h1>
        <p className="text-sm text-muted">
          {passing}/{results.length} varian header lolos dari egress server
          ini. JSON mentah: <code>/api/beta/anime</code>
        </p>
        <p className="break-all font-mono text-xs text-muted">{PROBE_URL}</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Varian</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Content-Type</th>
              <th className="px-4 py-3">Hasil</th>
              <th className="px-4 py-3 text-right">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.variant} className="border-b border-white/5 last:border-0 align-top">
                <td className="px-4 py-3 font-mono font-medium">{r.variant}</td>
                <td className="px-4 py-3">{r.status ?? '—'}</td>
                <td className="px-4 py-3 text-muted">
                  {r.contentType?.split(';')[0] ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={r.ok ? 'text-emerald-400' : 'text-red-400'}>
                    {r.ok ? 'LOLOS' : r.error ? 'ERROR' : 'DIBLOK'}
                  </span>
                  {!r.ok && (r.bodyPreview || r.error) && (
                    <pre className="mt-2 max-w-xl overflow-x-auto rounded-lg bg-black/40 p-3 text-xs whitespace-pre-wrap text-muted">
                      {r.error ?? r.bodyPreview}
                    </pre>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted">{r.ms} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Interpretasi: ada varian yang lolos → terapkan varian itu ke service
        mikonime. Semua diblok → block berbasis IP/ASN, bukan header.
      </p>
    </main>
  );
}
