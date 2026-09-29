import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Prominent, real-time catalog search — the input drives filtering directly, no submit step. */
export function SearchBar({ value, onChange }: SearchBarProps): JSX.Element {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={clsx(
        'mx-4 flex items-center gap-2 rounded-full border bg-base-surface px-4 py-2.5 transition-colors',
        focused ? 'border-accent-gold ring-2 ring-accent-gold/15' : 'border-base-border',
      )}
    >
      <Search size={18} className={clsx('shrink-0 transition-colors', focused ? 'text-accent-gold' : 'text-ink-muted')} />
      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('');
            inputRef.current?.blur();
          }
        }}
        placeholder="🔎 חפשו מקום בבודפשט..."
        aria-label="חפשו מקום בבודפשט"
        className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
      />
      {value && (
        <motion.button
          type="button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label="נקה חיפוש"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-surface2 text-ink-muted transition-colors hover:text-ink-primary"
        >
          <X size={12} />
        </motion.button>
      )}
    </motion.div>
  );
}
