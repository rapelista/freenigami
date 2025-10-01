'use client';

import { useQuery } from '@tanstack/react-query';

import { trpc } from '~/trpc/client';

export function Featured() {
  const { data } = useQuery(trpc.series.list.queryOptions());

  return data?.data.map((item) => <div key={item.id}>ID: {item.id}</div>);
}
