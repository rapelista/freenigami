import "~/styles/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ModeToggle } from "~/components/mode-toggle";
import { Providers } from "~/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export { metadata } from "~/configs/site";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="w-screen border-b">
            <div className="container mx-auto px-4 md:px-0 h-16 flex items-center md:justify-between">
              <div className="hidden md:block w-9 h-9" />

              <Link
                href="/"
                className="flex-1  md:flex-none text-3xl font-semibold"
              >
                Freenigami
              </Link>

              <ModeToggle />
            </div>
          </div>
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
