import { cn } from '@/lib/cn'

export function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}
