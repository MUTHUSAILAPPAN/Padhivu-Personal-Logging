import { useMemo } from 'react';
import {
  CheckSquare,
  DollarSign,
  FolderOpen,
  Grid,
  Heart,
  BadgeDollarSign,
  CheckCircle2,
  Circle,
  AlertTriangle
} from 'lucide-react';
import { useWorkbook } from '../../hooks/useWorkbook';
import { PageHeader } from '../../components/ui/PageState';
import {
  getGreeting,
  getTodayLabel,
  getRecentActivity
} from '../../services/analytics/dashboardAnalytics';
import { getExpenseAnalytics, formatCurrency } from '../../services/analytics/expenseAnalytics';
import { getTaskAnalytics } from '../../services/analytics/taskAnalytics';
import { getMemoryAnalytics } from '../../services/analytics/memoryAnalytics';
import { getModuleAnalytics } from '../../services/analytics/moduleAnalytics';
import SummaryCard from './components/SummaryCard';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import EmptyDashboard from './components/EmptyDashboard';

const shortNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

const getTopCategory = (byCategory: Record<string, number>): string | null => {
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
};

const getCompactStatus = (count: number, label: string) => `${shortNumber.format(count)} ${label}`;

export default function DashboardPage() {
  const { workbookData, workbookName } = useWorkbook();

  const dashboardState = useMemo(() => {
    if (!workbookData) {
      return null;
    }

    const expenseAnalytics = getExpenseAnalytics(workbookData.expenses);
    const taskAnalytics = getTaskAnalytics(workbookData.tasks);
    const memoryAnalytics = getMemoryAnalytics(workbookData.memories);
    const moduleAnalytics = getModuleAnalytics(workbookData.customModules, workbookData.moduleEntries);
    const currency = workbookData.settings.currency || 'USD';
    const activity = getRecentActivity(
      workbookData.expenses,
      workbookData.tasks,
      workbookData.memories,
      workbookData.moduleEntries,
      workbookData.customModules,
      currency
    );

    return {
      greeting: getGreeting(),
      todayLabel: getTodayLabel(),
      currentMonthExpenses: formatCurrency(expenseAnalytics.currentMonthTotal, currency),
      openTasks: taskAnalytics.totalCount - taskAnalytics.completedCount,
      memoriesSaved: memoryAnalytics.totalCount,
      mostActiveModule: moduleAnalytics.mostActiveModule?.name ?? 'No custom modules yet',
      mostActiveModuleCount: moduleAnalytics.mostActiveModule?.count ?? 0,
      activity,
      expenseAnalytics,
      taskAnalytics,
      memoryAnalytics,
      moduleAnalytics,
      topCategory: getTopCategory(expenseAnalytics.byCategory),
      currency,
      taskCompletionRate: taskAnalytics.completionRate,
      recentMemories: memoryAnalytics.recentMemories.slice(0, 3)
    };
  }, [workbookData]);

  const quickActions = [
    {
      title: 'Tasks',
      description: 'Open your task list and review open work.',
      href: '/app/tasks',
      icon: CheckSquare
    },
    {
      title: 'Expenses',
      description: 'Review spend, categories, and trends.',
      href: '/app/expenses',
      icon: DollarSign
    },
    {
      title: 'Memories',
      description: 'Browse saved moments and highlights.',
      href: '/app/memories',
      icon: Heart
    },
    {
      title: 'Collections',
      description: 'Open curated lists from your workbook.',
      href: '/app/collections',
      icon: FolderOpen
    },
    {
      title: 'Custom Modules',
      description: 'View workbook-defined custom schemas.',
      href: '/app/modules',
      icon: Grid
    }
  ];

  if (!dashboardState) {
    return <EmptyDashboard />;
  }

  const { expenseAnalytics, taskAnalytics, memoryAnalytics } = dashboardState;
  const topCategory = dashboardState.topCategory;
  const activityItems = dashboardState.activity;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={dashboardState.todayLabel}
        title={workbookName || 'Padhivu workbook'}
        description={`${dashboardState.greeting}. A calm local home for your workbook-backed notes, tasks, expenses, and custom logs.`}
        badge="Read only dashboard"
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Current month expenses"
          value={dashboardState.currentMonthExpenses}
          icon={BadgeDollarSign}
          toneClassName="bg-emerald-50 text-emerald-700"
          hint="Based on the active workbook currency"
        />
        <SummaryCard
          title="Open tasks"
          value={getCompactStatus(dashboardState.openTasks, dashboardState.openTasks === 1 ? 'task' : 'tasks')}
          icon={CheckSquare}
          toneClassName="bg-blue-50 text-blue-700"
          hint={`${dashboardState.taskCompletionRate}% completed overall`}
        />
        <SummaryCard
          title="Memories saved"
          value={getCompactStatus(dashboardState.memoriesSaved, dashboardState.memoriesSaved === 1 ? 'memory' : 'memories')}
          icon={Heart}
          toneClassName="bg-rose-50 text-rose-700"
          hint={memoryAnalytics.favoriteCount > 0 ? `${memoryAnalytics.favoriteCount} marked favorite` : 'No favorites yet'}
        />
        <SummaryCard
          title="Most active module"
          value={dashboardState.mostActiveModule}
          icon={Grid}
          toneClassName="bg-violet-50 text-violet-700"
          hint={dashboardState.mostActiveModuleCount > 0 ? `${dashboardState.mostActiveModuleCount} entries` : 'No module activity yet'}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <RecentActivity items={activityItems} />

        <aside className="space-y-6">
          <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
            <h2 className="text-lg font-semibold text-brand-text">Task summary</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <CompactMetric icon={CheckCircle2} label="Completed" value={taskAnalytics.completedCount} tone="text-emerald-700 bg-emerald-50" />
              <CompactMetric icon={Circle} label="Open" value={taskAnalytics.totalCount - taskAnalytics.completedCount} tone="text-blue-700 bg-blue-50" />
              <CompactMetric icon={AlertTriangle} label="Overdue" value={taskAnalytics.overdueTasks.length} tone="text-amber-700 bg-amber-50" />
            </div>
            <p className="mt-4 text-sm text-brand-text-muted">
              {taskAnalytics.totalCount === 0
                ? 'No tasks have been added yet.'
                : `Completion rate is ${taskAnalytics.completionRate}% across ${taskAnalytics.totalCount} tasks.`}
            </p>
          </section>

          <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
            <h2 className="text-lg font-semibold text-brand-text">Expense summary</h2>
            <div className="mt-4 space-y-3 text-sm text-brand-text-muted">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
                <span>Current month total</span>
                <span className="font-semibold text-brand-text">{dashboardState.currentMonthExpenses}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
                <span>Top category</span>
                <span className="font-semibold text-brand-text">{topCategory ?? 'No expense categories yet'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
                <span>Recent expenses</span>
                <span className="font-semibold text-brand-text">{expenseAnalytics.recentExpenses.length}</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
            <h2 className="text-lg font-semibold text-brand-text">Recent memories</h2>
            {dashboardState.recentMemories.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-brand-border bg-brand-bg px-4 py-5 text-sm text-brand-text-muted">
                No memories yet. Saved memories will appear here.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {dashboardState.recentMemories.map((memory) => (
                  <li key={memory.id} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
                    <p className="text-sm font-semibold text-brand-text">{memory.title}</p>
                    <p className="mt-1 text-sm text-brand-text-muted">
                      {memory.category || 'General'}{memory.location ? ` · ${memory.location}` : ''}
                    </p>
                    <p className="mt-2 text-xs text-brand-text-muted">{memory.date}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </section>

      <QuickActions actions={quickActions} />
    </div>
  );
}

function CompactMetric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">{label}</p>
        <p className="mt-1 text-lg font-semibold text-brand-text">{shortNumber.format(value)}</p>
      </div>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}
