import "~/styles/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
          <div className="text-center w-screen h-16 flex items-center justify-center border-b">
            <Link href={"/"} className="text-3xl font-semibold">
              Freenigami
            </Link>
          </div>
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
