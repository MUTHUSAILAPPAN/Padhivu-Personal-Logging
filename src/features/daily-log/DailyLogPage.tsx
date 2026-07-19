import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, BookOpen, Boxes, CalendarDays, CheckCircle2, Clock3, Heart, ListFilter, PencilLine, Plus, Receipt, Sparkles, Trash2, X } from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { useWorkbook } from '../../hooks/useWorkbook';
import ExpenseForm from '../expenses/components/ExpenseForm';
import MemoryForm from '../memories/components/MemoryForm';
import ModuleEntryForm from '../modules/components/ModuleEntryForm';
import EditTaskForm from '../tasks/components/EditTaskForm';
import type { CustomModule, DailyLog, Expense, Memory, ModuleEntry, ModuleField, Task } from '../../types';
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

type LinkedRecordFilter = 'all' | 'expense' | 'task' | 'memory' | 'moduleEntry';

type LinkedDeleteTarget = {
  kind: 'dailyLog' | 'expense' | 'task' | 'memory' | 'moduleEntry';
  record: DailyLog | Expense | Task | Memory | ModuleEntry;
  module?: CustomModule | null;
};

type LinkedItem =
  | { kind: 'expense'; record: Expense; sortKey: string }
  | { kind: 'task'; record: Task; sortKey: string }
  | { kind: 'memory'; record: Memory; sortKey: string }
  | { kind: 'moduleEntry'; record: ModuleEntry; module: CustomModule | null; sortKey: string };

