import type { Task } from '../../types';
import { parseISO, isBefore, startOfDay, isAfter, isSameDay } from 'date-fns';

export interface TaskSummary {
  totalCount: number;
  countByStatus: Record<string, number>;
  completedCount: number;
  completionRate: number; // 0 to 100
  overdueTasks: Task[];
  upcomingTasks: Task[];
  highPriorityOpenTasks: Task[];
}

export const getTaskAnalytics = (tasks: Task[] = []): TaskSummary => {
  const totalCount = tasks.length;
  const countByStatus: Record<string, number> = {};
  let completedCount = 0;
  const overdueTasks: Task[] = [];
  const upcomingTasks: Task[] = [];
  const highPriorityOpenTasks: Task[] = [];

  const todayStart = startOfDay(new Date());

  tasks.forEach((task) => {
    const status = (task.status || 'todo').trim().toLowerCase();
    const priority = (task.priority || 'low').trim().toLowerCase();
    
    // Group count
    countByStatus[status] = (countByStatus[status] || 0) + 1;

    const isCompleted = status === 'completed';
    if (isCompleted) {
      completedCount++;
    }

    // High Priority Open Tasks
    if (!isCompleted && priority === 'high') {
      highPriorityOpenTasks.push(task);
    }

    // Date calculations
    if (task.dueDate && !isCompleted) {
      try {
        const due = parseISO(task.dueDate);
        if (!isNaN(due.getTime())) {
          if (isBefore(due, todayStart)) {
            overdueTasks.push(task);
          } else if (isAfter(due, todayStart) || isSameDay(due, todayStart)) {
            upcomingTasks.push(task);
          }
        }
      } catch {
        // Skip invalid date
      }
    }
  });

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    totalCount,
    countByStatus,
    completedCount,
    completionRate,
    overdueTasks,
    upcomingTasks,
    highPriorityOpenTasks
  };
};
