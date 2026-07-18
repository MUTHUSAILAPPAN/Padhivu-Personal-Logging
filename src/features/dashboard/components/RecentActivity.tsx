import { Clock3, CornerDownRight } from 'lucide-react';
import type { ActivityItem } from '../../../services/analytics/dashboardAnalytics';

interface RecentActivityProps {
  items: ActivityItem[];
}

const typeLabel: Record<ActivityItem['type'], string> = {
  Expense: 'Expense',
  Task: 'Task',
  Memory: 'Memory',
  ModuleEntry: 'Module entry'
};

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text">Recent activity</h2>
          <p className="mt-1 text-sm text-brand-text-muted">The latest workbook items in reverse chronological order.</p>
        </div>
        <Clock3 className="h-5 w-5 text-brand-emerald" />
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-brand-border bg-brand-bg px-4 py-6 text-sm text-brand-text-muted">
          Nothing yet. Add expenses, tasks, memories, or module entries to populate this feed.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald">
                  <CornerDownRight className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-brand-text">{item.title}</span>
                    <span className="rounded-full border border-brand-border bg-brand-bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-text-muted">
                      {typeLabel[item.type]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-brand-text-muted">{item.subtitle}</p>
                  <p className="mt-2 text-xs text-brand-text-muted">
                    {item.date}
                    {item.time ? ` · ${item.time}` : ''}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}