import type { Task } from '../../../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  overdueTaskIds: Set<string>;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskList({ tasks, overdueTaskIds, onToggleComplete, onEdit, onDelete }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          overdue={overdueTaskIds.has(task.id)}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}