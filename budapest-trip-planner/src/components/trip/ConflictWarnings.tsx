import { AlertTriangle, OctagonAlert } from 'lucide-react';
import clsx from 'clsx';
import type { ScheduleConflict } from '@/engine/recommendationEngine';

export function ConflictWarnings({ conflicts }: { conflicts: ScheduleConflict[] }): JSX.Element | null {
  if (conflicts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-4">
      {conflicts.map((conflict) => (
        <div
          key={conflict.id}
          className={clsx(
            'flex items-start gap-2 rounded-lg p-3 text-sm leading-relaxed',
            conflict.severity === 'error' ? 'bg-accent-rose/10 text-accent-rose' : 'bg-accent-gold/10 text-accent-gold',
          )}
        >
          {conflict.severity === 'error' ? (
            <OctagonAlert size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          )}
          <span>{conflict.message}</span>
        </div>
      ))}
    </div>
  );
}
