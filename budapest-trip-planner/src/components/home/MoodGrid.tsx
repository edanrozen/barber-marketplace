import { MOOD_OPTIONS, type MoodOption } from '@/engine/moods';
import { MoodButton } from './MoodButton';

interface MoodGridProps {
  onSelect: (id: MoodOption['id']) => void;
}

export function MoodGrid({ onSelect }: MoodGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {MOOD_OPTIONS.map((option) => (
        <MoodButton key={option.id} option={option} onSelect={onSelect} />
      ))}
    </div>
  );
}
