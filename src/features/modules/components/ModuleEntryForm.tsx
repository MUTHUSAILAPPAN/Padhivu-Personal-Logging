import { useEffect, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import type { CustomModule, ModuleEntry, ModuleField } from '../../../types';
import { getLocalDateString } from '../../../utils';

interface ModuleEntryFormProps {
  isOpen: boolean;
  module: CustomModule | null;
  fields: ModuleField[];
  entry?: ModuleEntry | null;
  onClose: () => void;
  onSubmitEntry: (entry: ModuleEntry) => void;
}

const getDefaultEntryValue = (field: ModuleField): string | number | boolean | null => {
  if (field.fieldType === 'Boolean') {
    return false;
  }

  if (field.fieldType === 'Number' || field.fieldType === 'Rating') {
    return '';
  }

  return '';
};

export default function ModuleEntryForm({ isOpen, module, fields, entry, onClose, onSubmitEntry }: ModuleEntryFormProps) {
  const [date, setDate] = useState(getLocalDateString());
  const [values, setValues] = useState<Record<string, string | number | boolean | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !module) {
      return;
    }

    setDate(entry?.date || getLocalDateString());

    const nextValues = fields.reduce<Record<string, string | number | boolean | null>>((accumulator, field) => {
      if (entry) {
        accumulator[field.id] = field.id in entry.data ? (entry.data[field.id] as string | number | boolean | null) : getDefaultEntryValue(field);
      } else {
        accumulator[field.id] = getDefaultEntryValue(field);
      }
      return accumulator;
    }, {});

    setValues(nextValues);
    setError(null);
  }, [entry, fields, isOpen, module]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!module) {
      return;
    }

    const invalidField = fields.find((field) => {
      if (!field.required) {
        return false;
      }

      const value = values[field.id];

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
      setError(`${invalidField.fieldName} is required.`);
      return;
    }

    const data = fields.reduce<Record<string, unknown>>((accumulator, field) => {
      const value = values[field.id];
      if (field.fieldType === 'Number' || field.fieldType === 'Rating') {
        accumulator[field.id] = Number(value);
      } else if (field.fieldType === 'Boolean') {
        accumulator[field.id] = Boolean(value);
      } else {
        accumulator[field.id] = value ?? '';
      }
      return accumulator;
    }, {});

    onSubmitEntry({
      id: entry?.id ?? crypto.randomUUID(),
      moduleId: module.id,
      date,
      data
    });

    onClose();
  };

  if (!isOpen || !module) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="module-entry-title" className="w-full max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="module-entry-title" className="text-xl font-semibold text-brand-text">{entry ? 'Edit entry' : 'Add entry'}</h2>
            <p className="mt-1 text-sm text-brand-text-muted">Capture a record for {module.name} using the fields you configured.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted transition-colors hover:bg-brand-border/60" aria-label="Close entry dialog">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="entry-date" className="block text-sm font-medium text-brand-text">Date</label>
            <input id="entry-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
          </div>

          {fields.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg p-4 text-sm text-brand-text-muted">Add a field first to build the entry form for this module.</div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => {
                const value = values[field.id];
                return (
                  <div key={field.id}>
                    <label htmlFor={`entry-${field.id}`} className="block text-sm font-medium text-brand-text">
                      {field.fieldName}
                      {field.required ? ' *' : ''}
                    </label>

                    {field.fieldType === 'LongText' ? (
                      <textarea id={`entry-${field.id}`} rows={3} value={typeof value === 'string' ? value : ''} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                    ) : null}

                    {field.fieldType === 'Text' ? (
                      <input id={`entry-${field.id}`} value={typeof value === 'string' ? value : ''} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                    ) : null}

                    {(field.fieldType === 'Number' || field.fieldType === 'Rating') ? (
                      <div className="mt-1 space-y-2">
                        <input id={`entry-${field.id}`} type="number" value={typeof value === 'number' ? value : typeof value === 'string' ? value : ''} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value === '' ? '' : Number(event.target.value) }))} className="w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                        {field.fieldType === 'Rating' ? <p className="text-sm text-brand-text-muted">Use a 1–5 rating for this field.</p> : null}
                      </div>
                    ) : null}

                    {field.fieldType === 'Date' ? (
                      <input id={`entry-${field.id}`} type="date" value={typeof value === 'string' ? value : ''} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                    ) : null}

                    {field.fieldType === 'Time' ? (
                      <input id={`entry-${field.id}`} type="time" value={typeof value === 'string' ? value : ''} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20" />
                    ) : null}

                    {field.fieldType === 'Boolean' ? (
                      <label className="mt-1 flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-text">
                        <input id={`entry-${field.id}`} type="checkbox" checked={Boolean(value)} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.checked }))} className="h-4 w-4 rounded border-brand-border text-brand-emerald" />
                        {field.fieldName}
                      </label>
                    ) : null}

                    {field.fieldType === 'Dropdown' ? (
                      <select id={`entry-${field.id}`} value={typeof value === 'string' ? value : ''} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} className="mt-1 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20">
                        <option value="">Select an option</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border/60">Cancel</button>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90">
              {entry ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {entry ? 'Save entry' : 'Add entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
