'use client';

import { Infinity as InfinityIcon } from 'lucide-react';

import { BottomSheet } from '~/components/ui/bottom-sheet';
import { cn } from '~/lib/utils';
import {
  AUTO_SCROLL_SPEED_LABEL,
  AutoScrollSpeed,
  NEXT_CHAPTER_DELAYS,
  useReaderSettings,
} from '~/stores/reader';

interface SettingsSheetProps {
  chapterNumber?: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SettingsSheet({
  chapterNumber,
  isOpen,
  onOpenChange,
}: SettingsSheetProps) {
  const speed = useReaderSettings((state) => state.speed);
  const setSpeed = useReaderSettings((state) => state.setSpeed);
  const infinityChapter = useReaderSettings((state) => state.infinityChapter);
  const setInfinityChapter = useReaderSettings(
    (state) => state.setInfinityChapter,
  );
  const delay = useReaderSettings((state) => state.nextChapterDelay);
  const setDelay = useReaderSettings((state) => state.setNextChapterDelay);

  return (
    <BottomSheet
      isOpen={isOpen}
      subtitle={chapterNumber !== undefined && `Chapter ${chapterNumber}`}
      title="Pengaturan baca"
      onOpenChange={onOpenChange}
    >
      <div className="space-y-6 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),20px)]">
        <Section title="Kecepatan Autoscroll">
          <Options
            label="Kecepatan Autoscroll"
            options={Object.values(AutoScrollSpeed).map((value) => ({
              value,
              label: AUTO_SCROLL_SPEED_LABEL[value],
            }))}
            value={speed}
            onChange={setSpeed}
          />
        </Section>

        <Section title="Lanjut otomatis">
          <div className="flex items-center gap-3 py-1">
            <InfinityIcon className="size-5 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" id="infinity-chapter-label">
                Infinity Chapter
              </p>
              <p className="text-xs text-muted">
                Abis chapter ini, lanjut sendiri ke chapter berikutnya
              </p>
            </div>
            <button
              aria-checked={infinityChapter}
              aria-labelledby="infinity-chapter-label"
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                infinityChapter ? 'bg-accent' : 'bg-surface-tertiary',
              )}
              role="switch"
              type="button"
              onClick={() => setInfinityChapter(!infinityChapter)}
            >
              <span
                className={cn(
                  'absolute top-1 size-4 rounded-full transition-all',
                  infinityChapter
                    ? 'left-6 bg-accent-foreground'
                    : 'left-1 bg-foreground',
                )}
              />
            </button>
          </div>

          <div
            className={cn(
              'space-y-2 pt-2 transition-opacity',
              !infinityChapter && 'pointer-events-none opacity-40',
            )}
          >
            <p className="text-xs text-muted">Jeda sebelum lanjut</p>
            <Options
              disabled={!infinityChapter}
              label="Jeda sebelum lanjut"
              options={NEXT_CHAPTER_DELAYS.map((value) => ({
                value,
                label: value === 0 ? 'Instan' : `${value} dtk`,
              }))}
              value={delay}
              onChange={setDelay}
            />
          </div>
        </Section>
      </div>
    </BottomSheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-widest text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Options<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div aria-label={label} className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((option) => {
        const checked = option.value === value;

        return (
          <button
            key={option.value}
            aria-checked={checked}
            className={cn(
              'h-9 rounded-lg px-3.5 text-sm font-medium transition-colors',
              checked
                ? 'accent-gradient font-semibold'
                : 'bg-amber-soft/70 hover:bg-amber-soft',
            )}
            disabled={disabled}
            role="radio"
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
