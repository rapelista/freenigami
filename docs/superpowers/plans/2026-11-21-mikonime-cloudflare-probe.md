# Mikonime Cloudflare Probe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/beta/anime` + `/api/beta/anime` probe that reports, from Vercel's egress, which header variants pass mikonime's Cloudflare.

**Architecture:** One shared probe function runs 4 header variants sequentially against the upstream API. The route handler and the page both call it `force-dynamic`; the JSON response embeds the deployment commit + region so readings can be tied to a deploy. No existing file changes.

**Tech Stack:** Next.js 16 App Router (RSC + route handler), TypeScript, Tailwind tokens already in `globals.css` (`text-muted`, `bg-surface`, `text-accent`).

**Spec:** `docs/superpowers/specs/2026-11-21-mikonime-cloudflare-probe-design.md`

## Global Constraints

- No modification to `src/services/anime/mikonime.ts` (fix is a follow-up).
- Both new endpoints `force-dynamic` (probe must never be cached).
- Upstream probe URL fixed to `route=anime&is_hero=1&limit=2` (small, cheap, known-good locally).
- Project style: single quotes, semicolons, 2-space indent (prettier), `~/*` import alias.
- Commit style: `feat:`/`fix:`/`chore:` lowercase like existing history.

## Review Focus

- Fetch throws (network/DNS) → recorded as `error` string, `status: null`, not a crash — Task 1.
- Cloudflare HTML interstitial body → captured truncated in `bodyPreview`, `isJson: false` — Task 1.
- Upstream hangs → per-request 8s abort timeout recorded as error — Task 1.
- Stale deploy read as new probe → response carries `VERCEL_GIT_COMMIT_SHA` + `VERCEL_REGION` — Task 2.
- Page render when every variant fails → table still renders (red rows), never throws — Task 3.

---

### Task 1: probe service

**Files:**
- Create: `src/services/anime/mikonime-probe.ts`

**Interfaces:**
- Produces:
  - `export interface ProbeResult { variant: string; headers: Record<string, string>; status: number | null; contentType: string | null; isJson: boolean; ok: boolean; bodyPreview: string | null; error: string | null; ms: number }`
  - `export const PROBE_URL: string`
  - `export function probeMikonime(): Promise<ProbeResult[]>` — one result per variant, in variant order, never throws.

- [ ] **Step 1: Write the one-off verification script**

Create `scripts/probe-once.mjs` that imports nothing from the app (standalone `fetch`), runs the 4 variants against `PROBE_URL`, and prints variant/status/content-type/isJson per line. (No test framework exists in this project; the probe itself is the failing-test apparatus — locally all lines should read `isJson=true`, on Vercel the 403 reproduces.)

- [ ] **Step 2: Run it locally to establish the passing baseline**

Run: `node scripts/probe-once.mjs`
Expected: 4 lines, all `status=200 isJson=true`.

- [ ] **Step 3: Implement `probeMikonime()` in `src/services/anime/mikonime-probe.ts`**

Variants in order: `bare` `{}`, `ua` (Chrome UA only), `site-headers` (`accept: */*`, `origin`, `referer` from `https://mikonime.stream`), `full-browser` (all headers the real frontend sends incl. `sec-ch-ua*`, `sec-fetch-*`, `accept-language`, UA — values from the recorded curl). Each: `cache: 'no-store'`, `AbortSignal.timeout(8000)`, measure `Date.now()` delta, read body as text, `isJson` from content-type header, `ok = status 200 && isJson`, `bodyPreview` = first 120 chars of body when `!isJson`. Loop sequential; wrap each fetch in try/catch into `error`.

- [ ] **Step 4: Verify via a tsx one-liner**

Run: `pnpm tsx -e "import { probeMikonime } from './src/services/anime/mikonime-probe'; console.table(await probeMikonime())"`
Expected: 4 rows, local run all `ok=true`.

- [ ] **Step 5: Commit**

```bash
git add src/services/anime/mikonime-probe.ts scripts/probe-once.mjs
git commit -m "feat: add mikonime cloudflare probe service"
```

### Task 2: API route `/api/beta/anime`

**Files:**
- Create: `src/app/api/beta/anime/route.ts`

