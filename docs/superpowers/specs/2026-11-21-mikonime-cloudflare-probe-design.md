# Mikonime Cloudflare Probe — Design (short)

## Intent & why

`freenigami.vercel.app` gets `mikonime <route>: 403 (non-JSON response)` from
`api.mikonime.stream` on every server-side fetch (RSC + tRPC), while the same
code works locally. We must find out whether the block is caused by missing
browser headers or by Vercel's datacenter egress IP, because the fix differs:

- headers → apply the passing header set to `request()` in
  `src/services/anime/mikonime.ts`;
- IP/ASN → headers are useless; different options (caching, egress proxy, …).

## Evidence so far

From a residential IP, all header variants pass — bare fetch included:

| variant | local result |
| --- | --- |
| bare (no headers) | 200 JSON |
| User-Agent only | 200 JSON |
| Origin+Referer only | 200 JSON |
| full browser headers | 200 JSON |

So locally headers are irrelevant; the only difference in production is the
egress IP. Whether header mimicking still lifts the block on a datacenter IP
**cannot be tested locally** — it must run on Vercel.

## Goals

- One probe that, when hit on the deployed app, answers: which header
  variants (if any) pass Cloudflare from Vercel's egress?
- Exposed at `GET /api/beta/anime` (JSON, curl-able) and `/beta/anime`
  (rendered table).
- Response identifies the deployment (`VERCEL_GIT_COMMIT_SHA`, `VERCEL_REGION`)
  so stale deployments can't produce confusing readings.

## Non-goals

- No change to `src/services/anime/mikonime.ts` in this change — the fix is a
  follow-up once the probe names a passing variant.
- No proxy/egress infrastructure, no caching changes.

## Approaches considered

1. **Probe harness on Vercel (chosen)** — read ground truth from the actual
   failing environment; decides the fix with evidence.
2. **Blindly add browser headers to `request()`** — rejected: local evidence
   says headers don't matter from a clean IP, so it may ship a no-op "fix"
   and re-discover the 403 in production.
3. **Mirror/queue data through another egress** — rejected for now: cost and
   complexity before the diagnosis is known.

## Decisions

- Variants probed (sequential, one small request each, `route=anime&limit=2`):
  `bare`, `ua` (Chrome UA only), `site-headers` (origin+referer+accept),
  `full-browser` (every header the real frontend sends, incl. `sec-*`).
- Both endpoints are `force-dynamic` — probe results must never be cached.
- Page lives outside the `(panel)` route group: it is a diagnostic tool, not
  product UI.

## Left to the builder

None — interface and variants are pinned in the plan.

## Addendum (2026-11-21, post-verdict)

Production probe (iad1) confirmed all 4 header variants 403; ACAO is
hardcoded to `https://mikonime.stream`. Follow-up approved by the human
partner: test a 5th variant `origin-ip` — direct-to-origin request to
`195.88.211.20` with SNI/Host `api.mikonime.stream` and TLS verification
disabled (origin serves a Cloudflare Origin CA cert, untrusted by design).
Locally verified working via
`curl -sk --resolve api.mikonime.stream:443:195.88.211.20` → 200 JSON.
If it passes from Vercel egress, apply origin-first routing (with fallback)
to `request()` in `src/services/anime/mikonime.ts` — that is a separate
change, not part of this probe update.
