import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

type Action = {
  label: string;
  to: string;
  icon?: LucideIcon;
};

type PageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
  badge?: ReactNode;
  actions?: ReactNode;
};

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: Action;
};

export function PageHeader({ title, description, eyebrow, badge, actions }: PageHeaderProps) {
  return (
    <header className="rounded-3xl border border-brand-border bg-brand-bg-card p-6 shadow-subtle">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/10 bg-brand-emerald/10 px-3 py-1 text-xs font-semibold text-brand-emerald">
              {eyebrow}
            </div>
          ) : null}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-text">{title}</h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-brand-text-muted">{description}</p>
          </div>
        </div>

        {(badge || actions) && (
          <div className="flex flex-wrap items-center gap-3">
            {badge}
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export function WorkbookEmptyState({ icon: Icon, title, description, primaryAction }: EmptyStateProps) {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-8 shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
        <Icon className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-brand-text">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-brand-text-muted">{description}</p>
      {primaryAction ? (
        <div className="mt-6">
          <Link
            to={primaryAction.to}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            {primaryAction.icon ? <primaryAction.icon className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {primaryAction.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function ComingSoonState({ icon: Icon, title, description, primaryAction }: EmptyStateProps) {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-brand-border bg-brand-bg-card p-8 shadow-subtle sm:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-brand-emerald/10 bg-brand-emerald/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-emerald">
              Coming soon
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-text">{title}</h1>
            <p className="text-base leading-relaxed text-brand-text-muted">{description}</p>
          </div>

          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-text-muted">
            This area is reserved for workbook-backed tools and will stay local-first when it ships.
          </div>

          {primaryAction ? (
            <Link
              to={primaryAction.to}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
            >
              {primaryAction.icon ? <primaryAction.icon className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {primaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}