import type { Task } from '../../../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  overdueTaskIds: Set<string>;
  onToggleComplete: (task: Task) => void;
}

export default function TaskList({ tasks, overdueTaskIds, onToggleComplete }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} overdue={overdueTaskIds.has(task.id)} onToggleComplete={onToggleComplete} />
      ))}
    </div>
  );
}