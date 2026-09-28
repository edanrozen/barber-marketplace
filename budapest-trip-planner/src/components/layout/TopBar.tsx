import { Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';

export function TopBar(): JSX.Element {
  return (
    <header className="safe-top flex items-center justify-between border-b border-base-border bg-base-bg/95 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-xl">🇭🇺</span>
        <div>
          <p className="text-sm font-semibold leading-tight text-ink-primary">Budapest AI</p>
          <p className="text-[11px] leading-tight text-ink-muted">Trip Planner</p>
        </div>
      </div>

      <Link
        to="/state"
        className="flex items-center gap-1.5 rounded-full border border-base-border bg-base-surface px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
        aria-label="עדכון מצב נוכחי"
      >
        <SlidersHorizontal size={14} />
        <span>המצב שלנו</span>
      </Link>
    </header>
  );
}
