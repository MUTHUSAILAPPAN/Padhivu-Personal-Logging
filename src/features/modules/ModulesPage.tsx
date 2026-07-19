import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Circle,
  Layers3,
  NotebookPen,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { useWorkbook } from '../../hooks/useWorkbook';
import type { CustomModule, FieldType, ModuleEntry, ModuleField } from '../../types';

type ModuleFormValues = {
  name: string;
  icon: string;
  color: string;
};

type FieldFormValues = {
  fieldName: string;
  fieldType: FieldType;
  required: boolean;
  options: string;
};

type EntryFormValues = {
  date: string;
  values: Record<string, string | number | boolean | null>;
};

const fieldTypeOptions: FieldType[] = ['Text', 'LongText', 'Number', 'Date', 'Time', 'Boolean', 'Dropdown', 'Rating'];
const defaultModuleValues: ModuleFormValues = {
  name: '',
  icon: '',
  color: ''
};

const defaultFieldValues = (fieldType: FieldType = 'Text'): FieldFormValues => ({
  fieldName: '',
  fieldType,
  required: false,
  options: ''
});

const getDefaultEntryValue = (field: ModuleField): string | number | boolean | null => {
  if (field.fieldType === 'Boolean') {
    return false;
  }

  if (field.fieldType === 'Number' || field.fieldType === 'Rating') {
    return '';
  }

  return '';
};

const getDefaultEntryState = (fields: ModuleField[]): Record<string, string | number | boolean | null> => {
  return fields.reduce<Record<string, string | number | boolean | null>>((accumulator, field) => {
    accumulator[field.id] = getDefaultEntryValue(field);
    return accumulator;
  }, {});
};

const getDisplayValue = (value: unknown, field: ModuleField): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (field.fieldType === 'Boolean') {
    return value ? 'Yes' : 'No';
  }

  if (field.fieldType === 'Number' || field.fieldType === 'Rating') {
    return String(value);
  }

  if (field.fieldType === 'Dropdown' && Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
};

const parseFieldOptions = (input: string): string[] => {
  return input
    .split(/\n|,/)
    .map((option) => option.trim())
    .filter(Boolean);
};

const getToday = () => new Date().toISOString().slice(0, 10);

