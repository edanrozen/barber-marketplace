import { motion } from 'framer-motion';

/** Brief, intentional "the app is deciding" beat before the pick reveals (Phase 6b — see brief section 16). */
export function ThinkingCard(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-xl3 border border-base-border bg-base-surface py-14 shadow-card"
    >
      <motion.span
        className="text-4xl"
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        🤖
      </motion.span>
      <p className="text-sm font-semibold text-ink-secondary">בודק מה הכי מתאים לכם...</p>
    </motion.div>
  );
}
