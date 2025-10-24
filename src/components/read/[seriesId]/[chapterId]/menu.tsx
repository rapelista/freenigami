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
          <Popover.Heading>Menu</Popover.Heading>
          <hr />
          <div className="grid gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={`/series/${seriesId}`}>
                <ChevronLeft /> All Chapters
              </Link>
            </Button>
            <ChapterBookmark chapterId={chapterId} />
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover.Root>
  );
}
