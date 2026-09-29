import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
  onClear: () => void;
}

/**
 * No local match — never invents a Place to fill the gap. Offers a real
 * Google search for the query instead, opened in a new tab.
 */
export function SearchEmptyState({ query, onClear }: SearchEmptyStateProps): JSX.Element {
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${query} Budapest`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 rounded-xl2 border border-base-border bg-base-surface px-6 py-10 text-center"
    >
      <span className="text-4xl">🔎</span>
      <div>
        <p className="text-sm font-bold text-ink-primary">לא מצאנו את המקום הזה</p>
        <p className="mt-1 text-xs text-ink-secondary">נסו לחפש בשם אחר או לבחור קטגוריה.</p>
      </div>
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-base-border px-4 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
        >
          נקה חיפוש
        </button>
        <div>
          <p className="mb-1.5 text-[11px] text-ink-muted">🌐 לא מצאנו את המקום במאגר שלנו</p>
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-full bg-accent-gold px-4 py-2 text-xs font-bold text-base-bg transition-transform active:scale-95"
          >
            חפש בגוגל
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
