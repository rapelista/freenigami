import { initTRPC, TRPCError } from '@trpc/server';
import { getStatusCodeFromKey } from '@trpc/server/unstable-core-do-not-import';
import { headers } from 'next/headers';
import * as z from 'zod';

import { auth } from '~/lib/auth/server';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create({
  errorFormatter: ({ shape, error }) => {
    const { data, message } = shape;

    if (error.cause instanceof z.ZodError) {
      const code = 'UNPROCESSABLE_CONTENT';
      const zodError = error.cause;

      return {
        message: 'Failed to validate data',
        code,
        data: {
          httpStatus: getStatusCodeFromKey(code),
          issues: zodError.issues.map((issue) => ({
            ...issue,
            path: issue.path.join('.'),
          })),
        },
      };
    }

    return {
      message,
      code: data.code,
      data: {
        httpStatus: data.httpStatus,
      },
    };
  },
});

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

export const authedNonAnonymousProcedure = t.procedure.use(async (opts) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.isAnonymous) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      ...session,
    },
  });
});
