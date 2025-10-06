'use client';

import { SelectValue } from 'react-aria-components';

import { Select } from '~/components/ui/select';

export function ExploreSelect() {
  return (
    <Select aria-label="Select Type" defaultValue="">
      <Select.Trigger className="min-w-32">
        <SelectValue />
      </Select.Trigger>
      <Select.Content placement="bottom right">
        <Select.List>
          <Select.Item id="" size="sm">
            Semua Tipe
          </Select.Item>
          <Select.Item id="manhwa" size="sm">
            Manhwa
          </Select.Item>
          <Select.Item id="manga" size="sm">
            Manga
          </Select.Item>
          <Select.Item id="manhua" size="sm">
            Manhua
          </Select.Item>
        </Select.List>
      </Select.Content>
    </Select>
  );
}
