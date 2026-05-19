import { cn } from '@/lib/cn'

const variants = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-900/20',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
  ghost: 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
  danger: 'bg-red-600/90 text-white hover:bg-red-500',
  outline: 'border border-slate-700 text-slate-200 hover:bg-slate-800/60',
} as const

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
} as const

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
