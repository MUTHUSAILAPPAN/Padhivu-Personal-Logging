import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
import type { Task } from '../../../types';
import { taskFormSchema, type TaskFormValues } from '../taskSchema';
import TaskFormFields from './TaskFormFields';

interface EditTaskFormProps {
  task: Task | null;
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

const isCompletedStatus = (status: string): boolean => status.trim().toLowerCase() === 'completed';
const openStatusValue = 'Not Started';
const completedStatusValue = 'Completed';

export default function EditTaskForm({ task, isOpen, onClose, onSubmitTask }: EditTaskFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (isOpen && task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status || openStatusValue,
        priority: task.priority || 'Medium',
        dueDate: task.dueDate || '',
        tags: task.tags || ''
      });
    }
  }, [isOpen, task, reset]);

  const submitHandler = handleSubmit((values) => {
    if (!task) {
      return;
    }

    const normalizedStatus = values.status?.trim() || openStatusValue;
    const nextStatus = normalizedStatus === completedStatusValue ? completedStatusValue : values.status?.trim() || openStatusValue;
    const wasCompleted = isCompletedStatus(task.status || openStatusValue);
    const isNowCompleted = isCompletedStatus(nextStatus);
    const preservedCompletedDate = task.completedDate || '';
    const nextCompletedDate = isNowCompleted
      ? preservedCompletedDate || new Date().toISOString().slice(0, 10)
      : '';

    const trimmedTags = values.tags
      ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

    const updatedTask: Task = {
      ...task,
      title: values.title.trim(),
      description: values.description?.trim() || '',
      status: nextStatus,
      priority: values.priority?.trim() || 'Medium',
      dueDate: values.dueDate?.trim() || '',
      completedDate: wasCompleted && !isNowCompleted
        ? ''
        : isNowCompleted
          ? nextCompletedDate
          : preservedCompletedDate,
      reminder: task.reminder,
      tags: trimmedTags.join(', ')
    };

    onSubmitTask(updatedTask);
    reset(defaultValues);
    onClose();
  });

  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="edit-task-title" className="w-full max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="edit-task-title" className="text-xl font-semibold text-brand-text">Edit task</h2>
            <p className="mt-1 text-sm text-brand-text-muted">Update the workbook task without changing its ID or reminder fields.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close edit task form">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={submitHandler}>
          <TaskFormFields register={register} errors={errors} prefix="edit-task" />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90 disabled:cursor-not-allowed disabled:opacity-60">
              <Pencil className="h-4 w-4" />
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}