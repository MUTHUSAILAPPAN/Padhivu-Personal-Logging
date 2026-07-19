import { useMemo, useState } from 'react';
import { ArrowLeft, FolderOpen, Plus, Sparkles, Trash2 } from 'lucide-react';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { useWorkbook } from '../../hooks/useWorkbook';
import type { Collection } from '../../types';
import CollectionForm from './components/CollectionForm';

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

export default function CollectionsPage() {
  const { workbookData, addRecord, updateRecord, deleteRecord } = useWorkbook();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  const collections = useMemo(() => {
    return [...(workbookData?.collections ?? [])].sort((left, right) => {
      const titleCompare = left.title.localeCompare(right.title, undefined, { sensitivity: 'base' });
      return titleCompare !== 0 ? titleCompare : left.type.localeCompare(right.type, undefined, { sensitivity: 'base' });
    });
  }, [workbookData?.collections]);

  const handleCreateOrEdit = (collection: Collection) => {
    if (editingCollection) {
      updateRecord('collections', collection.id, collection);
      setEditingCollection(null);
      return;
    }

    addRecord('collections', collection);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }

    deleteRecord('collections', deleteTarget.id);
    setDeleteTarget(null);
  };

  if (!workbookData) {
    return (
      <WorkbookEmptyState
        icon={FolderOpen}
        title="No workbook loaded"
        description="Collections live inside your local Excel workbook. Import or open a workbook first to start organizing your catalogue."
        primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workbook collections"
        title="Collections"
        description="Keep a calm catalogue of books, films, routines, and other curated lists stored locally in your workbook."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingCollection(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            <Plus className="h-4 w-4" />
            Add item
          </button>
        }
      />

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-4 shadow-subtle sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Collection library</h2>
            <p className="mt-1 text-sm text-brand-text-muted">{collections.length} item{collections.length === 1 ? '' : 's'} in this workbook.</p>
          </div>
        </div>

        {collections.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-brand-border bg-brand-bg p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-text">No collection items yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">Add your first collection item to build a tidy local catalogue.</p>
            <button
              type="button"
              onClick={() => {
                setEditingCollection(null);
                setIsFormOpen(true);
              }}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {collections.map((collection) => {
              const tags = parseTags(collection.tags);
              return (
                <article key={collection.id} className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-brand-text">{collection.title}</h3>
                        {collection.type ? <span className="rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-brand-text-muted">{collection.type}</span> : null}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-brand-text-muted">
                        {collection.creator ? <span>Creator: {collection.creator}</span> : null}
                        {collection.rating ? <span>Rating: {collection.rating}/5</span> : null}
                        {collection.status ? <span>Status: {collection.status}</span> : null}
                      </div>
                      {collection.notes ? <p className="max-w-2xl text-sm leading-relaxed text-brand-text-muted">{collection.notes}</p> : null}
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
                          setEditingCollection(collection);
                          setIsFormOpen(true);
                        }}
                        className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(collection)}
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

      <CollectionForm
        isOpen={isFormOpen}
        mode={editingCollection ? 'edit' : 'create'}
        collection={editingCollection}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCollection(null);
        }}
        onSubmitCollection={(collection) => {
          handleCreateOrEdit(collection);
        }}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-collection-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="delete-collection-title" className="text-xl font-semibold text-brand-text">Delete item</h2>
                <p className="mt-1 text-sm text-brand-text-muted">
                  Delete <span className="font-medium text-brand-text">{deleteTarget.title}</span> from <span className="font-medium text-brand-text">{deleteTarget.type}</span>?
                </p>
              </div>
              <button type="button" onClick={() => setDeleteTarget(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close delete collection dialog">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                <Trash2 className="h-4 w-4" />
                Delete item
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
