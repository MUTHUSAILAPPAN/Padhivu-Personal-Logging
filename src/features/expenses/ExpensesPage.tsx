import { useMemo, useState } from 'react';
import { ArrowLeft, Filter, Plus, Receipt, Wallet } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useWorkbook } from '../../hooks/useWorkbook';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { getCategoryBreakdown, getExpenseAnalytics, formatCurrency } from '../../services/analytics/expenseAnalytics';
import type { Expense } from '../../types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import DeleteExpenseDialog from './components/DeleteExpenseDialog';

const getExpenseSortValue = (expense: Expense): number => {
  const parsed = parseISO(`${expense.date}${expense.time ? `T${expense.time}` : 'T00:00:00'}`);
  return Number.isNaN(parsed.getTime()) ? Number.NEGATIVE_INFINITY : parsed.getTime();
};

export default function ExpensesPage() {
  const { workbookData, addRecord, updateRecord, deleteRecord } = useWorkbook();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const analytics = useMemo(() => getExpenseAnalytics(workbookData?.expenses ?? []), [workbookData?.expenses]);
  const currentCurrency = workbookData?.settings.currency || 'INR';

  const sortedExpenses = useMemo(() => {
    const items = workbookData?.expenses ?? [];
    return [...items].sort((left, right) => getExpenseSortValue(right) - getExpenseSortValue(left));
  }, [workbookData?.expenses]);

  const categories = useMemo(() => Object.keys(analytics.byCategory).sort((left, right) => analytics.byCategory[right] - analytics.byCategory[left]), [analytics.byCategory]);
  const breakdownItems = useMemo(() => getCategoryBreakdown(workbookData?.expenses ?? []), [workbookData?.expenses]);

  const filteredExpenses = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      return sortedExpenses;
    }

    return sortedExpenses.filter((expense) => expense.category.trim() === selectedCategory);
  }, [selectedCategory, sortedExpenses]);

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleSubmitExpense = (expense: Expense) => {
    if (editingExpense) {
      updateRecord('expenses', editingExpense.id, expense);
    } else {
      addRecord('expenses', expense);
    }

    setEditingExpense(null);
    setIsFormOpen(false);
  };

  const handleDeleteExpense = () => {
    if (!deleteTarget) {
      return;
    }

    deleteRecord('expenses', deleteTarget.id);
    setDeleteTarget(null);
  };

  if (!workbookData) {
    return (
      <WorkbookEmptyState
        icon={Receipt}
        title="No workbook loaded"
        description="Padhivu expenses live inside your local Excel workbook. Import a workbook from the landing page to view and add expenses."
        primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
      />
    );
  }

  const expenseCount = workbookData.expenses.length;
  const currentMonthTotal = formatCurrency(analytics.currentMonthTotal, currentCurrency);
  const lifetimeTotal = formatCurrency(analytics.lifetimeTotal, currentCurrency);
  const recentExpenseLabel = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={recentExpenseLabel}
        title="Expenses"
        description="Track spending in your workbook and review recent entries without leaving the local-first flow."
        badge={<span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-sm text-brand-text-muted"><Wallet className="h-4 w-4 text-brand-emerald" />Workbook-backed list</span>}
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            <Plus className="h-4 w-4" />
            Add expense
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Current month total" value={currentMonthTotal} />
        <MetricCard title="Lifetime total" value={lifetimeTotal} />
        <MetricCard title="Transactions" value={`${expenseCount}`} />
        <MetricCard title="Recent items" value={`${analytics.recentExpenses.length}`} />
      </section>

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Expense summary</h2>
            <p className="mt-1 text-sm text-brand-text-muted">Current month spending is calculated using the existing analytics service.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-xs text-brand-text-muted sm:inline-flex">
            <Wallet className="h-3.5 w-3.5 text-brand-emerald" />
            Workbook-backed list
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryPill label="Current month" value={currentMonthTotal} />
          <SummaryPill label="Lifetime total" value={lifetimeTotal} />
          <SummaryPill label="Transactions" value={`${expenseCount}`} />
        </div>

        {breakdownItems.length > 0 && (
          <div className="mt-4 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-brand-text">Category breakdown</p>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">Compact</span>
            </div>
            <div className="mt-3 space-y-2">
              {breakdownItems.slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center justify-between gap-3 rounded-xl border border-brand-border/70 bg-brand-bg-card px-3 py-2">
                  <span className="text-sm font-medium text-brand-text">{item.category}</span>
                  <span className="text-sm font-semibold text-brand-emerald">{formatCurrency(item.total, currentCurrency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Recent expenses</h2>
            <p className="mt-1 text-sm text-brand-text-muted">Sorted newest first by date and time.</p>
          </div>
          {categories.length > 0 && (
            <label className="flex items-center gap-2 rounded-2xl border border-brand-border bg-brand-bg-card px-3 py-2 text-sm text-brand-text-muted">
              <Filter className="h-4 w-4 text-brand-emerald" />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="bg-transparent text-sm font-medium text-brand-text outline-none"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {filteredExpenses.length > 0 ? (
          <ExpenseList expenses={filteredExpenses} onDelete={setDeleteTarget} onEdit={handleOpenEdit} />
        ) : (
          <div className="rounded-3xl border border-dashed border-brand-border bg-brand-bg-card p-8 text-center shadow-subtle">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-text">No expenses yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">Add your first expense to begin tracking spending in the workbook.</p>
            <div className="mt-5">
              <button type="button" onClick={handleOpenCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90">
                <Plus className="h-4 w-4" />
                Add your first expense
              </button>
            </div>
          </div>
        )}
      </section>

      <ExpenseForm
        isOpen={isFormOpen}
        mode={editingExpense ? 'edit' : 'create'}
        defaultCurrency={currentCurrency}
        expense={editingExpense}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmitExpense={handleSubmitExpense}
      />

      <DeleteExpenseDialog
        expense={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteExpense}
      />
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-bg-card p-4 shadow-subtle">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-text">{value}</p>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-brand-text">{value}</p>
    </div>
  );
}
