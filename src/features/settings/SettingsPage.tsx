import { useMemo } from 'react';
import { ArrowLeft, CalendarDays, Monitor, Moon, Palette, Settings, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader, WorkbookEmptyState } from '../../components/ui/PageState';
import { useWorkbook } from '../../hooks/useWorkbook';

const currencyOptions = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];
const dateFormatOptions = [
  { value: 'dd MMM yyyy', label: 'DD MMM YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' }
];
const weekStartOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' }
];
const themeOptions = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon }
] as const;

export default function SettingsPage() {
  const { workbookData, updateSettings } = useWorkbook();

  const currencyValue = workbookData?.settings?.currency || 'INR';
  const themeValue = workbookData?.settings?.theme || 'system';
  const dateFormatValue = workbookData?.settings?.dateFormat || 'dd MMM yyyy';
  const weekStartValue = workbookData?.settings?.weekStart || 'monday';

  const previewDate = useMemo(() => {
    const parsed = new Date(2026, 6, 19);
    const normalizedFormat = dateFormatValue === 'yyyy-MM-dd' ? 'yyyy-MM-dd' : 'dd MMM yyyy';
    return format(parsed, normalizedFormat);
  }, [dateFormatValue]);

  if (!workbookData) {
    return (
      <WorkbookEmptyState
        icon={Settings}
        title="No workbook loaded"
        description="Padhivu settings live inside your workbook, so they can be saved and re-imported with the rest of your local data."
        primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
      />
    );
  }

  const handleSettingChange = (key: string, value: string) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workbook preferences"
        title="Settings"
        description="These preferences stay inside your workbook and are saved through the existing local save flow."
      />

      <div className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
        <p className="text-sm text-brand-text-muted">
          Changes appear immediately and mark the workbook as unsaved until you press Save from the app shell.
        </p>
      </div>

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-brand-emerald" />
          <h2 className="text-lg font-semibold text-brand-text">Preferences</h2>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-border bg-brand-bg p-4">
            <label htmlFor="currency-setting" className="block text-sm font-medium text-brand-text">Currency preference</label>
            <select
              id="currency-setting"
              value={currencyValue}
              onChange={(event) => handleSettingChange('currency', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-bg-card px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
            >
              {currencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-brand-text-muted">This updates the default currency used by expense displays and forms.</p>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-bg p-4">
            <label className="block text-sm font-medium text-brand-text">Theme preference</label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const selected = themeValue === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSettingChange('theme', option.value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${selected ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' : 'border-brand-border bg-brand-bg-card text-brand-text-muted hover:bg-brand-border/60'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-brand-text-muted">System follows the OS preference, while Light and Dark override it.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-brand-border bg-brand-bg-card p-5 shadow-subtle">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-brand-emerald" />
          <h2 className="text-lg font-semibold text-brand-text">Date & week start</h2>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-border bg-brand-bg p-4">
            <label htmlFor="date-format-setting" className="block text-sm font-medium text-brand-text">Date display format</label>
            <select
              id="date-format-setting"
              value={dateFormatValue}
              onChange={(event) => handleSettingChange('dateFormat', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-bg-card px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
            >
              {dateFormatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-brand-text-muted">Preview updates here for the workbook view.</p>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-bg p-4">
            <label htmlFor="week-start-setting" className="block text-sm font-medium text-brand-text">Week start</label>
            <select
              id="week-start-setting"
              value={weekStartValue}
              onChange={(event) => handleSettingChange('weekStart', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-bg-card px-4 py-3 text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
            >
              {weekStartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-brand-text-muted">Stored for future calendar and analytics use.</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-brand-border bg-brand-bg-card p-4">
          <p className="text-sm font-medium text-brand-text">Preview</p>
          <p className="mt-2 text-lg font-semibold text-brand-text">{previewDate}</p>
          <p className="mt-1 text-sm text-brand-text-muted">Week start preference: {weekStartValue === 'monday' ? 'Monday' : 'Sunday'}</p>
        </div>
      </section>
    </div>
  );
}
