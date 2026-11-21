import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Absolute base for og:image and friends. Without it Next.js falls back
  // to the project's Vercel production domain, which currently points at a
  // custom domain with no DNS, so link previews (WhatsApp) get no image.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://freenigami.vercel.app',
  ),
  title: 'Freenigami',
  description: 'monggo',
};
