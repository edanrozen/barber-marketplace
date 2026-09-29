import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CloudSun, Cross, ListChecks, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const LINKS: { to: string; label: string; description: string; icon: LucideIcon }[] = [
  { to: '/state', label: 'המצב שלנו', description: 'רעב, צמא, אנרגיה, תקציב ומיקום', icon: SlidersHorizontal },
  { to: '/schedule', label: 'עריכת לוח זמנים', description: 'הוספה ועריכה של פעילויות קבועות', icon: ListChecks },
  { to: '/weather', label: 'מזג אוויר', description: 'תחזית מלאה לימי הטיול', icon: CloudSun },
  { to: '/medical', label: 'עזרה רפואית', description: 'מיון, בתי חולים ומרפאות קרובים', icon: Cross },
];

export function MorePage(): JSX.Element {
  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold">עוד</h1>
        <p className="mt-1 text-sm text-ink-secondary">הגדרות וכלים נוספים לטיול</p>
      </div>
      <div className="flex flex-col gap-2 px-4">
        {LINKS.map(({ to, label, description, icon: Icon }, i) => (
          <motion.div key={to} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link
              to={to}
              className="flex items-center gap-3 rounded-xl2 border border-base-border bg-base-surface p-4 transition-colors hover:border-accent-gold/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-surface2 text-accent-gold">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-primary">{label}</p>
                <p className="truncate text-xs text-ink-muted">{description}</p>
              </div>
              <ChevronLeft size={18} className="shrink-0 text-ink-muted" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
