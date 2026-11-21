import { NextResponse } from 'next/server';

import { PROBE_URL, probeMikonime } from '~/services/anime/mikonime-probe';

/**
 * Cloudflare probe for api.mikonime.stream, meant to be curled against the
 * deployed app: `commit` ties a reading to a deployment so stale builds
 * cannot be mistaken for fresh evidence.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await probeMikonime();

  return NextResponse.json({
    probeUrl: PROBE_URL,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    region: process.env.VERCEL_REGION ?? null,
    probedAt: new Date().toISOString(),
    results,
  });
}
