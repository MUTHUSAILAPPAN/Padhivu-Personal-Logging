import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Pencil, Plus, X } from 'lucide-react';
import { z } from 'zod';
import type { Memory } from '../../../types';
import { getLocalDateString, isValidIsoDate } from '../../../utils';

const isoDateSchema = z
  .string()
  .trim()
  .min(1, 'Date is required.')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid ISO date such as YYYY-MM-DD.')
  .refine((value) => isValidIsoDate(value), 'Enter a valid calendar date.');

export const memoryFormSchema = z.object({
  date: isoDateSchema,
  title: z.string().trim().min(1, 'Title is required.').max(150, 'Title must be 150 characters or fewer.'),
  category: z.string().trim().max(80, 'Category must be 80 characters or fewer.').default(''),
  description: z.string().trim().max(2000, 'Description must be 2,000 characters or fewer.').default(''),
  location: z.string().trim().max(150, 'Location must be 150 characters or fewer.').default(''),
  mood: z.string().trim().max(50, 'Mood must be 50 characters or fewer.').default(''),
  favorite: z.boolean().default(false),
  tags: z.string().trim().default('')
});

export type MemoryFormValues = z.input<typeof memoryFormSchema>;

interface MemoryFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  memory?: Memory | null;
  onClose: () => void;
  onSubmitMemory: (memory: Memory) => void;
}

const getToday = () => getLocalDateString();

const defaultValues = (date: string = getToday()): MemoryFormValues => ({
  date,
  title: '',
  category: '',
  description: '',
  location: '',
  mood: '',
  favorite: false,
  tags: ''
});

const normalizeTags = (value: string): string => {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(', ');
};

export default function MemoryForm({ isOpen, mode, memory, onClose, onSubmitMemory }: MemoryFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MemoryFormValues>({
    resolver: zodResolver(memoryFormSchema),
    defaultValues: defaultValues()
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'edit' && memory) {
      reset({
        date: memory.date || getToday(),
        title: memory.title || '',
        category: memory.category || '',
        description: memory.description || '',
        location: memory.location || '',
        mood: memory.mood || '',
        favorite: Boolean(memory.favorite),
        tags: memory.tags || ''
      });
      return;
    }

    reset(defaultValues(getToday()));
  }, [isOpen, memory, mode, reset]);

  const submitHandler = handleSubmit((values) => {
    const nextMemory: Memory = {
      id: memory?.id ?? crypto.randomUUID(),
      date: values.date.trim(),
      title: values.title.trim(),
      category: values.category?.trim() || '',
      description: values.description?.trim() || '',
      location: values.location?.trim() || '',
      mood: values.mood?.trim() || '',
      favorite: Boolean(values.favorite),
      tags: normalizeTags(values.tags ?? '')
    };

    onSubmitMemory(nextMemory);
    reset(defaultValues(getToday()));
    onClose();
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="memory-form-title" className="w-full max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="memory-form-title" className="text-xl font-semibold text-brand-text">{mode === 'edit' ? 'Edit memory' : 'Add memory'}</h2>
            <p className="mt-1 text-sm text-brand-text-muted">
              {mode === 'edit' ? 'Update this saved memory in your workbook.' : 'Capture a new memory without leaving the local-first flow.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close memory form">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={submitHandler}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="memory-date" className="block text-sm font-medium text-brand-text">Date</label>
              <input id="memory-date" type="date" {...register('date')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
              {errors.date ? <p className="mt-1 text-xs text-rose-600">{errors.date.message}</p> : null}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
              <input id="memory-favorite" type="checkbox" {...register('favorite')} className="h-4 w-4 rounded border-brand-border text-brand-emerald" />
              <label htmlFor="memory-favorite" className="flex items-center gap-2 text-sm font-medium text-brand-text">
                <Heart className="h-4 w-4 text-amber-600" />
                Mark as favorite
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="memory-title" className="block text-sm font-medium text-brand-text">Title</label>
            <input id="memory-title" {...register('title')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Sunset walk" />
            {errors.title ? <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="memory-category" className="block text-sm font-medium text-brand-text">Category</label>
              <input id="memory-category" {...register('category')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Travel" />
              {errors.category ? <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p> : null}
            </div>
            <div>
              <label htmlFor="memory-mood" className="block text-sm font-medium text-brand-text">Mood</label>
              <input id="memory-mood" {...register('mood')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Reflective" />
              {errors.mood ? <p className="mt-1 text-xs text-rose-600">{errors.mood.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="memory-location" className="block text-sm font-medium text-brand-text">Location</label>
              <input id="memory-location" {...register('location')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Oak Street" />
              {errors.location ? <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p> : null}
            </div>
            <div>
              <label htmlFor="memory-tags" className="block text-sm font-medium text-brand-text">Tags</label>
              <input id="memory-tags" {...register('tags')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Travel, Evening" />
              {errors.tags ? <p className="mt-1 text-xs text-rose-600">{errors.tags.message}</p> : null}
            </div>
          </div>

          <div>
            <label htmlFor="memory-description" className="block text-sm font-medium text-brand-text">Description</label>
            <textarea id="memory-description" rows={4} {...register('description')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="What made this moment memorable?" />
            {errors.description ? <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p> : null}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90 disabled:cursor-not-allowed disabled:opacity-60">
              {mode === 'edit' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {mode === 'edit' ? 'Save changes' : 'Add memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
