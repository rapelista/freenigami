import { LoaderCircle } from 'lucide-react';

interface LoadMoreProps {
  isLoading: boolean;
  onPress: () => void;
  label?: string;
}

/** "Muat lainnya" button shown under an infinite list. */
export function LoadMore({
  isLoading,
  onPress,
  label = 'Muat lainnya',
}: LoadMoreProps) {
  return (
    <div className="flex justify-center pt-2">
      <button
        className="flex h-10 items-center gap-2 rounded-xl bg-amber-soft px-5 text-sm font-semibold transition-colors hover:bg-amber-soft/70 disabled:opacity-60"
        disabled={isLoading}
        type="button"
        onClick={onPress}
      >
        {isLoading && (
          <LoaderCircle className="size-4 animate-spin text-accent" />
        )}
        {label}
      </button>
    </div>
  );
}
