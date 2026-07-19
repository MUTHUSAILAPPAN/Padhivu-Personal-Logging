import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { z } from 'zod';
import type { Collection } from '../../../types';

const collectionFormSchema = z.object({
  type: z.string().trim().min(1, 'Type is required.').max(80, 'Type must be 80 characters or fewer.'),
  title: z.string().trim().min(1, 'Title is required.').max(150, 'Title must be 150 characters or fewer.'),
  creator: z.string().trim().max(150, 'Creator must be 150 characters or fewer.').default(''),
  rating: z.string().trim().optional().or(z.literal('')),
  status: z.string().trim().max(80, 'Status must be 80 characters or fewer.').default(''),
  notes: z.string().trim().max(2000, 'Notes must be 2,000 characters or fewer.').default(''),
  tags: z.string().trim().default('')
}).superRefine((values, context) => {
  if (!values.rating) {
    return;
  }

  const parsed = Number(values.rating);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rating must be a number from 1 to 5.',
      path: ['rating']
    });
  }
});

type CollectionFormValues = z.input<typeof collectionFormSchema>;

interface CollectionFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  collection?: Collection | null;
  onClose: () => void;
  onSubmitCollection: (collection: Collection) => void;
}

const normalizeTags = (value: string): string => {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(', ');
};

const defaultValues = (): CollectionFormValues => ({
  type: '',
  title: '',
  creator: '',
  rating: '',
  status: '',
  notes: '',
  tags: ''
});

export default function CollectionForm({ isOpen, mode, collection, onClose, onSubmitCollection }: CollectionFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: defaultValues()
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'edit' && collection) {
      reset({
        type: collection.type || '',
        title: collection.title || '',
        creator: collection.creator || '',
        rating: collection.rating === undefined || collection.rating === null ? '' : String(collection.rating),
        status: collection.status || '',
        notes: collection.notes || '',
        tags: collection.tags || ''
      });
      return;
    }

    reset(defaultValues());
  }, [collection, isOpen, mode, reset]);

  const submitHandler = handleSubmit((values) => {
    const nextCollection: Collection = {
      id: collection?.id ?? crypto.randomUUID(),
      type: values.type.trim(),
      title: values.title.trim(),
      creator: values.creator?.trim() || '',
      rating: values.rating === undefined || values.rating === '' ? 0 : Number(values.rating),
      status: values.status?.trim() || '',
      notes: values.notes?.trim() || '',
      tags: normalizeTags(values.tags ?? '')
    };

    onSubmitCollection(nextCollection);
    reset(defaultValues());
    onClose();
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="collection-form-title" className="w-full max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="collection-form-title" className="text-xl font-semibold text-brand-text">{mode === 'edit' ? 'Edit item' : 'Add item'}</h2>
            <p className="mt-1 text-sm text-brand-text-muted">Capture a collection item that stays inside your workbook.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close collection form">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={submitHandler}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="collection-type" className="block text-sm font-medium text-brand-text">Type</label>
              <input id="collection-type" {...register('type')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Book" />
              {errors.type ? <p className="mt-1 text-xs text-rose-600">{errors.type.message}</p> : null}
            </div>
            <div>
              <label htmlFor="collection-title" className="block text-sm font-medium text-brand-text">Title</label>
              <input id="collection-title" {...register('title')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Quiet Town" />
              {errors.title ? <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="collection-creator" className="block text-sm font-medium text-brand-text">Creator</label>
              <input id="collection-creator" {...register('creator')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Author or artist" />
              {errors.creator ? <p className="mt-1 text-xs text-rose-600">{errors.creator.message}</p> : null}
            </div>
            <div>
              <label htmlFor="collection-rating" className="block text-sm font-medium text-brand-text">Rating</label>
              <input id="collection-rating" type="number" min="1" max="5" step="1" {...register('rating')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="1-5" />
              {errors.rating ? <p className="mt-1 text-xs text-rose-600">{errors.rating.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="collection-status" className="block text-sm font-medium text-brand-text">Status</label>
              <input id="collection-status" {...register('status')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Reading" />
              {errors.status ? <p className="mt-1 text-xs text-rose-600">{errors.status.message}</p> : null}
            </div>
            <div>
              <label htmlFor="collection-tags" className="block text-sm font-medium text-brand-text">Tags</label>
              <input id="collection-tags" {...register('tags')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Books, Fiction" />
              {errors.tags ? <p className="mt-1 text-xs text-rose-600">{errors.tags.message}</p> : null}
            </div>
          </div>

          <div>
            <label htmlFor="collection-notes" className="block text-sm font-medium text-brand-text">Notes</label>
            <textarea id="collection-notes" rows={4} {...register('notes')} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Optional notes" />
            {errors.notes ? <p className="mt-1 text-xs text-rose-600">{errors.notes.message}</p> : null}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus className="h-4 w-4" />
              {mode === 'edit' ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
