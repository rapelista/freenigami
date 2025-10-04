import { Search } from 'lucide-react';

import { cn } from '~/lib/utils';

import { Input, type InputProps } from './input';

interface SearchInputProps extends InputProps {}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Input {...props} className={cn('ps-8 w-full', className)} />

      <div className="h-full absolute aspect-square left-0 top-0 flex items-center justify-center">
        <Search className="size-4 text-default-foreground" />
      </div>
    </div>
  );
}
