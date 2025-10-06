import { Search } from 'lucide-react';

import { cn } from '~/lib/utils';

import { Input, type InputProps } from './input';

export interface SearchInputProps extends InputProps {
  wrapperClassName?: string;
}

export function SearchInput({
  className,
  wrapperClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Input {...props} className={cn('ps-8 w-full', className)} />

      <div className="h-full absolute aspect-square left-0 top-0 flex items-center justify-center">
        <Search className="size-4 text-default-foreground" />
      </div>
    </div>
  );
}
