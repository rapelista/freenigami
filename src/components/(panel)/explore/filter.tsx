'use client';

import { Button, Modal } from '@heroui/react';
import { Filter, Rocket } from 'lucide-react';

export function ExploreFilter() {
  return (
    <Modal>
      <Button isIconOnly aria-label="Filter options" variant="secondary">
        <Filter />
      </Button>

      <Modal.Container placement="bottom">
        <Modal.Dialog>
          {({ close }) => (
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <Rocket />
                </Modal.Icon>
                <Modal.Heading>Placement: Bottom</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>
                  This modal uses the <code>bottom</code> placement option. Try
                  different placements to see how the modal positions itself on
                  the screen.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="tertiary" onPress={close}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
