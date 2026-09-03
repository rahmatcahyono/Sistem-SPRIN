import { cn } from '@/lib/utils';
import { HTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2',
        'text-sm placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        'transition-colors duration-150',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
        'text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-150',
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' }) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    outline: 'bg-transparent text-foreground border-border',
  };
  return (
    <span
      className={cn(
        'status-badge',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('border-border', className)} {...props} />;
}
