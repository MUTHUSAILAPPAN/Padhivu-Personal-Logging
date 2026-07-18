import { Link } from 'react-router-dom';
import { FileSpreadsheet, ArrowLeft } from 'lucide-react';

export default function EmptyDashboard() {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-brand-border bg-brand-bg-card p-8 shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
        <FileSpreadsheet className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-brand-text">No workbook loaded</h1>
      <p className="mt-3 text-base leading-relaxed text-brand-text-muted">
        Padhivu uses a local Excel workbook as the source of truth. Import a workbook on the landing page to view your personal dashboard.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emerald/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to import page
        </Link>
      </div>
    </section>
  );
}