import { BarChart3, TrendingUp } from 'lucide-react';


export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-brand-emerald" />
          Insights
        </h1>
        <p className="text-brand-text-muted mt-1">Discover correlations, charts, and habits over time.</p>
      </div>

      <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto mt-12 shadow-subtle">
        <div className="w-12 h-12 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center mx-auto">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No active workbook</h3>
          <p className="text-brand-text-muted text-sm leading-relaxed">
            Please import an existing workbook or download a starter one on the home page to compute interactive chart insights.
          </p>
        </div>
      </div>
    </div>
  );
}
