import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Boxes, CalendarDays, Clock3, Heart, PencilLine, Plus, Receipt, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { useWorkbook } from '../../hooks/useWorkbook';
import type { CustomModule, DailyLog, Expense, Memory, ModuleField, Task } from '../../types';
import { getLocalDateString, isValidIsoDate } from '../../utils';

const getRelativeLabel = (date: string) => {
  const parsed = parseISO(date);
  if (isToday(parsed)) {
    return 'Today';
  }

  if (isYesterday(parsed)) {
    return 'Yesterday';
  }

  return format(parsed, 'EEE, MMM d');
};

const formatTimestamp = (value: string) => {
  try {
    return format(new Date(value), 'MMM d, yyyy · HH:mm');
  } catch {
    return value;
  }
};

const getModuleDisplayValue = (value: unknown, field: ModuleField): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (field.fieldType === 'Boolean') {
    return value ? 'Yes' : 'No';
  }

  if (field.fieldType === 'Number' || field.fieldType === 'Rating') {
    return String(value);
  }

  if (field.fieldType === 'Dropdown' && Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
};

interface DailyLogSummary {
  log: DailyLog;
  expenseCount: number;
  taskCount: number;
  memoryCount: number;
  moduleEntryCount: number;
}

export default function DailyLogPage() {
  const navigate = useNavigate();
  const { workbookData, addRecord, updateRecord, deleteRecord } = useWorkbook();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState(getLocalDateString());
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyLog | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const dailyLogs = useMemo(() => {
    return [...(workbookData?.dailyLogs ?? [])].sort((left, right) => right.date.localeCompare(left.date));
  }, [workbookData?.dailyLogs]);

  useEffect(() => {
    if (!workbookData) {
      setSelectedLogId(null);
      return;
    }

    if (!dailyLogs.length) {
      setSelectedLogId(null);
      return;
    }

    if (!selectedLogId || !dailyLogs.some((log) => log.id === selectedLogId)) {
      setSelectedLogId(dailyLogs[0].id);
    }
  }, [dailyLogs, selectedLogId, workbookData]);

  const selectedLog = useMemo(() => {
    return dailyLogs.find((log) => log.id === selectedLogId) ?? null;
  }, [dailyLogs, selectedLogId]);

  const summaries = useMemo<DailyLogSummary[]>(() => {
    const expenses = workbookData?.expenses ?? [];
    const tasks = workbookData?.tasks ?? [];
    const memories = workbookData?.memories ?? [];
    const moduleEntries = workbookData?.moduleEntries ?? [];

    return dailyLogs.map((log) => ({
      log,
      expenseCount: expenses.filter((expense) => expense.date === log.date).length,
      taskCount: tasks.filter((task) => (task.dueDate === log.date) || (task.completedDate === log.date)).length,
      memoryCount: memories.filter((memory) => memory.date === log.date).length,
      moduleEntryCount: moduleEntries.filter((entry) => entry.date === log.date).length
    }));
  }, [dailyLogs, workbookData?.expenses, workbookData?.tasks, workbookData?.memories, workbookData?.moduleEntries]);

  const linkedExpenses = useMemo<Expense[]>(() => {
    if (!selectedLog) {
      return [];
    }

    return [...(workbookData?.expenses ?? [])]
      .filter((expense) => expense.date === selectedLog.date)
      .sort((left, right) => `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`));
  }, [selectedLog, workbookData?.expenses]);

  const linkedTasks = useMemo<Task[]>(() => {
    if (!selectedLog) {
      return [];
    }

    return [...(workbookData?.tasks ?? [])].filter((task) => task.dueDate === selectedLog.date || task.completedDate === selectedLog.date);
  }, [selectedLog, workbookData?.tasks]);

  const linkedMemories = useMemo<Memory[]>(() => {
    if (!selectedLog) {
      return [];
    }

    return [...(workbookData?.memories ?? [])].filter((memory) => memory.date === selectedLog.date);
  }, [selectedLog, workbookData?.memories]);

  const linkedModuleEntries = useMemo(() => {
    if (!selectedLog) {
      return [];
    }

    const moduleEntries = [...(workbookData?.moduleEntries ?? [])].filter((entry) => entry.date === selectedLog.date);
    const modules = (workbookData?.customModules ?? []) as CustomModule[];
    const moduleMap = new Map(modules.map((module) => [module.id, module]));

    return moduleEntries
      .map((entry) => ({
        entry,
        module: moduleMap.get(entry.moduleId) ?? null
      }))
      .filter((item) => item.module)
      .sort((left, right) => (left.module?.name || '').localeCompare(right.module?.name || ''));
  }, [selectedLog, workbookData?.customModules, workbookData?.moduleEntries]);

  const moduleFields = useMemo(() => workbookData?.moduleFields ?? [], [workbookData?.moduleFields]);

  const handleCreateDailyLog = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    const normalizedDate = createDate.trim();
    if (!normalizedDate || !isValidIsoDate(normalizedDate)) {
      setCreateError('Please enter a valid ISO date in YYYY-MM-DD format.');
      return;
    }

    const existingLog = dailyLogs.find((log) => log.date === normalizedDate);
    if (existingLog) {
      setSelectedLogId(existingLog.id);
      setStatusMessage(`A daily log for ${normalizedDate} already exists, so that day was opened instead.`);
      setCreateDate(getLocalDateString());
      setIsCreateOpen(false);
      return;
    }

    const now = new Date().toISOString();
    const nextLog: DailyLog = {
      id: crypto.randomUUID(),
      date: normalizedDate,
      createdAt: now,
      updatedAt: now
    };

    addRecord('dailyLogs', nextLog);
    setSelectedLogId(nextLog.id);
    setStatusMessage(`Created daily log for ${normalizedDate}.`);
    setCreateDate(getLocalDateString());
    setIsCreateOpen(false);
  };

  const handleEditDailyLog = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    if (!selectedLog) {
      return;
    }

    const normalizedDate = editDate.trim();
    if (!normalizedDate || !isValidIsoDate(normalizedDate)) {
      setEditError('Please enter a valid ISO date in YYYY-MM-DD format.');
      return;
    }

    const duplicateLog = dailyLogs.find((log) => log.id !== selectedLog.id && log.date === normalizedDate);
    if (duplicateLog) {
      setEditError(`A daily log for ${normalizedDate} already exists.`);
      return;
    }

    updateRecord('dailyLogs', selectedLog.id, {
      date: normalizedDate,
      updatedAt: new Date().toISOString()
    });

    setSelectedLogId(selectedLog.id);
    setStatusMessage(`Updated the day marker to ${normalizedDate}.`);
    setIsEditOpen(false);
    setEditDate('');
  };

  const handleDeleteDailyLog = () => {
    if (!deleteTarget) {
      return;
    }

    deleteRecord('dailyLogs', deleteTarget.id);
    setDeleteTarget(null);
    setStatusMessage('Deleted the daily-log marker. Linked records remain intact.');
  };

  if (!workbookData) {
    return (
      <WorkbookEmptyState
        icon={BookOpen}
        title="No workbook loaded"
        description="Daily logs live inside your local workbook. Import a workbook first to create day markers and tie them to expenses, tasks, memories, and custom-module entries."
        primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily hub"
        title="Daily Log"
        description="Create a day marker, then connect expenses, tasks, memories, and custom-module entries to that day without adding a second storage layer."
        actions={
          <button
            type="button"
            onClick={() => {
              setCreateDate(getLocalDateString());
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            <Plus className="h-4 w-4" />
            Add day
          </button>
        }
      />

      {statusMessage ? (
        <div className="rounded-2xl border border-brand-border bg-brand-bg-card px-4 py-3 text-sm text-brand-text-muted">
          {statusMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-brand-text">Daily timeline</h2>
                <p className="mt-1 text-sm text-brand-text-muted">Newest days appear first. Each day is a hub for linked records on that date.</p>
              </div>
              <div className="rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-sm text-brand-text-muted">
                {dailyLogs.length} day{dailyLogs.length === 1 ? '' : 's'}
              </div>
            </div>

            {dailyLogs.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-brand-border bg-brand-bg p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-brand-text">No day markers yet</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">Start with today’s day so your workbook can collect linked details from expenses, tasks, memories, and custom modules.</p>
                <button
                  type="button"
                  onClick={() => {
                    setCreateDate(getLocalDateString());
                    setCreateError(null);
                    setIsCreateOpen(true);
                  }}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
                >
                  <Plus className="h-4 w-4" />
                  Add your first day
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {summaries.map(({ log, expenseCount, taskCount, memoryCount, moduleEntryCount }) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => setSelectedLogId(log.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition-colors ${isSelected ? 'border-brand-emerald bg-brand-emerald/10 shadow-soft' : 'border-brand-border bg-brand-bg hover:border-brand-emerald/40'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-brand-text">{format(parseISO(log.date), 'MMM d, yyyy')}</p>
                          <p className="mt-1 text-sm text-brand-text-muted">{getRelativeLabel(log.date)}</p>
                        </div>
                        <span className="rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-text-muted">
                          {log.date}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm text-brand-text-muted">
                          <span className="font-medium text-brand-text">{expenseCount}</span> expense{expenseCount === 1 ? '' : 's'}
                        </div>
                        <div className="rounded-2xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm text-brand-text-muted">
                          <span className="font-medium text-brand-text">{taskCount}</span> task{taskCount === 1 ? '' : 's'}
                        </div>
                        <div className="rounded-2xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm text-brand-text-muted">
                          <span className="font-medium text-brand-text">{memoryCount}</span> memory{memoryCount === 1 ? '' : 'ies'}
                        </div>
                        <div className="rounded-2xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm text-brand-text-muted">
                          <span className="font-medium text-brand-text">{moduleEntryCount}</span> module entr{moduleEntryCount === 1 ? 'y' : 'ies'}
                        </div>
                      </div>

                      {log.updatedAt ? (
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">
                          <Clock3 className="h-3.5 w-3.5" />
                          Updated {formatTimestamp(log.updatedAt)}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
          {selectedLog ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/10 bg-brand-emerald/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-emerald">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {selectedLog.date}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-brand-text">{getRelativeLabel(selectedLog.date)} focus</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">A calm daily hub for everything linked to this date. Deleting the day marker keeps all linked records intact.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditDate(selectedLog.date);
                      setEditError(null);
                      setIsEditOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit day
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selectedLog)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete day
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <SectionCard
                  title="Expenses"
                  icon={Receipt}
                  count={linkedExpenses.length}
                  emptyMessage="No expenses were recorded for this day."
                  actionLabel="Open expenses"
                  onAction={() => navigate('/app/expenses')}
                >
                  {linkedExpenses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg p-4 text-sm text-brand-text-muted">No expenses for this day yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {linkedExpenses.map((expense) => (
                        <div key={expense.id} className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-brand-text">{expense.category || 'Uncategorized'}</span>
                            <span className="text-sm font-medium text-brand-emerald">{expense.amount.toFixed(2)} {expense.currency || 'INR'}</span>
                          </div>
                          {expense.description ? <p className="mt-1 text-sm text-brand-text-muted">{expense.description}</p> : null}
                          {expense.time ? <p className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-text-muted">{expense.time}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Tasks"
                  icon={CheckCircle2}
                  count={linkedTasks.length}
                  emptyMessage="No tasks are due or completed on this day."
                  actionLabel="Open tasks"
                  onAction={() => navigate('/app/tasks')}
                >
                  {linkedTasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg p-4 text-sm text-brand-text-muted">Tasks count as linked when their due date or completed date matches this day.</div>
                  ) : (
                    <div className="space-y-2">
                      {linkedTasks.map((task) => (
                        <div key={task.id} className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-brand-text">{task.title}</span>
                            <span className="rounded-full border border-brand-border bg-brand-bg-card px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-text-muted">
                              {task.status || 'Not Started'}
                            </span>
                          </div>
                          {task.description ? <p className="mt-1 text-sm text-brand-text-muted">{task.description}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Memories"
                  icon={Heart}
                  count={linkedMemories.length}
                  emptyMessage="No memories were saved for this day."
                  actionLabel="Open memories"
                  onAction={() => navigate('/app/memories')}
                >
                  {linkedMemories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg p-4 text-sm text-brand-text-muted">No memories linked to this day yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {linkedMemories.map((memory) => (
                        <div key={memory.id} className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-brand-text">{memory.title}</span>
                            <span className="text-sm text-brand-text-muted">{memory.category || 'General'}</span>
                          </div>
                          {memory.description ? <p className="mt-1 text-sm text-brand-text-muted">{memory.description}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Custom modules"
                  icon={Boxes}
                  count={linkedModuleEntries.length}
                  emptyMessage="No custom-module entries were recorded for this day."
                  actionLabel="Open modules"
                  onAction={() => navigate('/app/modules')}
                >
                  {linkedModuleEntries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg p-4 text-sm text-brand-text-muted">No module entries for this day yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {linkedModuleEntries.map(({ entry, module }) => {
                        const fields = moduleFields.filter((field) => field.moduleId === entry.moduleId);
                        return (
                          <div key={entry.id} className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2">
                            <p className="text-sm font-semibold text-brand-text">{module?.name || 'Module'}</p>
                            <div className="mt-2 space-y-1">
                              {fields.map((field) => (
                                <div key={field.id} className="flex items-center justify-between gap-3 text-sm text-brand-text-muted">
                                  <span>{field.fieldName}</span>
                                  <span className="text-right font-medium text-brand-text">{getModuleDisplayValue(entry.data[field.id], field)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-brand-border bg-brand-bg p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-brand-text">Select a day</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">Choose a day from the timeline to see linked expenses, tasks, memories, and module entries in one place.</p>
            </div>
          )}
        </div>
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="create-daily-log-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="create-daily-log-title" className="text-xl font-semibold text-brand-text">Add day</h2>
                <p className="mt-1 text-sm text-brand-text-muted">Create a day marker in your workbook. Duplicates are prevented.</p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close create day dialog">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleCreateDailyLog}>
              <div>
                <label htmlFor="daily-log-date" className="block text-sm font-medium text-brand-text">Date</label>
                <input id="daily-log-date" type="date" value={createDate} onChange={(event) => setCreateDate(event.target.value)} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
              </div>
              {createError ? <p className="text-sm text-rose-600">{createError}</p> : null}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90">
                  <Plus className="h-4 w-4" />
                  Create day
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isEditOpen && selectedLog ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-daily-log-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="edit-daily-log-title" className="text-xl font-semibold text-brand-text">Edit day</h2>
                <p className="mt-1 text-sm text-brand-text-muted">Change the day marker date and keep the workbook clean with duplicate protection.</p>
              </div>
              <button type="button" onClick={() => setIsEditOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close edit day dialog">
                <PencilLine className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleEditDailyLog}>
              <div>
                <label htmlFor="daily-log-edit-date" className="block text-sm font-medium text-brand-text">Date</label>
                <input id="daily-log-edit-date" type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
              </div>
              {editError ? <p className="text-sm text-rose-600">{editError}</p> : null}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90">
                  <PencilLine className="h-4 w-4" />
                  Save day
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-daily-log-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="delete-daily-log-title" className="text-xl font-semibold text-brand-text">Delete day</h2>
                <p className="mt-1 text-sm text-brand-text-muted">Delete the day marker for <span className="font-medium text-brand-text">{deleteTarget.date}</span>?</p>
              </div>
              <button type="button" onClick={() => setDeleteTarget(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close delete day dialog">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Deleting this daily-log marker does not delete linked expenses, tasks, memories, or custom-module entries. It only removes the date marker itself.
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
              <button type="button" onClick={handleDeleteDailyLog} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                <Trash2 className="h-4 w-4" />
                Delete day
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  count,
  actionLabel,
  onAction,
  children
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  emptyMessage: string;
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-brand-border bg-brand-bg p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-emerald" />
          <h3 className="text-sm font-semibold text-brand-text">{title}</h3>
        </div>
        <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-text-muted">
          {count}
        </span>
      </div>

      <div className="mt-4">
        {children}
      </div>

      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-emerald transition-colors hover:text-brand-emerald/80"
      >
        {actionLabel}
        <ArrowLeft className="h-4 w-4 rotate-180" />
      </button>
    </section>
  );
}

