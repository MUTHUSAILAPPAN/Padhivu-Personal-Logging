import type { Expense, Task, Memory, ModuleEntry, CustomModule } from '../../types';
import { format } from 'date-fns';
import { formatCurrency } from './expenseAnalytics';

export interface ActivityItem {
  id: string;
  type: 'Expense' | 'Task' | 'Memory' | 'ModuleEntry';
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  time?: string;
}

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getTodayLabel = (): string => {
  return format(new Date(), 'EEEE, MMMM d, yyyy');
};

export const getRecentActivity = (
  expenses: Expense[] = [],
  tasks: Task[] = [],
  memories: Memory[] = [],
  entries: ModuleEntry[] = [],
  modules: CustomModule[] = [],
  currency: string = 'USD'
): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  const moduleNameMap = new Map(modules.map((m) => [m.id, m.name]));

  // 1. Add Expenses (limit to 10 for performance before sort)
  expenses.slice(0, 15).forEach((e) => {
    activities.push({
      id: e.id,
      type: 'Expense',
      title: `${e.category || 'Expense'}`,
      subtitle: `${e.description ? e.description + ' — ' : ''}${formatCurrency(e.amount, currency)}`,
      date: e.date,
      time: e.time
    });
  });

  // 2. Add Tasks
  tasks.slice(0, 15).forEach((t) => {
    activities.push({
      id: t.id,
      type: 'Task',
      title: `${t.title}`,
      subtitle: `Status: ${t.status} | Priority: ${t.priority}`,
      date: t.dueDate || t.completedDate || '2000-01-01'
    });
  });

  // 3. Add Memories
  memories.slice(0, 15).forEach((m) => {
    activities.push({
      id: m.id,
      type: 'Memory',
      title: `${m.title}`,
      subtitle: `${m.mood ? 'Mood: ' + m.mood : ''}${m.location ? ' at ' + m.location : ''}`,
      date: m.date
    });
  });

  // 4. Add Module Entries
  entries.slice(0, 15).forEach((entry) => {
    const modName = moduleNameMap.get(entry.moduleId) || 'Custom Module';
    activities.push({
      id: entry.id,
      type: 'ModuleEntry',
      title: `${modName} Entry`,
      subtitle: `Logged updates on fields`,
      date: entry.date
    });
  });

  // Sort: date desc, time desc
  return activities
    .sort((a, b) => {
      const dateA = a.date + (a.time ? 'T' + a.time : 'T00:00:00');
      const dateB = b.date + (b.time ? 'T' + b.time : 'T00:00:00');
      return dateB.localeCompare(dateA);
    })
    .slice(0, 10); // Final limit 10 items
};
