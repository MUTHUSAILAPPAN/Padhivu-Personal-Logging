import { Settings } from 'lucide-react';


export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-brand-emerald" />
          Settings
        </h1>
        <p className="text-brand-text-muted mt-1">Manage your workbook workspace preferences.</p>
      </div>

      <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 shadow-subtle space-y-6 max-w-2xl">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-brand-border pb-2">Workbook Config</h3>
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="font-medium">Active Source</p>
              <p className="text-brand-text-muted text-xs">The Excel file acting as your offline database.</p>
            </div>
            <span className="text-brand-text-muted italic bg-brand-bg px-2.5 py-1 rounded-md border border-brand-border">None Loaded</span>
          </div>

          <div className="flex justify-between items-center text-sm pt-2">
            <div>
              <p className="font-medium">Auto-download backup</p>
              <p className="text-brand-text-muted text-xs">Prompt to download your sheet file periodically.</p>
            </div>
            <div className="w-9 h-5 bg-brand-border rounded-full p-0.5 cursor-not-allowed">
              <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-brand-border pb-2">Local Privacy</h3>
          <p className="text-brand-text-muted text-sm leading-relaxed">
            All data resides in your browser's local sandbox memory during your session. 
            Once you download your modified Excel sheet, your session changes can be safely archived. 
            No tracking coordinates or logging details ever leave this system.
          </p>
        </div>
      </div>
    </div>
  );
}
