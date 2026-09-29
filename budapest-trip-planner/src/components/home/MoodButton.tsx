import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { MoodOption } from '@/engine/moods';

interface MoodButtonProps {
  option: MoodOption;
  onSelect: (id: MoodOption['id']) => void;
}

/**
 * Every mood gets its own gradient direction/weight within the SAME brand
 * pink family (no new hues) — enough to give each card a distinct
 * personality instead of a wall of identical rectangles (Phase 6b).
 */
const GRADIENTS: Record<string, string> = {
  hungry_light: 'from-accent-gold/20 to-base-surface',
  hungry_a_lot: 'from-accent-rose/20 to-base-surface',
  drink: 'from-accent-violet/25 to-base-surface',
  party: 'from-accent-rose/25 via-accent-violet/15 to-base-surface',
  adrenaline: 'from-accent-gold/25 via-accent-rose/10 to-base-surface',
  sightseeing: 'from-accent-teal/15 to-base-surface',
  shopping: 'from-accent-violet/20 to-base-surface',
  coffee_sweet: 'from-accent-gold/15 to-base-surface',
  chill: 'from-ink-muted/15 to-base-surface',
  surprise_me: 'from-accent-rose/15 via-accent-gold/15 to-accent-violet/15',
};

export function MoodButton({ option, onSelect }: MoodButtonProps): JSX.Element {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => onSelect(option.id)}
      className={clsx(
        'relative flex flex-col items-start justify-end gap-1 overflow-hidden rounded-xl3 border border-base-border bg-gradient-to-br px-4 py-5 text-right shadow-card transition-colors hover:border-accent-gold/40 active:border-accent-gold/60',
        GRADIENTS[option.id] ?? 'from-base-surface2 to-base-surface',
      )}
    >
      <span className="text-4xl leading-none drop-shadow-sm">{option.emoji}</span>
      <span className="text-sm font-bold text-ink-primary">{option.label}</span>
    </motion.button>
  );
}
