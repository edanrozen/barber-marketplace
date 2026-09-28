import { NavLink } from 'react-router-dom';
import { CalendarClock, Home, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { to: '/', label: 'בית', icon: Home, end: true },
  { to: '/today', label: 'היום', icon: CalendarClock, end: false },
  { to: '/catalog', label: 'כל האפשרויות', icon: LayoutGrid, end: false },
] as const;

export function BottomNav(): JSX.Element {
  return (
    <nav className="safe-bottom border-t border-base-border bg-base-surface/95 backdrop-blur-md">
      <ul className="flex items-stretch justify-around">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                  isActive ? 'text-accent-gold' : 'text-ink-muted hover:text-ink-secondary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
