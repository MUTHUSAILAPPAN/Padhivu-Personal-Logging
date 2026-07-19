import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { TaskFormValues } from '../taskSchema';

interface TaskFormFieldsProps {
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
  prefix: string;
}

export default function TaskFormFields({ register, errors, prefix }: TaskFormFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor={`${prefix}-title`} className="block text-sm font-medium text-brand-text">Title</label>
        <input id={`${prefix}-title`} {...register('title')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Write the task title" />
        {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor={`${prefix}-description`} className="block text-sm font-medium text-brand-text">Description</label>
        <textarea id={`${prefix}-description`} rows={4} {...register('description')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Optional details" />
        {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-status`} className="block text-sm font-medium text-brand-text">Status</label>
          <select id={`${prefix}-status`} {...register('status')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20">
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${prefix}-priority`} className="block text-sm font-medium text-brand-text">Priority</label>
          <select id={`${prefix}-priority`} {...register('priority')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-dueDate`} className="block text-sm font-medium text-brand-text">Due date</label>
          <input id={`${prefix}-dueDate`} type="date" {...register('dueDate')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
        </div>

        <div>
          <label htmlFor={`${prefix}-tags`} className="block text-sm font-medium text-brand-text">Tags</label>
          <input id={`${prefix}-tags`} {...register('tags')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Planning, Home, Errand" />
        </div>
      </div>
    </>
  );
}