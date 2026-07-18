import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';


export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-soft">
        <div className="w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-xl font-bold">Page Not Found</h2>
          <p className="text-brand-text-muted text-sm leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="inline-block bg-brand-emerald hover:bg-brand-emerald/90 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
