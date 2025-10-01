import { Inter } from 'next/font/google';
import Link from 'next/link';

import { Providers } from '~/components/providers';
import { cn } from '~/lib/utils';

import '~/styles/globals.css';

export { metadata } from '~/configs/site';

const inter = Inter({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn('dark', inter.className)} lang="en">
      <body>
        <Providers>
          <header className="border-b-[0.5px] border-dashed">
            <div className="container mx-auto p-4 md:p-6 grid md:grid-cols-3">
              <Link
                className="capitalize font-medium md:text-xl md:col-start-2 md:place-self-center"
                href="/"
              >
                FREENIGAMI
              </Link>
            </div>
          </header>

          {children}
        </Providers>
      </body>
    </html>
  );
}
