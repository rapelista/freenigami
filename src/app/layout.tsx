import { Library } from 'lucide-react';
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
            <div className="container mx-auto p-4 md:p-6 grid grid-cols-2 md:grid-cols-3">
              <Link
                className="capitalize font-medium md:text-xl md:col-start-2 place-self-start md:place-self-center"
                href="/"
              >
                FREENIGAMI
              </Link>

              <ul className="place-self-end">
                <li>
                  <Link
                    className="group flex items-center gap-1"
                    href="/explore"
                  >
                    <Library />
                    <span className="group-hover:underline underline-offset-4 max-md:hidden">
                      Explore
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </header>

          {children}
        </Providers>
      </body>
    </html>
  );
}
