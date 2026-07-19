import { useMemo, useState } from 'react';
import { ArrowLeft, CheckSquare, ListTodo, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useWorkbook } from '../../hooks/useWorkbook';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { getTaskAnalytics } from '../../services/analytics/taskAnalytics';
import type { Task } from '../../types';
import { getLocalDateString } from '../../utils';
import AddTaskForm from './components/AddTaskForm';
import EditTaskForm from './components/EditTaskForm';
import DeleteTaskDialog from './components/DeleteTaskDialog';
import TaskList from './components/TaskList';

const priorityWeight: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2
};

const normalizeKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '_');
const completedStatusValue = 'Completed';
const openStatusValue = 'Not Started';
type TaskFilter = 'all' | 'open' | 'completed';

const getDueDateSortValue = (task: Task): number => {
  if (!task.dueDate) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = parseISO(task.dueDate);
  return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
};

export default function TasksPage() {
  const { workbookData, addRecord, updateRecord, deleteRecord } = useWorkbook();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');

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

  const filteredTasks = useMemo(() => {
    if (filter === 'all') {
      return sortedTasks;
    }

    if (filter === 'completed') {
      return sortedTasks.filter((task) => normalizeKey(task.status || openStatusValue) === 'completed');
    }

    return sortedTasks.filter((task) => normalizeKey(task.status || openStatusValue) !== 'completed');
  }, [filter, sortedTasks]);

  const toggleTaskCompletion = (task: Task) => {
    const isCompleted = normalizeKey(task.status || openStatusValue) === 'completed';
    updateRecord('tasks', task.id, {
      status: isCompleted ? openStatusValue : completedStatusValue,
      completedDate: isCompleted ? '' : getLocalDateString()
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteTarget(task);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteRecord('tasks', deleteTarget.id);
    setDeleteTarget(null);
  };

  const filterCounts = {
    all: sortedTasks.length,
    completed: sortedTasks.filter((task) => normalizeKey(task.status || openStatusValue) === 'completed').length,
    open: sortedTasks.filter((task) => normalizeKey(task.status || openStatusValue) !== 'completed').length
  };

  if (!workbookData) {
    return (
      <WorkbookEmptyState
        icon={ListTodo}
        title="No workbook loaded"
        description="Padhivu tasks live inside your local Excel workbook. Import a workbook from the landing page to view and add tasks."
        primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
      />
    );
  }

  const taskTotal = workbookData.tasks.length;
  const openTaskCount = analytics.totalCount - analytics.completedCount;
  const currentDateLabel = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={currentDateLabel}
        title="Tasks"
        description="Keep track of daily work, personal follow-ups, and open items stored in your workbook."
        badge={<span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-sm text-brand-text-muted">Task total <span className="font-semibold text-brand-text">{taskTotal}</span></span>}
        actions={
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CompactStat title="Total tasks" value={analytics.totalCount} />
        <CompactStat title="Completed" value={analytics.completedCount} />
        <CompactStat title="Open" value={openTaskCount} />
        <CompactStat title="Overdue" value={analytics.overdueTasks.length} emphasis={analytics.overdueTasks.length > 0} />
      </section>

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-4 shadow-subtle">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-text-muted">Filters</h2>
            <p className="mt-1 text-sm text-brand-text-muted">
              Showing {filterCounts[filter]} {filter === 'all' ? 'tasks' : filter === 'open' ? 'open tasks' : 'completed tasks'}
            </p>
          </div>
          <div role="tablist" aria-label="Task filters" className="inline-flex flex-wrap gap-2 rounded-2xl bg-brand-bg p-1">
            {(['all', 'open', 'completed'] as const).map((option) => {
              const isActive = filter === option;
              const label = option === 'all' ? 'All' : option === 'open' ? 'Open' : 'Completed';
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(option)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 ${
                    isActive
                      ? 'bg-brand-emerald text-white shadow-sm'
                      : 'text-brand-text-muted hover:bg-brand-border/60'
                  }`}
                >
                  {label} <span className="ml-1 text-xs opacity-80">({filterCounts[option]})</span>
                </button>
              );
            })}
          </div>
        </div>
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

        {filteredTasks.length > 0 ? (
          <TaskList
            tasks={filteredTasks}
            overdueTaskIds={overdueTaskIds}
            onToggleComplete={toggleTaskCompletion}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-brand-border bg-brand-bg-card p-8 text-center shadow-subtle">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
              <ListTodo className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-text">{filter === 'all' ? 'No tasks yet' : 'No matching tasks'}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
              {filter === 'all'
                ? 'Add your first task to start building the list stored in your workbook.'
                : 'Try a different filter or add a new task to see it here.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
              >
                <Plus className="h-4 w-4" />
                Add task
              </button>
              {filter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-border/60"
                >
                  <CheckSquare className="h-4 w-4" />
                  Show all tasks
                </button>
              )}
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

      <EditTaskForm
        task={editingTask}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingTask(null);
        }}
        onSubmitTask={(task) => {
          updateRecord('tasks', task.id, task);
        }}
      />

      <DeleteTaskDialog
        title={deleteTarget?.title || ''}
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
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
