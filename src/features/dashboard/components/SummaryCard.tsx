import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  toneClassName: string;
  hint?: string;
}

export default function SummaryCard({ title, value, icon: Icon, toneClassName, hint }: SummaryCardProps) {
  return (
    <section className="rounded-2xl border border-brand-border bg-brand-bg-card p-4 shadow-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-text">{value}</p>
          {hint && <p className="mt-1 text-xs text-brand-text-muted">{hint}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}