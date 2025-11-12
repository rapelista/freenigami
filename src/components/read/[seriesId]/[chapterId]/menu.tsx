import { Button, Popover } from '@heroui/react';
import { ChevronLeft, EllipsisVertical } from 'lucide-react';
import Link from 'next/link';

import { ChapterBookmark } from './bookmark';

interface ChapterMenuProps {
  chapterId: string;
  seriesId: string;
}

export function ChapterMenu({ chapterId, seriesId }: ChapterMenuProps) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="tertiary">
          <EllipsisVertical />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Arrow />
        <Popover.Dialog className="space-y-2 w-48">
          <Popover.Heading className="pointer-events-none">
            Menu
          </Popover.Heading>

          <hr />

          <div className="grid gap-2">
            <Button
              asChild
              className="w-full justify-start"
              size="sm"
              variant="tertiary"
            >
              <Link href={`/series/${seriesId}`}>
                <ChevronLeft /> Semua Chapter
              </Link>
            </Button>

            <ChapterBookmark chapterId={chapterId} seriesId={seriesId} />
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover.Root>
  );
}
