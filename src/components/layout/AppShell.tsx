import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useWorkbook } from '../../hooks/useWorkbook';
import { useWorkbookSave } from '../../hooks/useWorkbookSave';
import SearchModal from './SearchModal';
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  CheckSquare,
  Heart,
  FolderOpen,
  Grid,
  BarChart3,
  Settings,
  Menu,
  X,
  FileSpreadsheet,
  LogOut,
  Database,
  Search
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error' | 'neutral'; message: string } | null>(null);
  const navigate = useNavigate();
  const { workbookName, workbookData, dirty, unloadWorkbook } = useWorkbook();
  const { save, saveAs, isSaving, canSave, describeSaveResult } = useWorkbookSave();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Daily Log', href: '/app/daily-log', icon: BookOpen },
    { name: 'Expenses', href: '/app/expenses', icon: DollarSign },
    { name: 'Tasks', href: '/app/tasks', icon: CheckSquare },
    { name: 'Memories', href: '/app/memories', icon: Heart },
    { name: 'Collections', href: '/app/collections', icon: FolderOpen },
    { name: 'Custom Modules', href: '/app/modules', icon: Grid },
    { name: 'Insights', href: '/app/insights', icon: BarChart3 },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  useEffect(() => {
    if (!workbookData) {
      return;
    }

    const root = document.documentElement;
    const themePreference = workbookData.settings?.theme || 'system';
    const resolveTheme = (preference: string) => {
      if (preference === 'light' || preference === 'dark') {
        return preference;
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (preference: string) => {
      const resolvedTheme = resolveTheme(preference);
      root.dataset.theme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;

      const palette = resolvedTheme === 'dark'
        ? {
            '--brand-bg': '#121210',
            '--brand-bg-card': '#1C1C19',
            '--brand-text': '#F5F5F4',
            '--brand-text-muted': '#A8A29E',
            '--brand-border': '#2C2A26',
            '--brand-emerald': '#34D399',
            '--brand-emerald-light': '#064E3B',
            '--shadow-color': 'rgba(0, 0, 0, 0.3)'
          }
        : {
            '--brand-bg': '#FCFBF9',
            '--brand-bg-card': '#FFFFFF',
            '--brand-text': '#1C1917',
            '--brand-text-muted': '#6B6661',
            '--brand-border': '#EAE6E1',
            '--brand-emerald': '#059669',
            '--brand-emerald-light': '#D1FAE5',
            '--shadow-color': 'rgba(28, 25, 23, 0.05)'
          };

      Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    };

    applyTheme(themePreference);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (themePreference === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener?.('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleSystemThemeChange);
    };
  }, [workbookData]);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && workbookData && !isSaving) {
        e.preventDefault();
        void save().then(showSaveOutcome);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [describeSaveResult, isSaving, save, workbookData]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleUnloadWorkbook = () => {
    if (dirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to unload the workbook? Changes will be lost.'
      );
      if (!confirmed) return;
    }

    unloadWorkbook();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-brand-emerald/10 text-brand-emerald shadow-subtle'
        : 'text-brand-text-muted hover:bg-brand-border hover:text-brand-text'
    }`;

  const displayName = workbookName || 'Local Session';
  const saveDisabled = !canSave;
  const statusLabel = dirty ? 'Unsaved changes' : 'Saved';
  const showSaveOutcome = (result: Awaited<ReturnType<typeof save>>) => {
    const tone = result.status === 'error' ? 'error' : result.status === 'cancelled' ? 'neutral' : 'success';
    setFeedback({ tone, message: describeSaveResult(result) });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-brand-bg-card border-r border-brand-border py-6 px-4">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-9 h-9 bg-brand-emerald text-white rounded-xl flex items-center justify-center font-extrabold text-lg shadow-sm">
          P
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight">Padhivu</span>
          <span className="block text-[10px] text-brand-text-muted font-semibold tracking-wider uppercase">
            Local Logging
          </span>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2.5 mx-1 mb-5 px-3 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted text-sm hover:bg-brand-border/60 transition-colors cursor-pointer"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex text-[10px] bg-brand-border px-1.5 py-0.5 rounded-md border border-brand-border font-mono">⌘K</kbd>
      </button>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/app'}
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Workbook Metadata & Save Controls */}
      <div className="mt-auto border-t border-brand-border pt-4 px-2 space-y-3">
        <div className="flex items-center gap-2.5 bg-brand-bg p-3 rounded-xl border border-brand-border">
          <Database className="w-5 h-5 text-brand-text-muted flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-brand-text truncate" title={displayName}>
              {displayName}
            </span>
            <span className={`block text-[10px] truncate ${dirty ? 'text-amber-600' : 'text-brand-emerald'}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => void save().then(showSaveOutcome)}
            disabled={saveDisabled}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              saveDisabled
                ? 'bg-brand-border/50 text-brand-text-muted cursor-not-allowed'
                : 'bg-brand-emerald text-white hover:bg-brand-emerald/90 cursor-pointer'
            }`}
          >
            {isSaving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
          </button>

          <button
            onClick={() => void saveAs().then(showSaveOutcome)}
            disabled={isSaving || !workbookData}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isSaving || !workbookData
                ? 'bg-brand-border/50 text-brand-text-muted cursor-not-allowed'
                : 'bg-brand-bg hover:bg-brand-border/70 text-brand-text cursor-pointer border border-brand-border'
            }`}
          >
            Save As
          </button>
        </div>

        {feedback && (
          <div
            className={`rounded-xl px-3 py-2 text-xs border ${
              feedback.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
                : feedback.tone === 'neutral'
                  ? 'border-brand-border bg-brand-bg text-brand-text-muted'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <button
          onClick={handleUnloadWorkbook}
          className="w-full flex items-center justify-center gap-2 bg-brand-border hover:bg-brand-border/80 text-brand-text font-medium px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Unload Workbook
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between bg-brand-bg-card border-b border-brand-border h-16 px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-brand-text hover:bg-brand-border transition-colors cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg tracking-tight">Padhivu</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-border transition-colors cursor-pointer"
            aria-label="Open search"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 text-[10px] text-brand-emerald bg-brand-emerald-light/20 px-2.5 py-1 rounded-full font-medium border border-brand-emerald/10">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Local
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Slide-out Panel Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer menu body */}
          <div className="relative w-64 max-w-xs flex-shrink-0 flex flex-col h-full bg-brand-bg-card shadow-xl transition-transform">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-brand-text hover:bg-brand-border transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-full flex flex-col pt-4">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
