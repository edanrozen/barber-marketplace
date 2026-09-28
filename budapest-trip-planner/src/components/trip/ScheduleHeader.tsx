import { Car, Clock, Sparkles } from 'lucide-react';
import type { NextFixedActivityInfo } from '@/engine/recommendationEngine';
import { formatDuration } from '@/lib/time';

interface ScheduleHeaderProps {
  availableMinutes: number | null;
  nextActivity: NextFixedActivityInfo | null;
}

export function ScheduleHeader({ availableMinutes, nextActivity }: ScheduleHeaderProps): JSX.Element {
  return (
    <div className="mx-4 flex flex-col gap-2 rounded-xl2 border border-base-border bg-base-surface p-4">
      <div className="flex items-center gap-2 text-sm">
        <Clock size={16} className={availableMinutes === 0 ? 'text-accent-rose' : 'text-accent-teal'} />
        <span className="text-ink-secondary">יש לכם עכשיו</span>
        <span className="font-semibold text-ink-primary">
          {availableMinutes === null
            ? 'כל הזמן פתוח 🎉'
            : availableMinutes === 0
              ? 'אין זמן פנוי'
              : `🟢 ${formatDuration(availableMinutes)} פנויות`}
        </span>
      </div>

      {nextActivity && (
        <>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-accent-gold" />
            <span className="text-ink-secondary">הדבר הבא</span>
            <span className="font-semibold text-ink-primary">
              {nextActivity.activity.title} בעוד {formatDuration(nextActivity.timeUntilStartMinutes)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Car size={16} className="text-accent-violet" />
            <span className="text-ink-secondary">כדאי לצאת עד</span>
            <span className="font-semibold text-ink-primary">🚗 {nextActivity.latestSafeDepartureTime}</span>
          </div>
        </>
      )}
    </div>
  );
}
