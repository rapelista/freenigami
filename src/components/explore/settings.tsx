'use client';

import { Button, Disclosure } from '@heroui/react';
import { Filter } from 'lucide-react';

import { useExploreStore } from '~/stores/explore';

export function ExploreSettings() {
  const { isSettingsExpanded } = useExploreStore();

  return (
    <Disclosure isExpanded={isSettingsExpanded}>
      <Disclosure.Content>
        <Disclosure.Body className="bg-surface shadow-surface rounded-2xl p-2">
          <p className="text-sm text-center">Sedang dalam pengembangan...</p>
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}

export function ExploreSettingsButton() {
  const { toggleSettings } = useExploreStore();

  return (
    <Button isIconOnly variant="tertiary" onClick={toggleSettings}>
      <Filter />
    </Button>
  );
}
