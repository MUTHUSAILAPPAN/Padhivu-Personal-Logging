import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
      <div>
        <h2 className="text-lg font-semibold text-brand-text">Quick actions</h2>
        <p className="mt-1 text-sm text-brand-text-muted">Jump to the workbook areas you use most.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className="group rounded-2xl border border-brand-border bg-brand-bg p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-emerald/30 hover:shadow-soft"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald transition-transform group-hover:scale-105">
                <action.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-brand-text">{action.title}</h3>
                <p className="mt-1 text-sm text-brand-text-muted">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}