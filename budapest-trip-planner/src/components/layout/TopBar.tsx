import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, SlidersHorizontal } from 'lucide-react';

export function TopBar(): JSX.Element {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';

  return (
    <header className="safe-top flex items-center justify-between border-b border-base-border bg-base-bg/95 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-xl">🇭🇺</span>
        <div>
          <p className="text-sm font-semibold leading-tight text-ink-primary">Budapest AI</p>
          <p className="text-[11px] leading-tight text-ink-muted">Trip Planner</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Every screen except Home itself gets an obvious way back — a router
            navigate, never a full reload, so app state (mood pick, live clock) survives. */}
        {!isHome && (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-full border border-accent-gold/40 bg-accent-gold/10 px-3 py-1.5 text-xs font-medium text-accent-gold transition-colors hover:bg-accent-gold/20"
            aria-label="חזרה להתחלה"
          >
            <Home size={14} />
            <span>חזרה להתחלה</span>
          </button>
        )}

        <Link
          to="/state"
          className="flex items-center gap-1.5 rounded-full border border-base-border bg-base-surface px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
          aria-label="עדכון מצב נוכחי"
        >
          <SlidersHorizontal size={14} />
          <span>המצב שלנו</span>
        </Link>
      </div>
    </header>
  );
}
