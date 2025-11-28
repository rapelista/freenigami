import { Inter } from 'next/font/google';

import { Anonymous } from '~/components/anonymous';
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
      <body className="bg-background">
        <Providers>{children}</Providers>

        <Anonymous />
      </body>
    </html>
  );
}
