import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, X } from 'lucide-react';
import type { Task } from '../../../types';
import { taskFormSchema, type TaskFormValues } from '../taskSchema';

interface AddTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTask: (task: Task) => void;
}

const defaultValues: TaskFormValues = {
  title: '',
  description: '',
  status: 'Not Started',
  priority: 'Medium',
  dueDate: '',
  tags: ''
};

export default function AddTaskForm({ isOpen, onClose, onSubmitTask }: AddTaskFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset]);

  const submitHandler = handleSubmit((values) => {
    const trimmedTags = values.tags
      ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

    const task: Task = {
      id: crypto.randomUUID(),
      title: values.title.trim(),
      description: values.description?.trim() || '',
      status: values.status?.trim() || 'Not Started',
      priority: values.priority?.trim() || 'Medium',
      dueDate: values.dueDate?.trim() || '',
      completedDate: '',
      reminder: '',
      tags: trimmedTags.join(', ')
    };

    onSubmitTask(task);
    reset(defaultValues);
    onClose();
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="add-task-title" className="w-full max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="add-task-title" className="text-xl font-semibold text-brand-text">Add task</h2>
            <p className="mt-1 text-sm text-brand-text-muted">Create a workbook task that will be saved with your next Excel export.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close add task form">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={submitHandler}>
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-brand-text">Title</label>
            <input id="task-title" {...register('title')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Write the task title" />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-brand-text">Description</label>
            <textarea id="task-description" rows={4} {...register('description')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Optional details" />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-brand-text">Status</label>
              <select id="task-status" {...register('status')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20">
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-brand-text">Priority</label>
              <select id="task-priority" {...register('priority')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-dueDate" className="block text-sm font-medium text-brand-text">Due date</label>
              <input id="task-dueDate" type="date" {...register('dueDate')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
            </div>

            <div>
              <label htmlFor="task-tags" className="block text-sm font-medium text-brand-text">Tags</label>
              <input id="task-tags" {...register('tags')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Planning, Home, Errand" />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90 disabled:cursor-not-allowed disabled:opacity-60">
              <PlusCircle className="h-4 w-4" />
              Add task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}