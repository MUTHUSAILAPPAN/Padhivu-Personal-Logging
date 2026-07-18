import { Grid, Plus, Sliders } from 'lucide-react';

export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Grid className="w-8 h-8 text-brand-emerald" />
            Custom Modules
          </h1>
          <p className="text-brand-text-muted mt-1">Design bespoke logging forms with custom field attributes.</p>
        </div>
        <button
          disabled
          className="bg-brand-emerald/50 cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Module
        </button>
      </div>

      <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto mt-12 shadow-subtle">
        <div className="w-12 h-12 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center mx-auto">
          <Sliders className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No active workbook</h3>
          <p className="text-brand-text-muted text-sm leading-relaxed">
            Please import an existing workbook or download a starter one on the home page to begin defining custom modules.
          </p>
        </div>
      </div>
    </div>
  );
}

