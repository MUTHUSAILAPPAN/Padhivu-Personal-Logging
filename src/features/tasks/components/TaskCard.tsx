import { AlertTriangle, CalendarDays, Circle, Flag, Tags, CheckCircle2 } from 'lucide-react';
import type { Task } from '../../../types';

interface TaskCardProps {
  task: Task;
  overdue?: boolean;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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
const openStatusValue = 'Not Started';

export default function TaskCard({ task, overdue = false, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const statusKey = normalizeKey(task.status || 'Not Started');
  const priorityKey = normalizeKey(task.priority || 'Medium');
  const isCompleted = statusKey === 'completed';
  const isOverdue = overdue && !isCompleted;

  const handleToggle = () => {
    onToggleComplete(task);
  };

  return (
    <article
      className={`rounded-2xl border p-5 shadow-subtle transition-colors ${
        isCompleted
          ? 'border-brand-border bg-brand-bg-card/80 opacity-85'
          : 'border-brand-border bg-brand-bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-base font-semibold text-brand-text ${isCompleted ? 'line-through decoration-2 decoration-brand-text-muted/50' : ''}`}>
              {task.title}
            </h3>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </span>
            )}
            {isCompleted && task.completedDate && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Completed {task.completedDate}
              </span>
            )}
          </div>
          {task.description && (
            <p className={`mt-2 text-sm leading-relaxed ${isCompleted ? 'text-brand-text-muted/80 line-through decoration-brand-text-muted/40' : 'text-brand-text-muted'}`}>
              {task.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 ${
            isCompleted
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-brand-border bg-brand-bg text-brand-text-muted hover:bg-brand-border/60'
          }`}
          aria-label={isCompleted ? `Mark ${task.title} as open` : `Mark ${task.title} as complete`}
          title={isCompleted ? `Mark ${task.title} as open` : `Mark ${task.title} as complete`}
        >
          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${statusTone[statusKey] || statusTone.not_started}`}>
          <Circle className="h-3 w-3" />
          {task.status || openStatusValue}
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

      {isCompleted && task.completedDate && (
        <p className="mt-3 text-xs text-brand-text-muted">Completed on {task.completedDate}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="inline-flex items-center justify-center rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-medium text-brand-text transition-colors hover:bg-brand-border/60"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}