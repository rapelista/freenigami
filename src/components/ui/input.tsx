import { cn } from '~/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {}

export function Input({ className, ...props }: InputProps) {
  return <input {...props} className={cn('input', className)} />;
}
