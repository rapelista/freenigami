'use client';

import { useQuery } from '@tanstack/react-query';

import { trpc } from '~/trpc/client';

export function Explore() {
  useQuery(trpc.series.list.queryOptions());

  return null;
}
