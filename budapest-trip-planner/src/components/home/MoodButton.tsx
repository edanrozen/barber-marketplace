import { motion } from 'framer-motion';
import type { MoodOption } from '@/engine/moods';

interface MoodButtonProps {
  option: MoodOption;
  onSelect: (id: MoodOption['id']) => void;
}

export function MoodButton({ option, onSelect }: MoodButtonProps): JSX.Element {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(option.id)}
      className="flex flex-col items-center justify-center gap-2 rounded-xl2 border border-base-border bg-base-surface px-3 py-5 text-center shadow-card transition-colors hover:border-accent-gold/40 active:border-accent-gold/60"
    >
      <span className="text-3xl">{option.emoji}</span>
      <span className="text-sm font-medium text-ink-primary">{option.label}</span>
    </motion.button>
  );
}
