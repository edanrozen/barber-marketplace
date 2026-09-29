import { motion } from 'framer-motion';
import { MOOD_OPTIONS, type MoodOption } from '@/engine/moods';
import { MoodButton } from './MoodButton';

interface MoodGridProps {
  onSelect: (id: MoodOption['id']) => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function MoodGrid({ onSelect }: MoodGridProps): JSX.Element {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 px-4">
      {MOOD_OPTIONS.map((option) => (
        <motion.div key={option.id} variants={item}>
          <MoodButton option={option} onSelect={onSelect} />
        </motion.div>
      ))}
    </motion.div>
  );
}
