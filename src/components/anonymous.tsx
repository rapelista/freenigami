'use client';

import { useEffect } from 'react';

import { authClient } from '~/lib/auth/client';

export function Anonymous() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const anonymousSignIn = async () => {
      await authClient.signIn.anonymous();
    };

    if (session === null) {
      anonymousSignIn();
    }
  }, [session]);

  return null;
}
