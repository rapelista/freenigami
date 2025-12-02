'use client';

import { Button, Dropdown, Header, Label, Separator } from '@heroui/react';
import { ArrowDownWideNarrow } from 'lucide-react';
import { parseAsString, useQueryStates } from 'nuqs';

import { sortOptionLabelMap } from '~/configs/misc';
import { SortOption, SortOrder } from '~/lib/enum';
import { cn } from '~/lib/utils';

export function ExploreSort() {
  const [{ sort, sort_order }, setParams] = useQueryStates({
    sort: parseAsString.withDefault('latest'),
    sort_order: parseAsString.withDefault('desc'),
  });

  const selected = new Set([sort, sort_order]);

  return (
    <Dropdown>
      <Button isIconOnly aria-label="Sort options" variant="secondary">
        <ArrowDownWideNarrow
          className={cn(
            'transition-transform duration-500 ease-in-out',
            sort_order === 'asc' ? 'rotate-180' : '',
          )}
        />
      </Button>

      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          selectedKeys={selected}
          selectionMode="multiple"
          onAction={(key) => {
            if (
              Array.from(Object.values(SortOption)).includes(key as SortOption)
            ) {
              if (sort === key) return;

              setParams({
                sort: key.toString(),
              });
            }

            if (
              Array.from(Object.values(SortOrder)).includes(key as SortOrder)
            ) {
              if (sort_order === key) return;

              setParams({
                sort_order: key.toString(),
              });
            }
          }}
        >
          <Dropdown.Section>
            <Header>Urut Berdasarkan</Header>

            {Array.from(sortOptionLabelMap).map(([value, label]) => (
              <Dropdown.Item key={value} id={value} textValue={label}>
                <Label>{label}</Label>
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))}
          </Dropdown.Section>

          <Separator />

          <Dropdown.Section>
            <Header>Urutkan A-Z / Z-A</Header>

            <Dropdown.Item key="asc" id="asc">
              <Label>ASC</Label>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
            <Dropdown.Item key="desc" id="desc">
              <Label>DESC</Label>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
