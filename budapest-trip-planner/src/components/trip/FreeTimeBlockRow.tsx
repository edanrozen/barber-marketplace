import { Sparkles } from 'lucide-react';
import type { FreeTimeBlock } from '@/engine/recommendationEngine';
import { formatDuration, minutesToHHMM } from '@/lib/time';

interface FreeTimeBlockRowProps {
  block: FreeTimeBlock;
  onTap: () => void;
}

export function FreeTimeBlockRow({ block, onTap }: FreeTimeBlockRowProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center gap-3 rounded-xl2 border border-dashed border-accent-gold/40 bg-accent-gold/5 px-3 py-3 text-right transition-colors hover:bg-accent-gold/10"
    >
      <div className="w-16 shrink-0 text-center text-xs font-semibold text-ink-secondary">
        <div>{minutesToHHMM(block.rawStartMinutes)}</div>
        <div className="text-ink-muted">{minutesToHHMM(block.rawEndMinutes)}</div>
      </div>

      <span className="text-lg leading-none">🟡</span>
      <Sparkles size={16} className="shrink-0 text-accent-gold" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-accent-gold">זמן פנוי</p>
        <p className="truncate text-xs text-ink-muted">{formatDuration(block.rawDurationMinutes)} פנויות — לחצו כדי לקבל המלצה</p>
      </div>
    </button>
  );
}
