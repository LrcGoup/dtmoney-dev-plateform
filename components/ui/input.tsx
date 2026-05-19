import { cn } from '@/lib/cn'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-sm font-medium text-slate-300', className)} {...props} />
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20',
        className,
      )}
      {...props}
    />
  )
}
