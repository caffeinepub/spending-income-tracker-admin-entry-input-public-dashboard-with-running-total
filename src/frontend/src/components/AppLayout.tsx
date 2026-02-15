import { Link, useRouterState } from '@tanstack/react-router';
import { TrendingUp } from 'lucide-react';
import { SiCaffeine } from 'react-icons/si';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Income Tracker</h1>
                <p className="text-xs text-muted-foreground">Financial transparency dashboard</p>
              </div>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === '/'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === '/admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Income Tracker. All rights reserved.</p>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'income-tracker'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors group"
            >
              Built with <SiCaffeine className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" /> using{' '}
              <span className="font-medium">caffeine.ai</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

