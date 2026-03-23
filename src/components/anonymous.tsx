'use client';

import { useEffect } from 'react';

import { authClient } from '~/lib/auth/client';
import { useBookmarkSync } from '~/hooks/use-bookmark-sync';

export function Anonymous() {
  const { data: session, isPending } = authClient.useSession();

  useBookmarkSync();

  useEffect(() => {
    const anonymousSignIn = async () => {
      await authClient.signIn.anonymous();
    };

    if (isPending === false && session === null) {
      anonymousSignIn();
    }
  }, [session, isPending]);

  return null;
}
