'use client';

import { Bookmark, LogIn, LogOut, Search } from 'lucide-react';
import Link from 'next/link';

import { authClient } from '~/lib/auth/client';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = authClient.useSession();
  const isNonAnonymous = session?.user && !session.user.isAnonymous;

  const handleSignIn = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.href,
    });
  };

  const handleSignOut = () => {
    authClient.signOut();
  };

  return (
    <>
      <header className="border-b-[0.5px] border-dashed">
        <div className="container mx-auto p-4 md:p-6 grid grid-cols-2 md:grid-cols-3">
          <div className="self-center place-self-start max-md:hidden">
            {isNonAnonymous ? (
              <button
                className="group flex items-center gap-1"
                title={`Sign out (${session.user.name})`}
                onClick={handleSignOut}
              >
                <LogOut className="shrink-0" />
                <span className="group-hover:underline underline-offset-4 max-w-32 truncate">
                  {session.user.name}
                </span>
              </button>
            ) : (
              <button
                className="group flex items-center gap-1"
                onClick={handleSignIn}
              >
                <LogIn />
                <span className="group-hover:underline underline-offset-4">
                  Sign In
                </span>
              </button>
            )}
          </div>

          <Link
            className="capitalize font-medium md:text-xl md:col-start-2 self-center place-self-start md:place-self-center"
            href="/"
          >
            FREENIGAMI
          </Link>

          <ul className="self-center place-self-end flex gap-4">
            <li>
              <Link className="group flex items-center gap-1" href="/bookmarks">
                <Bookmark />
                <span className="group-hover:underline underline-offset-4 max-md:hidden">
                  Bookmark
                </span>
              </Link>
            </li>
            <li>
              <Link className="group flex items-center gap-1" href="/explore">
                <Search />
                <span className="group-hover:underline underline-offset-4 max-md:hidden">
                  Explore
                </span>
              </Link>
            </li>
            <li className="md:hidden">
              {isNonAnonymous ? (
                <button
                  className="group flex items-center gap-1"
                  title={`Sign out (${session.user.name})`}
                  onClick={handleSignOut}
                >
                  <LogOut className="shrink-0" />
                </button>
              ) : (
                <button
                  className="group flex items-center gap-1"
                  onClick={handleSignIn}
                >
                  <LogIn />
                </button>
              )}
            </li>
          </ul>
        </div>
      </header>
      {children}
    </>
  );
}
