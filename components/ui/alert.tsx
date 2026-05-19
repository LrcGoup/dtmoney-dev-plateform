import { cn } from '@/lib/cn'

export function Alert({
  children,
  variant = 'info',
  className,
}: {
  children: React.ReactNode
  variant?: 'info' | 'error' | 'success'
  className?: string
}) {
  const styles = {
    info: 'border-slate-700 bg-slate-800/50 text-slate-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  }
  return (
    <div className={cn('rounded-lg border px-4 py-3 text-sm', styles[variant], className)}>{children}</div>
  )
}
