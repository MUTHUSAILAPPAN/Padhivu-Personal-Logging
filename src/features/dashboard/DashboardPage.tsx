import { Link } from 'react-router-dom';
import { BookOpen, DollarSign, CheckSquare, Heart, FolderOpen, Grid, BarChart3 } from 'lucide-react';


export default function DashboardPage() {
  const cards = [
    {
      title: 'Daily Log',
      description: 'Record highlights, rating, mood, and details of your day.',
      icon: BookOpen,
      href: '/app/daily-log',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      title: 'Expenses',
      description: 'Track daily spendings, categories, and methods.',
      icon: DollarSign,
      href: '/app/expenses',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Tasks',
      description: 'Manage tasks, checklists, statuses, and deadlines.',
      icon: CheckSquare,
      href: '/app/tasks',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Memories',
      description: 'Preserve thoughts, long-form journals, and moments.',
      icon: Heart,
      href: '/app/memories',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30',
    },
    {
      title: 'Collections',
      description: 'Curate lists like books read, movies watched, or goals.',
      icon: FolderOpen,
      href: '/app/collections',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      title: 'Custom Modules',
      description: 'Define your own logging schemas and record data.',
      icon: Grid,
      href: '/app/modules',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-brand-text-muted mt-1">Welcome to Padhivu, your local-first logging space.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-emerald-light/20 text-brand-emerald px-3 py-1.5 rounded-full text-sm font-medium border border-brand-emerald/10">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
          Workbook Source: Memory Only
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="group relative flex flex-col justify-between p-6 bg-brand-bg-card rounded-2xl border border-brand-border hover:border-brand-emerald/30 shadow-subtle hover:shadow-soft transition-all duration-300"
          >
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-brand-emerald transition-colors">{card.title}</h3>
              <p className="text-brand-text-muted text-sm mt-1">{card.description}</p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-brand-emerald opacity-0 group-hover:opacity-100 transition-opacity">
              Go to logs &rarr;
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-brand-bg-card rounded-2xl border border-brand-border p-6 shadow-subtle flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-emerald" />
            Insights & Analytics
          </h3>
          <p className="text-brand-text-muted text-sm max-w-xl">
            See trends and correlations automatically calculated over time based on your Daily Logs and Expenses.
          </p>
        </div>
        <Link
          to="/app/insights"
          className="bg-brand-emerald hover:bg-brand-emerald/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
        >
          View insights
        </Link>
      </div>
    </div>
  );
}
