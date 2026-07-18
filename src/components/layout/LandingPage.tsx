import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkbook } from '../../hooks/useWorkbook';
import { importWorkbook, createStarterWorkbook } from '../../services/workbook';
import {
  Download,
  Upload,
  Play,
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setLoadedWorkbook, setImportStatus } = useWorkbook();
  const [hasPreviousSession, setHasPreviousSession] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const cachedFilename = localStorage.getItem('padhivu_last_filename');
    const cachedTimestamp = localStorage.getItem('padhivu_last_opened');
    if (cachedFilename && cachedTimestamp) {
      setHasPreviousSession(true);
    }
  }, []);

  const handleDownloadStarter = () => {
    const buffer = createStarterWorkbook();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'padhivu_starter.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);
    setImportStatus('loading');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = importWorkbook(arrayBuffer);

        if (result.errors.length > 0) {
          const fatalErrors = result.errors.filter((e) => e.severity === 'error');
          if (fatalErrors.length > 0) {
            setImportError(
              `${fatalErrors.length} error(s) found: ${fatalErrors[0].message}`
            );
            setImportStatus('error');
            setImporting(false);
            return;
          }
        }

        // Store lightweight session metadata in localStorage
        localStorage.setItem('padhivu_last_filename', file.name);
        localStorage.setItem('padhivu_last_opened', new Date().toISOString());

        // Dispatch to global context
        setLoadedWorkbook(
          result.data,
          file.name,
          null,
          result.errors,
          result.warnings
        );

        setTimeout(() => {
          setImporting(false);
          navigate('/app');
        }, 400);
      } catch (error: any) {
        console.error('Failed to parse workbook:', error);
        setImportError(error.message || 'Failed to read file');
        setImportStatus('error');
        setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleContinuePrevious = () => {
    if (hasPreviousSession) {
      // Cannot restore actual data without re-importing the file.
      // Navigate to app — the dashboard will show empty state prompting re-import.
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-emerald/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-emerald/3 rounded-full blur-3xl -z-10"></div>

      {/* Header / Logo */}
      <header className="max-w-5xl mx-auto w-full flex justify-between items-center py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-brand-emerald text-white rounded-xl flex items-center justify-center font-extrabold text-xl shadow-md">
            P
          </div>
          <span className="font-bold text-2xl tracking-tight text-brand-text">Padhivu</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-emerald bg-brand-emerald-light/35 px-3.5 py-1.5 rounded-full border border-brand-emerald/10">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
          v1.0 (Local-First)
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-5xl mx-auto w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 my-8">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-border text-xs font-medium text-brand-text-muted">
            <Cpu className="w-3.5 h-3.5 text-brand-emerald" />
            100% Client-Side Processing
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-brand-text">
            Your personal <br className="hidden sm:inline" />
            <span className="text-brand-emerald">logging workspace</span>.
          </h1>
          
          <p className="text-brand-text-muted text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Padhivu is a privacy-first logging, tracking, and journaling workspace. 
            Import your personal Excel workbook to run dashboards and insights locally — your data never leaves your computer.
          </p>

          {/* Privacy statement banner */}
          <div className="flex items-start gap-3 bg-brand-bg-card border border-brand-border p-4 rounded-xl max-w-xl mx-auto lg:mx-0 shadow-subtle text-left">
            <ShieldCheck className="w-5 h-5 text-brand-emerald mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Privacy Guarantee</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">
                No databases. No servers. No tracking telemetry. Padhivu operates purely inside your browser memory and compiles updates back into your Excel workbook.
              </p>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full max-w-md bg-brand-bg-card border border-brand-border rounded-3xl p-8 shadow-soft space-y-6">
          <div className="space-y-1.5 text-center">
            <h3 className="font-bold text-xl">Get Started</h3>
            <p className="text-brand-text-muted text-xs">Load or configure your database workbook</p>
          </div>

          <div className="space-y-4">
            {/* Import error banner */}
            {importError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-3 text-xs">
                <p className="font-semibold">Import Error</p>
                <p className="mt-0.5">{importError}</p>
              </div>
            )}

            {/* Import workbook input */}
            <div className="relative">
              <input
                type="file"
                id="workbook-import"
                accept=".xlsx, .xls, .ods"
                onChange={handleFileUpload}
                className="hidden"
                disabled={importing}
              />
              <label
                htmlFor="workbook-import"
                className={`w-full flex items-center justify-center gap-3 bg-brand-emerald hover:bg-brand-emerald/90 text-white font-semibold py-3.5 px-4 rounded-2xl cursor-pointer text-sm shadow-sm transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 ${
                  importing ? 'opacity-70 pointer-events-none' : ''
                }`}
              >
                {importing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Import workbook (.xlsx)
                  </>
                )}
              </label>
            </div>

            {/* Download starter button */}
            <button
              onClick={handleDownloadStarter}
              className="w-full flex items-center justify-center gap-3 bg-brand-bg border border-brand-border hover:bg-brand-border/60 text-brand-text font-semibold py-3.5 px-4 rounded-2xl text-sm transition-all duration-200 cursor-pointer shadow-subtle"
            >
              <Download className="w-5 h-5 text-brand-text-muted" />
              Download starter workbook
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-brand-border"></div>
              <span className="flex-shrink mx-4 text-brand-text-muted text-xs">or</span>
              <div className="flex-grow border-t border-brand-border"></div>
            </div>

            {/* Continue previous button */}
            <button
              onClick={handleContinuePrevious}
              disabled={!hasPreviousSession}
              className={`w-full flex items-center justify-center gap-3 font-semibold py-3.5 px-4 rounded-2xl text-sm transition-all duration-200 ${
                hasPreviousSession
                  ? 'bg-brand-border hover:bg-brand-border/80 text-brand-text cursor-pointer'
                  : 'bg-brand-border/40 text-brand-text-muted/50 cursor-not-allowed border border-brand-border/10'
              }`}
            >
              <Play className="w-4 h-4" />
              Continue previous session
              {hasPreviousSession && <ArrowRight className="w-4 h-4 ml-auto" />}
            </button>
            
            {!hasPreviousSession && (
              <p className="text-[10px] text-center text-brand-text-muted">
                No active session found in storage cache.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 border-t border-brand-border mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-brand-text-muted">
          <span>&copy; {new Date().getFullYear()} Padhivu Workspace. All rights reserved.</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Local-first. Static. Secure.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
