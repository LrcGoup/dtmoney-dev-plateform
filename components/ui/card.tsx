import { cn } from '@/lib/cn'

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl shadow-black/20', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold text-white', className)}>{children}</h2>
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-slate-400">{children}</p>
}
