import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Clock3, ListTodo, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useWorkbook } from '../../hooks/useWorkbook';
import { getTaskAnalytics } from '../../services/analytics/taskAnalytics';
import type { Task } from '../../types';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';

const priorityWeight: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2
};

const normalizeKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '_');

const getDueDateSortValue = (task: Task): number => {
  if (!task.dueDate) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = parseISO(task.dueDate);
  return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
};

export default function TasksPage() {
  const { workbookData, addRecord } = useWorkbook();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const analytics = useMemo(() => getTaskAnalytics(workbookData?.tasks ?? []), [workbookData?.tasks]);

  const sortedTasks = useMemo(() => {
    const tasks = workbookData?.tasks ?? [];
    return [...tasks].sort((left, right) => {
      const leftStatus = normalizeKey(left.status || 'Not Started');
      const rightStatus = normalizeKey(right.status || 'Not Started');
      const leftCompleted = leftStatus === 'completed';
      const rightCompleted = rightStatus === 'completed';

      if (leftCompleted !== rightCompleted) {
        return leftCompleted ? 1 : -1;
      }

      const leftDue = getDueDateSortValue(left);
      const rightDue = getDueDateSortValue(right);

      if (leftDue !== rightDue) {
        return leftDue - rightDue;
      }

      const leftPriority = priorityWeight[normalizeKey(left.priority || 'Medium')] ?? 1;
      const rightPriority = priorityWeight[normalizeKey(right.priority || 'Medium')] ?? 1;
      return leftPriority - rightPriority;
    });
  }, [workbookData?.tasks]);

  const overdueTaskIds = useMemo(() => new Set(analytics.overdueTasks.map((task) => task.id)), [analytics.overdueTasks]);

  if (!workbookData) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-8 shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
          <ListTodo className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-brand-text">No workbook loaded</h1>
        <p className="mt-3 text-base leading-relaxed text-brand-text-muted">
          Padhivu tasks live inside your local Excel workbook. Import a workbook from the landing page to view and add tasks.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to import page
          </Link>
        </div>
      </div>
    );
  }

  const taskTotal = workbookData.tasks.length;
  const openTaskCount = analytics.totalCount - analytics.completedCount;
  const currentDateLabel = format(new Date(), 'EEEE, MMMM d, yyyy');
  const hasTasks = sortedTasks.length > 0;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-brand-border bg-brand-bg-card p-6 shadow-subtle">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/10 bg-brand-emerald/10 px-3 py-1 text-xs font-semibold text-brand-emerald">
              <Clock3 className="h-3.5 w-3.5" />
              {currentDateLabel}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-text">Tasks</h1>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-brand-text-muted">
                Keep track of daily work, personal follow-ups, and open items stored in your workbook.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-text-muted">
              <span className="block text-xs uppercase tracking-[0.16em] text-brand-text-muted">Task total</span>
              <span className="mt-1 block text-lg font-semibold text-brand-text">{taskTotal}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
            >
              <Plus className="h-4 w-4" />
              Add task
            </button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CompactStat title="Total tasks" value={analytics.totalCount} />
        <CompactStat title="Completed" value={analytics.completedCount} />
        <CompactStat title="Open" value={openTaskCount} />
        <CompactStat title="Overdue" value={analytics.overdueTasks.length} emphasis={analytics.overdueTasks.length > 0} />
      </section>

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
        <h2 className="text-lg font-semibold text-brand-text">Task summary</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryPill label="Completed" value={analytics.completedCount} tone="bg-emerald-50 text-emerald-700" />
          <SummaryPill label="Open" value={openTaskCount} tone="bg-blue-50 text-blue-700" />
          <SummaryPill label="Overdue" value={analytics.overdueTasks.length} tone="bg-amber-50 text-amber-700" />
        </div>
        <p className="mt-4 text-sm text-brand-text-muted">
          {analytics.totalCount === 0
            ? 'No tasks have been added yet.'
            : `${analytics.completionRate}% complete with ${analytics.highPriorityOpenTasks.length} high-priority open task${analytics.highPriorityOpenTasks.length === 1 ? '' : 's'}.`}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Tasks</h2>
            <p className="mt-1 text-sm text-brand-text-muted">
              Open tasks are shown first, followed by tasks with due dates. Tasks without a due date are listed last.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-xs text-brand-text-muted sm:inline-flex">
            <CheckSquare className="h-3.5 w-3.5 text-brand-emerald" />
            Workbook-backed list
          </div>
        </div>

        {hasTasks ? (
          <TaskList tasks={sortedTasks} overdueTaskIds={overdueTaskIds} />
        ) : (
          <div className="rounded-3xl border border-dashed border-brand-border bg-brand-bg-card p-8 text-center shadow-subtle">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
              <ListTodo className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-text">No tasks yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
              Add your first task to start building the list stored in your workbook.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
              >
                <Plus className="h-4 w-4" />
                Add your first task
              </button>
            </div>
          </div>
        )}
      </section>

      <AddTaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmitTask={(task) => {
          addRecord('tasks', task);
        }}
      />
    </div>
  );
}

function CompactStat({ title, value, emphasis = false }: { title: string; value: number; emphasis?: boolean }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-bg-card p-4 shadow-subtle">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">{title}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${emphasis ? 'text-rose-700' : 'text-brand-text'}`}>
        {value}
      </p>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl border border-brand-border px-4 py-3 ${tone}`}>
      <p className="text-xs font-medium uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
