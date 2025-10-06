'use client';

import { ChevronDown } from 'lucide-react';
import { SelectValue } from 'react-aria-components';

import { Select } from '~/components/ui/select';

export default function Page() {
  return (
    <div>
      <Select aria-label="Select" defaultValue="10">
        <Select.Trigger className="min-w-20" variant="secondary">
          <SelectValue />
          <ChevronDown />
        </Select.Trigger>
        <Select.Content className="p-1 min-w-20">
          <Select.List>
            <Select.Item id="10" size="sm" variant="ghost">
              10
            </Select.Item>
            <Select.Item id="20" size="sm" variant="ghost">
              20
            </Select.Item>
          </Select.List>
        </Select.Content>
      </Select>
    </div>
  );
}
