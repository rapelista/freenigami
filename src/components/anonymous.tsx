'use client';

import { useEffect } from 'react';

import { authClient } from '~/lib/auth/client';

export function Anonymous() {
  const { data: session, isPending } = authClient.useSession();

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
