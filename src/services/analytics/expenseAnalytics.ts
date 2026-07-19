import type { Expense } from '../../types';
import { parseISO, isToday, isSameWeek, isSameMonth } from 'date-fns';

export interface ExpenseSummary {
  todayTotal: number;
  currentWeekTotal: number;
  currentMonthTotal: number;
  lifetimeTotal: number;
  byCategory: Record<string, number>;
  recentExpenses: Expense[];
}

export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    // Fallback if locale or currency code is invalid
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const getExpenseAnalytics = (expenses: Expense[] = []): ExpenseSummary => {
  let todayTotal = 0;
  let currentWeekTotal = 0;
  let currentMonthTotal = 0;
  let lifetimeTotal = 0;
  const byCategory: Record<string, number> = {};

  const now = new Date();

  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    if (amount <= 0) return;

    let parsedDate: Date;
    try {
      parsedDate = parseISO(expense.date);
      if (isNaN(parsedDate.getTime())) return;
    } catch {
      return; // Skip invalid dates
    }

    // Lifetime
    lifetimeTotal += amount;

    // Today
    if (isToday(parsedDate)) {
      todayTotal += amount;
    }

    // Current Week (Monday start)
    if (isSameWeek(parsedDate, now, { weekStartsOn: 1 })) {
      currentWeekTotal += amount;
    }

    // Current Month
    if (isSameMonth(parsedDate, now)) {
      currentMonthTotal += amount;
    }

    // Category Grouping
    const cat = expense.category.trim() || 'Uncategorized';
    byCategory[cat] = (byCategory[cat] || 0) + amount;
  });

  // Recent expenses: sort by date desc, then by time desc (if present), limit 5
  const recentExpenses = [...expenses]
    .sort((a, b) => {
      const dateA = a.date + (a.time ? 'T' + a.time : '');
      const dateB = b.date + (b.time ? 'T' + b.time : '');
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  return {
    todayTotal,
    currentWeekTotal,
    currentMonthTotal,
    lifetimeTotal,
    byCategory,
    recentExpenses
  };
};

export const getCategoryBreakdown = (expenses: Expense[] = []) => {
  const summary = getExpenseAnalytics(expenses);

  return Object.entries(summary.byCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total);
};
