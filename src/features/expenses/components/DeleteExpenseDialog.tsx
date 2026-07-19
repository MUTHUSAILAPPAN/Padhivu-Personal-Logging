import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { Expense } from '../../../types';

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteExpenseDialog({ expense, isOpen, onClose, onConfirm }: DeleteExpenseDialogProps) {
  if (!isOpen || !expense) {
    return null;
  }

  const amountText = (() => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: expense.currency }).format(expense.amount);
    } catch {
      return `${expense.currency} ${expense.amount.toFixed(2)}`;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-expense-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="delete-expense-title" className="text-xl font-semibold text-brand-text">Delete expense</h2>
              <p className="mt-1 text-sm text-brand-text-muted">
                Delete <span className="font-medium text-brand-text">{expense.category}</span> on <span className="font-medium text-brand-text">{expense.date}</span> for <span className="font-medium text-brand-text">{amountText}</span>?
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close delete expense dialog">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
          <button type="button" onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
            <Trash2 className="h-4 w-4" />
            Delete expense
          </button>
        </div>
      </div>
    </div>
  );
}