**Interfaces:**
- Consumes: `probeMikonime()` from Task 1.
- Produces: `GET /api/beta/anime` → `{ probeUrl: string; commit: string | null; region: string | null; probedAt: string; results: ProbeResult[] }`, HTTP 200 always (probe errors live inside rows).

- [ ] **Step 1: Implement the route handler**

`export const dynamic = 'force-dynamic';` + `GET` returning `NextResponse.json({ probeUrl: PROBE_URL, commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null, region: process.env.VERCEL_REGION ?? null, probedAt: new Date().toISOString(), results: await probeMikonime() })`.

- [ ] **Step 2: Verify against dev server**

Run: `pnpm dev` (background) then `curl -s localhost:3000/api/beta/anime | head -c 400`
Expected: JSON with `commit: null` locally, `results` length 4.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/beta/anime/route.ts
git commit -m "feat: expose mikonime probe at /api/beta/anime"
```

### Task 3: page `/beta/anime`

**Files:**
- Create: `src/app/beta/anime/page.tsx`

**Interfaces:**
- Consumes: `probeMikonime()`, `PROBE_URL` from Task 1.

- [ ] **Step 1: Implement the server component**

`force-dynamic`; `metadata = { title: 'Beta · Anime Probe' }`; call `probeMikonime()` directly (same egress as the route). Render: heading + `PROBE_URL`, then a table — rows per result with variant, status, content-type, `ok` badge (green/red via `text-` tokens), `ms`, and `bodyPreview`/`error` in a `<pre>` under failing rows. Max width wrapper like `(panel)/anime/page.tsx` (`mx-auto w-full max-w-6xl px-4 py-6`).

- [ ] **Step 2: Verify against dev server**

`curl -s localhost:3000/beta/anime | grep -c 'full-browser'`
Expected: ≥ 1 (page rendered with rows; no 500).

- [ ] **Step 3: Commit**

```bash
git add src/app/beta/anime/page.tsx
git commit -m "feat: render mikonime probe results at /beta/anime"
```

### Task 4: ship + measure on Vercel

**Files:** none (operations only)

- [ ] **Step 1: Verify lint + production build**

Run: `pnpm lint && pnpm build`
Expected: both exit 0.

- [ ] **Step 2: Push**

Run: `git push origin main`
Expected: pushed; Vercel starts a deployment.

- [ ] **Step 3: Poll production until the deploy is live**

Loop `curl -s https://freenigami.vercel.app/api/beta/anime` until `commit` equals the pushed HEAD short SHA (max ~7 min).
Expected: eventual match.

- [ ] **Step 4: Record the matrix and decide**

Read `results` from production: any variant `ok=true` → apply that header set to `request()` next; all `ok=false` → block is IP/ASN-based, escalate options to the human partner.

---

### Task 5 (addendum): `origin-ip` probe variant

**Files:**
- Modify: `src/services/anime/mikonime-probe.ts`
- Modify: `docs/superpowers/specs/2026-11-21-mikonime-cloudflare-probe-design.md` (addendum above)

**Interfaces:**
- Consumes: node builtin `node:https` (no new dependency).
- Produces: 5th `ProbeResult` with `variant: 'origin-ip'`; same shape, `headers` shows `{ host: 'api.mikonime.stream' }`.

- [ ] **Step 1: Implement the origin-pinned request helper + variant**

Variant list gains `['origin-ip', { host: 'api.mikonime.stream' }]` routed through `node:https` with `hostname: ORIGIN_IP` (`195.88.211.20`), `servername: 'api.mikonime.stream'`, `rejectUnauthorized: false`, `AbortSignal.timeout(8000)`; plain `fetch` keeps serving the other variants.

- [ ] **Step 2: Verify locally**

Run: `pnpm tsx -e "<async IIFE: probeMikonime() then console.table>"` (see Task 1 ruling for the IIFE form)
Expected: 5 rows; `origin-ip` `ok=true`.

- [ ] **Step 3: Lint + build, commit, push**

Run: `pnpm lint && pnpm build && git commit && git push origin main`

- [ ] **Step 4: Poll production until live, record verdict**

Same loop as Task 4. Expected: `origin-ip` row decides whether direct-to-origin routing goes into `request()` (separate change).
