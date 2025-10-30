'use client';

import { Button, Disclosure } from '@heroui/react';
import { Filter } from 'lucide-react';

import { useExploreStore } from '~/stores/explore';

export function ExploreSettings() {
  const { isSettingsExpanded } = useExploreStore();

  return (
    <Disclosure.Root isExpanded={isSettingsExpanded}>
      <Disclosure.Content>
        <Disclosure.Body className="bg-panel shadow-panel rounded-panel p-2">
          <p className="text-sm text-center">Sedang dalam pengembangan...</p>
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure.Root>
  );
}

export function ExploreSettingsButton() {
  const { toggleSettings } = useExploreStore();

  return (
    <Button isIconOnly variant="secondary" onClick={toggleSettings}>
      <Filter />
    </Button>
  );
}
