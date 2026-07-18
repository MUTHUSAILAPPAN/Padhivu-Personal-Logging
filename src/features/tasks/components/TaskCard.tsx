import { AlertTriangle, CalendarDays, Circle, Flag, Tags, CheckCircle2 } from 'lucide-react';
import type { Task } from '../../../types';

interface TaskCardProps {
  task: Task;
  overdue?: boolean;
}

const statusTone: Record<string, string> = {
  not_started: 'border-slate-200 bg-slate-50 text-slate-700',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blocked: 'border-amber-200 bg-amber-50 text-amber-700'
};

const priorityTone: Record<string, string> = {
  low: 'border-slate-200 bg-slate-50 text-slate-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-rose-200 bg-rose-50 text-rose-700'
};

const normalizeKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '_');

export default function TaskCard({ task, overdue = false }: TaskCardProps) {
  const statusKey = normalizeKey(task.status || 'Not Started');
  const priorityKey = normalizeKey(task.priority || 'Medium');

  return (
    <article className="rounded-2xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-brand-text">{task.title}</h3>
            {overdue && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>
          {task.description && <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">{task.description}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald">
          {statusKey === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${statusTone[statusKey] || statusTone.not_started}`}>
          <Circle className="h-3 w-3" />
          {task.status || 'Not Started'}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${priorityTone[priorityKey] || priorityTone.medium}`}>
          <Flag className="h-3 w-3" />
          {task.priority || 'Medium'}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-brand-text-muted">
          <Tags className="h-3 w-3" />
          {task.tags ? task.tags : 'No tags'}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-brand-text-muted">
          <CalendarDays className="h-3 w-3" />
          {task.dueDate || 'No due date'}
        </span>
      </div>
    </article>
  );
}