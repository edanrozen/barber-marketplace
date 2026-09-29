import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, Compass, Home, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { to: '/', label: 'בית', icon: Home, end: true },
  { to: '/today', label: 'היום', icon: CalendarClock, end: false },
  { to: '/catalog', label: 'לגלות', icon: Compass, end: false },
  { to: '/more', label: 'עוד', icon: MoreHorizontal, end: false },
] as const;

export function BottomNav(): JSX.Element {
  const { pathname } = useLocation();
  const activeIndex = TABS.findIndex((t) => (t.end ? pathname === t.to : pathname.startsWith(t.to)));

  return (
    <nav className="safe-bottom relative border-t border-base-border bg-base-surface/95 backdrop-blur-md">
      <ul className="relative flex items-stretch justify-around">
        {activeIndex >= 0 && (
          <motion.div
            layoutId="bottom-nav-pill"
            className="absolute top-1.5 h-9 w-9 rounded-full bg-accent-gold/10"
            style={{ left: `calc(${(activeIndex + 0.5) * (100 / TABS.length)}% - 18px)` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="relative z-10 flex-1">
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
                <motion.div whileTap={{ scale: 0.88 }} className="flex flex-col items-center gap-1">
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{label}</span>
                </motion.div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
