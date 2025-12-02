import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';

import { auth } from '~/lib/auth/server';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;

export const appProcedure = t.procedure;

export const authedProcudure = t.procedure.use(async (opts) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      ...session,
    },
  });
});
