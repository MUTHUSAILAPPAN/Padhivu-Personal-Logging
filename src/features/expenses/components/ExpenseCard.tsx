import { CalendarDays, CircleDollarSign, CreditCard, NotebookText, Tags, Trash2, Clock3 } from 'lucide-react';
import type { Expense } from '../../../types';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (expense: Expense) => void;
}

const normalizeCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  return (
    <article className="rounded-2xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-brand-text">{expense.category}</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-emerald/20 bg-brand-emerald/10 px-2.5 py-0.5 text-xs font-semibold text-brand-emerald">
              <CircleDollarSign className="h-3.5 w-3.5" />
              {normalizeCurrency(expense.amount, expense.currency)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-brand-text-muted">
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {expense.date}
            </span>
            {expense.time && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-1">
                <Clock3 className="h-3.5 w-3.5" />
                {expense.time}
              </span>
            )}
            {expense.paymentMethod && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-1">
                <CreditCard className="h-3.5 w-3.5" />
                {expense.paymentMethod}
              </span>
            )}
          </div>
          {expense.description && <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">{expense.description}</p>}
          {(expense.tags || expense.notes) && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-brand-text-muted">
              {expense.tags && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-1">
                  <Tags className="h-3 w-3" />
                  {expense.tags}
                </span>
              )}
              {expense.notes && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-1">
                  <NotebookText className="h-3 w-3" />
                  Notes included
                </span>
              )}
            </div>
          )}
          {expense.notes && <p className="mt-3 text-xs leading-relaxed text-brand-text-muted">{expense.notes}</p>}
        </div>

        <button
          type="button"
          onClick={() => onDelete(expense)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60"
          aria-label={`Delete expense ${expense.category} on ${expense.date}`}
          title={`Delete ${expense.category}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}