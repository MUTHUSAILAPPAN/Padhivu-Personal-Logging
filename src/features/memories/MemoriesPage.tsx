import { useMemo, useState } from 'react';
import { ArrowLeft, Heart, Plus, Sparkles, Trash2 } from 'lucide-react';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { useWorkbook } from '../../hooks/useWorkbook';
import type { Memory } from '../../types';
import MemoryForm from './components/MemoryForm';

const parseTags = (value: string | string[] | null | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

export default function MemoriesPage() {
  const { workbookData, addRecord, updateRecord, deleteRecord } = useWorkbook();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Memory | null>(null);

  const memories = useMemo(() => {
    return [...(workbookData?.memories ?? [])].sort((left, right) => right.date.localeCompare(left.date));
  }, [workbookData?.memories]);

  const handleCreateOrEdit = (memory: Memory) => {
    if (editingMemory) {
      updateRecord('memories', memory.id, memory);
      setEditingMemory(null);
      return;
    }

    addRecord('memories', memory);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }

    deleteRecord('memories', deleteTarget.id);
    setDeleteTarget(null);
  };

  if (!workbookData) {
    return (
      <WorkbookEmptyState
        icon={Heart}
        title="No workbook loaded"
        description="Memories live inside your local Excel workbook. Import or open a workbook first to start collecting reflections and highlights."
        primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workbook memories"
        title="Memories"
        description="Capture personal moments, gratitude notes, travel highlights, and other reflections that stay inside your workbook."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingMemory(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            <Plus className="h-4 w-4" />
            Add memory
          </button>
        }
      />

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-4 shadow-subtle sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Memory timeline</h2>
            <p className="mt-1 text-sm text-brand-text-muted">{memories.length} memor{memories.length === 1 ? 'y' : 'ies'} saved in this workbook.</p>
          </div>
          <div className="rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-sm text-brand-text-muted">
            Newest first
          </div>
        </div>

        {memories.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-brand-border bg-brand-bg p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-text">No memories yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
              Add the first memory to save a gentle snapshot of a moment, lesson, or gratitude note.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingMemory(null);
                setIsFormOpen(true);
              }}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
            >
              <Plus className="h-4 w-4" />
              Add memory
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {memories.map((memory) => {
              const tags = parseTags(memory.tags);
              return (
                <article key={memory.id} className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-brand-text">{memory.title}</h3>
                        {memory.favorite ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                            <Heart className="h-3.5 w-3.5 fill-current" />
                            Favorite
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-brand-text-muted">
                        <span className="font-medium text-brand-text">{memory.date}</span>
                        {memory.category ? <span>· {memory.category}</span> : null}
                        {memory.location ? <span>· {memory.location}</span> : null}
                        {memory.mood ? <span>· {memory.mood}</span> : null}
                      </div>
                      {memory.description ? <p className="max-w-2xl text-sm leading-relaxed text-brand-text-muted">{memory.description}</p> : null}
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-xs font-medium text-brand-text-muted">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMemory(memory);
                          setIsFormOpen(true);
                        }}
                        className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(memory)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <MemoryForm
        isOpen={isFormOpen}
        mode={editingMemory ? 'edit' : 'create'}
        memory={editingMemory}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMemory(null);
        }}
        onSubmitMemory={(memory) => {
          handleCreateOrEdit(memory);
        }}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-memory-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="delete-memory-title" className="text-xl font-semibold text-brand-text">Delete memory</h2>
                <p className="mt-1 text-sm text-brand-text-muted">
                  Delete <span className="font-medium text-brand-text">{deleteTarget.title}</span> from <span className="font-medium text-brand-text">{deleteTarget.date}</span>?
                </p>
              </div>
              <button type="button" onClick={() => setDeleteTarget(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close delete memory dialog">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                <Trash2 className="h-4 w-4" />
                Delete memory
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