export default function DailyLogPage() {
  const { workbookData, addRecord, updateRecord, deleteRecord } = useWorkbook();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState(getLocalDateString());
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [selectedRecordFilter, setSelectedRecordFilter] = useState<LinkedRecordFilter>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editingModuleEntry, setEditingModuleEntry] = useState<ModuleEntry | null>(null);
  const [editingModule, setEditingModule] = useState<CustomModule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LinkedDeleteTarget | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const dailyLogs = useMemo(() => {
    return [...(workbookData?.dailyLogs ?? [])].sort((left, right) => right.date.localeCompare(left.date));
  }, [workbookData?.dailyLogs]);

  const selectedLog = useMemo(() => {
    return dailyLogs.find((log) => log.id === selectedLogId) ?? null;
  }, [dailyLogs, selectedLogId]);

  useEffect(() => {
    if (!workbookData) {
      setSelectedLogId(null);
      setIsDetailPanelOpen(false);
      return;
    }

    if (!dailyLogs.length) {
      setSelectedLogId(null);
      setIsDetailPanelOpen(false);
      return;
    }

    if (!selectedLogId || !dailyLogs.some((log) => log.id === selectedLogId)) {
      setSelectedLogId(dailyLogs[0].id);
      setIsDetailPanelOpen(true);
    }
  }, [dailyLogs, selectedLogId, workbookData]);

  useEffect(() => {
    if (!selectedLog || !isDetailPanelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDetailPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailPanelOpen, selectedLog]);

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

  const linkedItems = useMemo<LinkedItem[]>(() => {
    if (!selectedLog) {
      return [];
    }

    return [
      ...linkedExpenses.map((expense) => ({ kind: 'expense' as const, record: expense, sortKey: `${expense.date}${expense.time}${expense.id}` })),
      ...linkedTasks.map((task) => ({ kind: 'task' as const, record: task, sortKey: `${task.dueDate || task.completedDate}${task.id}` })),
      ...linkedMemories.map((memory) => ({ kind: 'memory' as const, record: memory, sortKey: `${memory.date}${memory.id}` })),
      ...linkedModuleEntries.map(({ entry, module }) => ({ kind: 'moduleEntry' as const, record: entry, module, sortKey: `${entry.date}${entry.id}` }))
    ].sort((left, right) => left.sortKey.localeCompare(right.sortKey));
  }, [linkedExpenses, linkedMemories, linkedModuleEntries, linkedTasks, selectedLog]);

  const filteredLinkedItems = useMemo(() => {
    if (selectedRecordFilter === 'all') {
      return linkedItems;
    }

    return linkedItems.filter((item) => item.kind === selectedRecordFilter);
  }, [linkedItems, selectedRecordFilter]);

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
      setIsDetailPanelOpen(true);
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
    setIsDetailPanelOpen(true);
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
    setIsDetailPanelOpen(true);
    setStatusMessage(`Updated the day marker to ${normalizedDate}.`);
    setIsEditOpen(false);
    setEditDate('');
  };

  const handleDeleteDailyLog = () => {
    if (!deleteTarget || deleteTarget.kind !== 'dailyLog') {
      return;
    }

    deleteRecord('dailyLogs', deleteTarget.record.id);
    setDeleteTarget(null);
    setStatusMessage('Deleted the daily-log marker. Linked records remain intact.');
  };

  const handleDeleteLinkedRecord = () => {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.kind === 'expense') {
      deleteRecord('expenses', deleteTarget.record.id);
      setStatusMessage('Deleted the linked expense.');
    } else if (deleteTarget.kind === 'task') {
      deleteRecord('tasks', deleteTarget.record.id);
      setStatusMessage('Deleted the linked task.');
    } else if (deleteTarget.kind === 'memory') {
      deleteRecord('memories', deleteTarget.record.id);
      setStatusMessage('Deleted the linked memory.');
    } else if (deleteTarget.kind === 'moduleEntry') {
      deleteRecord('moduleEntries', deleteTarget.record.id);
      setStatusMessage('Deleted the linked module entry.');
    }

    setDeleteTarget(null);
  };

  const handleExpenseSubmit = (expense: Expense) => {
    updateRecord('expenses', expense.id, expense);
    setEditingExpense(null);
  };

  const handleTaskSubmit = (task: Task) => {
    updateRecord('tasks', task.id, task);
    setEditingTask(null);
  };

  const handleMemorySubmit = (memory: Memory) => {
    updateRecord('memories', memory.id, memory);
    setEditingMemory(null);
  };

  const handleModuleEntrySubmit = (entry: ModuleEntry) => {
    updateRecord('moduleEntries', entry.id, entry);
    setEditingModuleEntry(null);
    setEditingModule(null);
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
                      onClick={() => {
                        setSelectedLogId(log.id);
                        setIsDetailPanelOpen(true);
                      }}
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
          {selectedLog && isDetailPanelOpen ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/10 bg-brand-emerald/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-emerald">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {selectedLog.date}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-brand-text">{getRelativeLabel(selectedLog.date)} focus</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">A compact, workbook-backed detail view for everything linked to this date. Filters are local to the panel and never change the workbook.</p>
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
                    onClick={() => setDeleteTarget({ kind: 'dailyLog', record: selectedLog })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete day
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDetailPanelOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60"
                    aria-label="Close daily log detail panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <div className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted">
                  <span className="font-semibold text-brand-text">{linkedItems.length}</span> linked item{linkedItems.length === 1 ? '' : 's'}
                </div>
                <div className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted">
                  <span className="font-semibold text-brand-text">{linkedExpenses.length}</span> expense{linkedExpenses.length === 1 ? '' : 's'}
                </div>
                <div className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted">
                  <span className="font-semibold text-brand-text">{linkedTasks.length}</span> task{linkedTasks.length === 1 ? '' : 's'}
                </div>
                <div className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted">
                  <span className="font-semibold text-brand-text">{linkedMemories.length}</span> memory{linkedMemories.length === 1 ? '' : 'ies'}
                </div>
                <div className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted">
                  <span className="font-semibold text-brand-text">{linkedModuleEntries.length}</span> module entr{linkedModuleEntries.length === 1 ? 'y' : 'ies'}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-brand-border bg-brand-bg p-2">
                {(['all', 'expense', 'task', 'memory', 'moduleEntry'] as const).map((filter) => {
                  const meta = filter === 'all' ? 'All' : filter === 'expense' ? 'Expenses' : filter === 'task' ? 'Tasks' : filter === 'memory' ? 'Memories' : 'Modules';
                  const count = filter === 'all' ? linkedItems.length : linkedItems.filter((item) => item.kind === filter).length;
                  const isActive = selectedRecordFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSelectedRecordFilter(filter)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand-emerald text-white' : 'text-brand-text-muted hover:bg-brand-border/60'}`}
                    >
                      {meta} <span className="ml-1 text-xs opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                {filteredLinkedItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg p-6 text-sm text-brand-text-muted">
                    <div className="flex items-center gap-2 text-brand-text">
                      <ListFilter className="h-4 w-4 text-brand-emerald" />
                      No records match this filter for this day yet.
                    </div>
                  </div>
                ) : (
                  filteredLinkedItems.map((item) => {
                    if (item.kind === 'expense') {
                      const expense = item.record as Expense;
                      return (
                        <div key={expense.id} className="rounded-2xl border border-brand-border bg-brand-bg p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                                  <Receipt className="h-4 w-4" />
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-brand-text">{expense.category || 'Uncategorized expense'}</p>
                                  <p className="text-xs uppercase tracking-[0.16em] text-brand-text-muted">Expense</p>
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-brand-text-muted">{expense.description || 'No notes attached to this record.'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => setEditingExpense(expense)} className="rounded-xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Edit</button>
                              <button type="button" onClick={() => setDeleteTarget({ kind: 'expense', record: expense })} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100">Delete</button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-brand-text-muted">
                            <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{expense.time || 'No time'}</span>
                            <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{expense.amount.toFixed(2)} {expense.currency || 'INR'}</span>
                            {expense.paymentMethod ? <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{expense.paymentMethod}</span> : null}
                          </div>
                        </div>
                      );
                    }

                    if (item.kind === 'task') {
                      const task = item.record as Task;
                      return (
                        <div key={task.id} className="rounded-2xl border border-brand-border bg-brand-bg p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                                  <CheckCircle2 className="h-4 w-4" />
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-brand-text">{task.title}</p>
                                  <p className="text-xs uppercase tracking-[0.16em] text-brand-text-muted">Task</p>
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-brand-text-muted">{task.description || 'No notes attached to this task.'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => setEditingTask(task)} className="rounded-xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Edit</button>
                              <button type="button" onClick={() => setDeleteTarget({ kind: 'task', record: task })} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100">Delete</button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-brand-text-muted">
                            <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{task.status || 'Not Started'}</span>
                            {task.priority ? <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{task.priority}</span> : null}
                            {task.dueDate ? <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">Due {task.dueDate}</span> : null}
                          </div>
                        </div>
                      );
                    }

                    if (item.kind === 'memory') {
                      const memory = item.record as Memory;
                      return (
                        <div key={memory.id} className="rounded-2xl border border-brand-border bg-brand-bg p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                                  <Heart className="h-4 w-4" />
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-brand-text">{memory.title}</p>
                                  <p className="text-xs uppercase tracking-[0.16em] text-brand-text-muted">Memory</p>
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-brand-text-muted">{memory.description || 'No notes attached to this memory.'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => setEditingMemory(memory)} className="rounded-xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Edit</button>
                              <button type="button" onClick={() => setDeleteTarget({ kind: 'memory', record: memory })} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100">Delete</button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-brand-text-muted">
                            {memory.category ? <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{memory.category}</span> : null}
                            {memory.location ? <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{memory.location}</span> : null}
                            {memory.mood ? <span className="rounded-full border border-brand-border bg-brand-bg-card px-2.5 py-1">{memory.mood}</span> : null}
                          </div>
                        </div>
                      );
                    }

                    const entry = item.record as ModuleEntry;
                    const module = item.module;
                    const fields = moduleFields.filter((field) => field.moduleId === entry.moduleId);
                    return (
                      <div key={entry.id} className="rounded-2xl border border-brand-border bg-brand-bg p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                                <Boxes className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-brand-text">{module?.name || 'Module entry'}</p>
                                <p className="text-xs uppercase tracking-[0.16em] text-brand-text-muted">Custom module</p>
                              </div>
                            </div>
                            <div className="mt-2 space-y-1">
                              {fields.slice(0, 3).map((field) => (
                                <div key={field.id} className="flex items-center justify-between gap-3 text-sm text-brand-text-muted">
                                  <span>{field.fieldName}</span>
                                  <span className="text-right font-medium text-brand-text">{getModuleDisplayValue(entry.data[field.id], field)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => { setEditingModuleEntry(entry); setEditingModule(module); }} className="rounded-xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Edit</button>
                            <button type="button" onClick={() => setDeleteTarget({ kind: 'moduleEntry', record: entry, module })} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100">Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-brand-border bg-brand-bg p-8 text-center">
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

      {editingExpense ? (
        <ExpenseForm
          isOpen={Boolean(editingExpense)}
          mode="edit"
          defaultCurrency={workbookData?.settings?.currency || 'INR'}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmitExpense={handleExpenseSubmit}
        />
      ) : null}

      {editingTask ? (
        <EditTaskForm
          task={editingTask}
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          onSubmitTask={handleTaskSubmit}
        />
      ) : null}

      {editingMemory ? (
        <MemoryForm
          isOpen={Boolean(editingMemory)}
          mode="edit"
          memory={editingMemory}
          onClose={() => setEditingMemory(null)}
          onSubmitMemory={handleMemorySubmit}
        />
      ) : null}

      {editingModuleEntry && editingModule ? (
        <ModuleEntryForm
          isOpen={Boolean(editingModuleEntry)}
          module={editingModule}
          fields={moduleFields.filter((field) => field.moduleId === editingModule.id)}
          entry={editingModuleEntry}
          onClose={() => {
            setEditingModuleEntry(null);
            setEditingModule(null);
          }}
          onSubmitEntry={handleModuleEntrySubmit}
        />
      ) : null}

      {deleteTarget ? (
        deleteTarget.kind === 'dailyLog' ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div role="dialog" aria-modal="true" aria-labelledby="delete-daily-log-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="delete-daily-log-title" className="text-xl font-semibold text-brand-text">Delete day</h2>
                  <p className="mt-1 text-sm text-brand-text-muted">Delete the day marker for <span className="font-medium text-brand-text">{deleteTarget.kind === 'dailyLog' ? (deleteTarget.record as DailyLog).date : ''}</span>?</p>
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
        ) : (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div role="dialog" aria-modal="true" aria-labelledby="delete-linked-record-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 id="delete-linked-record-title" className="text-xl font-semibold text-brand-text">Delete linked record</h2>
                    <p className="mt-1 text-sm text-brand-text-muted">
                      Remove this {deleteTarget.kind === 'expense' ? 'expense' : deleteTarget.kind === 'task' ? 'task' : deleteTarget.kind === 'memory' ? 'memory' : 'module entry'} from this day’s workbook view?
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setDeleteTarget(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close delete linked record dialog">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
                <button type="button" onClick={handleDeleteLinkedRecord} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}

