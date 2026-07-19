import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, X } from 'lucide-react';
import type { Expense } from '../../../types';
import { expenseFormSchema, type ExpenseFormValues } from '../expenseSchema';

interface AddExpenseFormProps {
  isOpen: boolean;
  defaultCurrency: string;
  onClose: () => void;
  onSubmitExpense: (expense: Expense) => void;
}

const getToday = () => new Date().toISOString().slice(0, 10);

const defaultValues = (currency: string): ExpenseFormValues => ({
  date: getToday(),
  time: '',
  category: '',
  amount: 0,
  description: '',
  paymentMethod: '',
  currency,
  tags: '',
  notes: ''
});

export default function AddExpenseForm({ isOpen, defaultCurrency, onClose, onSubmitExpense }: AddExpenseFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: defaultValues(defaultCurrency)
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues(defaultCurrency));
    }
  }, [defaultCurrency, isOpen, reset]);

  const submitHandler = handleSubmit((values) => {
    const tags = values.tags
      ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).join(', ')
      : '';

    onSubmitExpense({
      id: crypto.randomUUID(),
      date: values.date,
      time: values.time?.trim() || '',
      category: values.category.trim(),
      description: values.description?.trim() || '',
      paymentMethod: values.paymentMethod?.trim() || '',
      amount: Number(values.amount),
      currency: values.currency.trim() || defaultCurrency,
      tags,
      notes: values.notes?.trim() || ''
    });

    reset(defaultValues(defaultCurrency));
    onClose();
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="add-expense-title" className="w-full max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="add-expense-title" className="text-xl font-semibold text-brand-text">Add expense</h2>
            <p className="mt-1 text-sm text-brand-text-muted">Capture a workbook expense without leaving the local-first flow.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close add expense form">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={submitHandler}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expense-date" className="block text-sm font-medium text-brand-text">Date</label>
              <input id="expense-date" type="date" {...register('date')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
              {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date.message}</p>}
            </div>
            <div>
              <label htmlFor="expense-time" className="block text-sm font-medium text-brand-text">Time</label>
              <input id="expense-time" type="time" {...register('time')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expense-category" className="block text-sm font-medium text-brand-text">Category</label>
              <input id="expense-category" {...register('category')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Groceries" />
              {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p>}
            </div>
            <div>
              <label htmlFor="expense-amount" className="block text-sm font-medium text-brand-text">Amount</label>
              <input id="expense-amount" type="number" step="0.01" min="0" {...register('amount')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="0.00" />
              {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expense-paymentMethod" className="block text-sm font-medium text-brand-text">Payment method</label>
              <input id="expense-paymentMethod" {...register('paymentMethod')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Card, Cash" />
            </div>
            <div>
              <label htmlFor="expense-currency" className="block text-sm font-medium text-brand-text">Currency</label>
              <input id="expense-currency" {...register('currency')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder={defaultCurrency} />
              {errors.currency && <p className="mt-1 text-xs text-rose-600">{errors.currency.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="expense-description" className="block text-sm font-medium text-brand-text">Description</label>
            <textarea id="expense-description" rows={3} {...register('description')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Optional details" />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expense-tags" className="block text-sm font-medium text-brand-text">Tags</label>
              <input id="expense-tags" {...register('tags')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Food, Home" />
            </div>
            <div>
              <label htmlFor="expense-notes" className="block text-sm font-medium text-brand-text">Notes</label>
              <textarea id="expense-notes" rows={3} {...register('notes')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Optional notes" />
              {errors.notes && <p className="mt-1 text-xs text-rose-600">{errors.notes.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90 disabled:cursor-not-allowed disabled:opacity-60">
              <PlusCircle className="h-4 w-4" />
              Add expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}