export default function ModulesPage() {
  const { workbookData, addRecord, updateRecord, deleteRecord } = useWorkbook();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [moduleDraft, setModuleDraft] = useState<ModuleFormValues>(defaultModuleValues);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ModuleField | null>(null);
  const [fieldDraft, setFieldDraft] = useState<FieldFormValues>(defaultFieldValues());
  const [deleteFieldTarget, setDeleteFieldTarget] = useState<ModuleField | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ModuleEntry | null>(null);
  const [entryDraft, setEntryDraft] = useState<EntryFormValues>({ date: getToday(), values: {} });
  const [deleteEntryTarget, setDeleteEntryTarget] = useState<ModuleEntry | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);

  const modules = workbookData?.customModules ?? [];
  const fields = workbookData?.moduleFields ?? [];
  const entries = workbookData?.moduleEntries ?? [];

  useEffect(() => {
    if (!workbookData) {
      setSelectedModuleId(null);
      return;
    }

    if (!modules.length) {
      setSelectedModuleId(null);
      return;
    }

    if (!selectedModuleId || !modules.some((module) => module.id === selectedModuleId)) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId, workbookData]);

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) ?? null,
    [modules, selectedModuleId]
  );

  const selectedFields = useMemo(() => {
    return fields
      .filter((field) => field.moduleId === selectedModule?.id)
      .sort((left, right) => left.displayOrder - right.displayOrder || left.fieldName.localeCompare(right.fieldName));
  }, [fields, selectedModule?.id]);

  const selectedEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.moduleId === selectedModule?.id)
      .sort((left, right) => right.date.localeCompare(left.date));
  }, [entries, selectedModule?.id]);

  const openModuleCreate = () => {
    setModuleDraft(defaultModuleValues);
    setIsCreateOpen(true);
  };

  const handleCreateModule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = moduleDraft.name.trim();
    if (!normalizedName) {
      return;
    }

    const module: CustomModule = {
      id: crypto.randomUUID(),
      name: normalizedName,
      icon: moduleDraft.icon.trim() || '🧩',
      color: moduleDraft.color.trim() || '#10b981',
      displayOrder: modules.length
    };

    addRecord('customModules', module);
    setIsCreateOpen(false);
    setSelectedModuleId(module.id);
    setModuleDraft(defaultModuleValues);
  };

  const openFieldModal = (field?: ModuleField) => {
    if (field) {
      setEditingField(field);
      setFieldDraft({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        required: field.required,
        options: field.options.join('\n')
      });
    } else {
      setEditingField(null);
      setFieldDraft(defaultFieldValues('Text'));
    }

    setFieldError(null);
    setIsFieldModalOpen(true);
  };

  const handleFieldSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedModule) {
      return;
    }

    const trimmedName = fieldDraft.fieldName.trim();
    const normalizedOptions = parseFieldOptions(fieldDraft.options);

    if (!trimmedName) {
      setFieldError('Field name is required.');
      return;
    }

    if (fieldDraft.fieldType === 'Dropdown' && normalizedOptions.length === 0) {
      setFieldError('Dropdown fields need at least one option.');
      return;
    }

    if (editingField) {
      updateRecord('moduleFields', editingField.id, {
        moduleId: selectedModule.id,
        fieldName: trimmedName,
        fieldType: fieldDraft.fieldType,
        required: fieldDraft.required,
        options: normalizedOptions,
        displayOrder: editingField.displayOrder
      });
    } else {
      addRecord('moduleFields', {
        id: crypto.randomUUID(),
        moduleId: selectedModule.id,
        fieldName: trimmedName,
        fieldType: fieldDraft.fieldType,
        required: fieldDraft.required,
        options: normalizedOptions,
        displayOrder: selectedFields.length > 0 ? Math.max(...selectedFields.map((field) => field.displayOrder)) + 1 : 1
      });
    }

    setIsFieldModalOpen(false);
    setEditingField(null);
    setFieldDraft(defaultFieldValues('Text'));
    setFieldError(null);
  };

  const moveField = (field: ModuleField, direction: 'up' | 'down') => {
    if (!selectedModule) {
      return;
    }

    const sortedFields = [...selectedFields].sort((left, right) => left.displayOrder - right.displayOrder || left.fieldName.localeCompare(right.fieldName));
    const index = sortedFields.findIndex((candidate) => candidate.id === field.id);

    if (index === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const targetField = sortedFields[targetIndex];

    if (!targetField) {
      return;
    }

    updateRecord('moduleFields', field.id, { displayOrder: targetField.displayOrder });
    updateRecord('moduleFields', targetField.id, { displayOrder: field.displayOrder });
  };

  const confirmFieldDelete = (field: ModuleField) => {
    const hasStoredValues = entries.some((entry) => {
      if (entry.moduleId !== selectedModule?.id) {
        return false;
      }

      const value = entry.data[field.id];
      return value !== undefined && value !== null && value !== '';
    });

    if (hasStoredValues) {
      setDeleteFieldTarget(field);
      return;
    }

    deleteRecord('moduleFields', field.id);
  };

  const handleFieldDeleteConfirm = () => {
    if (!deleteFieldTarget) {
      return;
    }

    deleteRecord('moduleFields', deleteFieldTarget.id);
    setDeleteFieldTarget(null);
  };

  const openEntryModal = (entry?: ModuleEntry) => {
    if (!selectedModule) {
      return;
    }

    if (entry) {
      setEditingEntry(entry);
      const values = selectedFields.reduce<Record<string, string | number | boolean | null>>((accumulator, field) => {
        accumulator[field.id] = field.id in (entry.data ?? {}) ? (entry.data[field.id] as string | number | boolean | null) : getDefaultEntryValue(field);
        return accumulator;
      }, {});
      setEntryDraft({ date: entry.date, values });
    } else {
      setEditingEntry(null);
      setEntryDraft({ date: getToday(), values: getDefaultEntryState(selectedFields) });
    }

    setEntryError(null);
    setIsEntryModalOpen(true);
  };

  const handleEntrySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedModule) {
      return;
    }

    const invalidField = selectedFields.find((field) => {
      if (!field.required) {
        return false;
      }

      const value = entryDraft.values[field.id];

      if (field.fieldType === 'Boolean') {
        return value === null || value === undefined;
      }

      if (field.fieldType === 'Number' || field.fieldType === 'Rating') {
        const numericValue = Number(value);
        return value === '' || value === null || value === undefined || !Number.isFinite(numericValue);
      }

      return value === '' || value === null || value === undefined;
    });

    if (invalidField) {
      setEntryError(`${invalidField.fieldName} is required.`);
      return;
    }

    const data = selectedFields.reduce<Record<string, unknown>>((accumulator, field) => {
      const value = entryDraft.values[field.id];
      if (field.fieldType === 'Number' || field.fieldType === 'Rating') {
        accumulator[field.id] = Number(value);
      } else if (field.fieldType === 'Boolean') {
        accumulator[field.id] = Boolean(value);
      } else {
        accumulator[field.id] = value ?? '';
      }
      return accumulator;
    }, {});

    if (editingEntry) {
      updateRecord('moduleEntries', editingEntry.id, {
        date: entryDraft.date,
        data
      });
    } else {
      addRecord('moduleEntries', {
        id: crypto.randomUUID(),
        moduleId: selectedModule.id,
        date: entryDraft.date,
        data
      });
    }

    setIsEntryModalOpen(false);
    setEditingEntry(null);
    setEntryDraft({ date: getToday(), values: getDefaultEntryState(selectedFields) });
    setEntryError(null);
  };

  const confirmEntryDelete = (entry: ModuleEntry) => {
    setDeleteEntryTarget(entry);
  };

  const handleEntryDeleteConfirm = () => {
    if (!deleteEntryTarget) {
      return;
    }

    deleteRecord('moduleEntries', deleteEntryTarget.id);
    setDeleteEntryTarget(null);
  };

  if (!workbookData) {
    return (
      <WorkbookEmptyState
        icon={Layers3}
        title="No workbook loaded"
        description="Custom modules belong to your local workbook. Import or open a workbook first to start designing a tailored module layout."
        primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workbook schema"
        title="Custom modules"
        description="Define tailored modules for gym routines, college plans, reading logs, health habits, or anything else your workbook needs to track."
        actions={
          <button
            type="button"
            onClick={openModuleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
          >
            <Plus className="h-4 w-4" />
            Create module
          </button>
        }
      />

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-6 shadow-subtle">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-brand-text">Module library</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-text-muted">
              Modules can track routines, coursework, reading goals, health habits, and other personal systems. Every module can have its own fields and entries.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-text-muted">
            Empty state tip: start with a simple module like Gym, College, Reading, or Health.
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-brand-border bg-brand-bg p-8 text-center shadow-subtle">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-text">Create your first module</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
              Build a custom module to collect the exact information you care about, without exposing spreadsheet rows or raw workbook data in the UI.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {modules
              .slice()
              .sort((left, right) => left.displayOrder - right.displayOrder || left.name.localeCompare(right.name))
              .map((module) => {
                const moduleFields = fields.filter((field) => field.moduleId === module.id);
                const moduleEntries = entries.filter((entry) => entry.moduleId === module.id);
                const isSelected = module.id === selectedModuleId;

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setSelectedModuleId(module.id)}
                    className={`rounded-3xl border p-5 text-left transition-all ${isSelected ? 'border-brand-emerald bg-brand-emerald/10 shadow-soft' : 'border-brand-border bg-brand-bg hover:border-brand-emerald/40'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${module.color}18`, color: module.color || '#10b981' }}>
                          {module.icon || '🧩'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-brand-text">{module.name}</h3>
                          <p className="mt-1 text-sm text-brand-text-muted">{moduleFields.length} field{moduleFields.length === 1 ? '' : 's'} · {moduleEntries.length} entr{moduleEntries.length === 1 ? 'y' : 'ies'}</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-text-muted">
                        #{module.displayOrder + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </section>

      {selectedModule ? (
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-brand-border bg-brand-bg-card p-6 shadow-subtle">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/10 bg-brand-emerald/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-emerald">
                    <NotebookPen className="h-3.5 w-3.5" />
                    {selectedModule.name}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-brand-text">Fields</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
                    Add the schema your module needs, then collect entries that stay tied to those fields.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openFieldModal()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-border/60"
                  >
                    <Plus className="h-4 w-4" />
                    Add field
                  </button>
                  <button
                    type="button"
                    onClick={() => openEntryModal()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add entry
                  </button>
                </div>
              </div>

              {selectedFields.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-brand-border bg-brand-bg p-6 text-center">
                  <p className="text-sm leading-relaxed text-brand-text-muted">No fields yet. Add your first field to create the data shape for this module.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {selectedFields.map((field) => (
                    <div key={field.id} className="rounded-2xl border border-brand-border bg-brand-bg p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-brand-text">{field.fieldName}</p>
                          <p className="mt-1 text-sm text-brand-text-muted">
                            {field.fieldType} · {field.required ? 'Required' : 'Optional'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => moveField(field, 'up')} className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label={`Move ${field.fieldName} up`}>
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => moveField(field, 'down')} className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label={`Move ${field.fieldName} down`}>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => openFieldModal(field)} className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label={`Edit ${field.fieldName}`}>
                            <PencilLine className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => confirmFieldDelete(field)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-100" aria-label={`Delete ${field.fieldName}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {field.fieldType === 'Dropdown' && field.options.length > 0 ? (
                        <p className="mt-3 text-sm text-brand-text-muted">Options: {field.options.join(', ')}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-brand-border bg-brand-bg-card p-6 shadow-subtle">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-brand-text">Entries</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">Review the information collected for this module in a calmer, readable layout.</p>
                </div>
                <div className="rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-sm text-brand-text-muted">
                  {selectedEntries.length} entr{selectedEntries.length === 1 ? 'y' : 'ies'}
                </div>
              </div>

              {selectedEntries.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-brand-border bg-brand-bg p-6 text-center">
                  <p className="text-sm leading-relaxed text-brand-text-muted">No entries yet. Capture your first record to start building a useful history.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {selectedEntries.map((entry) => (
                    <article key={entry.id} className="rounded-2xl border border-brand-border bg-brand-bg p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-brand-text">{entry.date}</p>
                          <p className="mt-1 text-sm text-brand-text-muted">Captured inside {selectedModule.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openEntryModal(entry)} className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label={`Edit entry ${entry.date}`}>
                            <PencilLine className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => confirmEntryDelete(entry)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-100" aria-label={`Delete entry ${entry.date}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {selectedFields.map((field) => (
                          <div key={field.id} className="flex flex-col gap-1 rounded-xl border border-brand-border/70 bg-brand-bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-medium text-brand-text">{field.fieldName}</span>
                            <span className="text-sm text-brand-text-muted">{getDisplayValue(entry.data[field.id], field)}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-brand-border bg-brand-bg-card p-6 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
                <Circle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-text">{selectedModule.name}</h3>
                <p className="mt-1 text-sm text-brand-text-muted">{selectedFields.length} fields · {selectedEntries.length} entries</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 rounded-2xl border border-brand-border bg-brand-bg p-4 text-sm text-brand-text-muted">
              <div className="flex items-center justify-between gap-3">
                <span>Icon</span>
                <span className="font-semibold text-brand-text">{selectedModule.icon || '🧩'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Accent</span>
                <span className="font-semibold text-brand-text">{selectedModule.color || '#10b981'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Display order</span>
                <span className="font-semibold text-brand-text">#{selectedModule.displayOrder + 1}</span>
              </div>
            </div>
          </aside>
        </section>
      ) : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="create-module-title" className="w-full max-w-xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="create-module-title" className="text-xl font-semibold text-brand-text">Create module</h2>
                <p className="mt-1 text-sm text-brand-text-muted">Give the module a clear name and optional visual styling.</p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close create module dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleCreateModule}>
              <div>
                <label htmlFor="module-name" className="block text-sm font-medium text-brand-text">Name</label>
                <input id="module-name" value={moduleDraft.name} onChange={(event) => setModuleDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Gym plan" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="module-icon" className="block text-sm font-medium text-brand-text">Icon</label>
                  <input id="module-icon" value={moduleDraft.icon} onChange={(event) => setModuleDraft((current) => ({ ...current, icon: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="🧘" />
                </div>
                <div>
                  <label htmlFor="module-color" className="block text-sm font-medium text-brand-text">Color</label>
                  <input id="module-color" type="color" value={moduleDraft.color || '#10b981'} onChange={(event) => setModuleDraft((current) => ({ ...current, color: event.target.value }))} className="mt-1 h-12 w-full cursor-pointer rounded-2xl border border-brand-border bg-brand-bg p-1" />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90">
                  <Plus className="h-4 w-4" />
                  Create module
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isFieldModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="module-field-title" className="w-full max-w-xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="module-field-title" className="text-xl font-semibold text-brand-text">{editingField ? 'Edit field' : 'Add field'}</h2>
                <p className="mt-1 text-sm text-brand-text-muted">Choose the type and requirements for this module field.</p>
              </div>
              <button type="button" onClick={() => setIsFieldModalOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close field dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleFieldSubmit}>
              <div>
                <label htmlFor="field-name" className="block text-sm font-medium text-brand-text">Field name</label>
                <input id="field-name" value={fieldDraft.fieldName} onChange={(event) => setFieldDraft((current) => ({ ...current, fieldName: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Pages read" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="field-type" className="block text-sm font-medium text-brand-text">Field type</label>
                  <select id="field-type" value={fieldDraft.fieldType} onChange={(event) => setFieldDraft((current) => ({ ...current, fieldType: event.target.value as FieldType }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20">
                    {fieldTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
                  <input id="field-required" type="checkbox" checked={fieldDraft.required} onChange={(event) => setFieldDraft((current) => ({ ...current, required: event.target.checked }))} className="h-4 w-4 rounded border-brand-border text-brand-emerald" />
                  <label htmlFor="field-required" className="text-sm font-medium text-brand-text">Required field</label>
                </div>
              </div>

              {fieldDraft.fieldType === 'Dropdown' ? (
                <div>
                  <label htmlFor="field-options" className="block text-sm font-medium text-brand-text">Dropdown options</label>
                  <textarea id="field-options" rows={4} value={fieldDraft.options} onChange={(event) => setFieldDraft((current) => ({ ...current, options: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" placeholder="Option 1&#10;Option 2" />
                  <p className="mt-1 text-xs text-brand-text-muted">Enter one option per line or use commas.</p>
                </div>
              ) : null}

              {fieldError ? <p className="text-sm text-rose-600">{fieldError}</p> : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsFieldModalOpen(false)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90">
                  <Plus className="h-4 w-4" />
                  {editingField ? 'Save field' : 'Add field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteFieldTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-field-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="delete-field-title" className="text-xl font-semibold text-brand-text">Delete field</h2>
                <p className="mt-1 text-sm text-brand-text-muted">
                  Remove <span className="font-medium text-brand-text">{deleteFieldTarget.fieldName}</span> from this module’s schema?
                </p>
              </div>
              <button type="button" onClick={() => setDeleteFieldTarget(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close delete field dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Existing entries keep their values for backward safety if this field is removed.
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteFieldTarget(null)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
              <button type="button" onClick={handleFieldDeleteConfirm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                <Trash2 className="h-4 w-4" />
                Delete field
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isEntryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="module-entry-title" className="w-full max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="module-entry-title" className="text-xl font-semibold text-brand-text">{editingEntry ? 'Edit entry' : 'Add entry'}</h2>
                <p className="mt-1 text-sm text-brand-text-muted">Capture a record for this module using the fields you configured.</p>
              </div>
              <button type="button" onClick={() => setIsEntryModalOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close entry dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleEntrySubmit}>
              <div>
                <label htmlFor="entry-date" className="block text-sm font-medium text-brand-text">Date</label>
                <input id="entry-date" type="date" value={entryDraft.date} onChange={(event) => setEntryDraft((current) => ({ ...current, date: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
              </div>

              {selectedFields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg p-4 text-sm text-brand-text-muted">Add a field first to build the entry form for this module.</div>
              ) : (
                <div className="space-y-4">
                  {selectedFields.map((field) => {
                    const value = entryDraft.values[field.id];

                    return (
                      <div key={field.id}>
                        <label htmlFor={`entry-${field.id}`} className="block text-sm font-medium text-brand-text">
                          {field.fieldName}
                          {field.required ? ' *' : ''}
                        </label>

                        {field.fieldType === 'LongText' ? (
                          <textarea id={`entry-${field.id}`} rows={3} value={typeof value === 'string' ? value : ''} onChange={(event) => setEntryDraft((current) => ({ ...current, values: { ...current.values, [field.id]: event.target.value } }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                        ) : null}

                        {field.fieldType === 'Text' ? (
                          <input id={`entry-${field.id}`} value={typeof value === 'string' ? value : ''} onChange={(event) => setEntryDraft((current) => ({ ...current, values: { ...current.values, [field.id]: event.target.value } }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                        ) : null}

                        {field.fieldType === 'Number' || field.fieldType === 'Rating' ? (
                          <div className="mt-1 space-y-2">
                            <input id={`entry-${field.id}`} type="number" value={typeof value === 'number' ? value : typeof value === 'string' ? value : ''} onChange={(event) => setEntryDraft((current) => ({ ...current, values: { ...current.values, [field.id]: event.target.value === '' ? '' : Number(event.target.value) } }))} className="w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                            {field.fieldType === 'Rating' ? <p className="text-sm text-brand-text-muted">Use a 1–5 rating for this field.</p> : null}
                          </div>
                        ) : null}

                        {field.fieldType === 'Date' ? (
                          <input id={`entry-${field.id}`} type="date" value={typeof value === 'string' ? value : ''} onChange={(event) => setEntryDraft((current) => ({ ...current, values: { ...current.values, [field.id]: event.target.value } }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                        ) : null}

                        {field.fieldType === 'Time' ? (
                          <input id={`entry-${field.id}`} type="time" value={typeof value === 'string' ? value : ''} onChange={(event) => setEntryDraft((current) => ({ ...current, values: { ...current.values, [field.id]: event.target.value } }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                        ) : null}

                        {field.fieldType === 'Boolean' ? (
                          <label className="mt-1 flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-text">
                            <input id={`entry-${field.id}`} type="checkbox" checked={Boolean(value)} onChange={(event) => setEntryDraft((current) => ({ ...current, values: { ...current.values, [field.id]: event.target.checked } }))} className="h-4 w-4 rounded border-brand-border text-brand-emerald" />
                            {field.fieldName}
                          </label>
                        ) : null}

                        {field.fieldType === 'Dropdown' ? (
                          <select id={`entry-${field.id}`} value={typeof value === 'string' ? value : ''} onChange={(event) => setEntryDraft((current) => ({ ...current, values: { ...current.values, [field.id]: event.target.value } }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20">
                            <option value="">Select an option</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {entryError ? <p className="text-sm text-rose-600">{entryError}</p> : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsEntryModalOpen(false)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90">
                  <Plus className="h-4 w-4" />
                  {editingEntry ? 'Save entry' : 'Add entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteEntryTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-entry-title" className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="delete-entry-title" className="text-xl font-semibold text-brand-text">Delete entry</h2>
                <p className="mt-1 text-sm text-brand-text-muted">
                  Delete the entry recorded on <span className="font-medium text-brand-text">{deleteEntryTarget.date}</span>?
                </p>
              </div>
              <button type="button" onClick={() => setDeleteEntryTarget(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close delete entry dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteEntryTarget(null)} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
              <button type="button" onClick={handleEntryDeleteConfirm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                <Trash2 className="h-4 w-4" />
                Delete entry
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

