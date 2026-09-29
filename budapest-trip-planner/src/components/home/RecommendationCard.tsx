import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, RefreshCcw, Navigation, ChevronDown, ThumbsDown, CircleCheck, ShieldAlert, CircleOff, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import type { ScoredPlace } from '@/types';
import { CATEGORY_LABELS, CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDistance } from '@/lib/distance';
import { formatDuration } from '@/lib/time';
import { mapsUrl } from '@/lib/maps';

interface RecommendationCardProps {
  scored: ScoredPlace;
  explanation: string | null;
  reasons: string[];
  hoursCaveat: string | null;
  onGo: () => void;
  onAnotherOption: () => void;
  onDismiss: () => void;
  onMarkDone: () => void;
  hasMoreAlternatives: boolean;
  justMarkedDone: boolean;
}

export function RecommendationCard({
  scored,
  explanation,
  reasons,
  hoursCaveat,
  onGo,
  onAnotherOption,
  onDismiss,
  onMarkDone,
  hasMoreAlternatives,
  justMarkedDone,
}: RecommendationCardProps): JSX.Element {
  const { place } = scored;
  const [showWhy, setShowWhy] = useState(false);
  const navUrl = mapsUrl(place);
  const weatherReason = reasons.find((r) => r.startsWith('🌧️') || r.startsWith('☀️'));
  const otherReasons = reasons.filter((r) => r !== weatherReason);

  return (
    <motion.div
      key={place.id}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="overflow-hidden rounded-xl3 border-2 border-accent-gold/40 bg-base-surface shadow-glow"
    >
      <div className="relative h-44 w-full bg-gradient-to-br from-accent-gold/20 via-accent-violet/10 to-base-surface2">
        {place.image ? (
          <img src={place.image} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <CategoryIcon category={place.category} size={48} />
          </div>
        )}
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold tracking-wide text-accent-gold"
        >
          <Sparkles size={12} />
          ⭐ BEST MATCH
        </motion.span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <CategoryIcon category={place.category} size={14} />
            <span>{CATEGORY_LABELS[place.category]}</span>
            {place.priceLevel && <span>· {'₪'.repeat(place.priceLevel)}</span>}
          </div>
          <h2 className="text-xl font-extrabold text-ink-primary">{place.name}</h2>
        </div>

        {explanation && (
          <p className="rounded-lg bg-base-surface2 p-3 text-sm leading-relaxed text-ink-secondary">
            {explanation}
          </p>
        )}

        {weatherReason && (
          <p className="flex items-center gap-2 rounded-lg bg-accent-violet/10 px-3 py-2 text-xs font-medium text-accent-violet">
            {weatherReason}
          </p>
        )}

        {place.category === 'casino' && (
          <p className="flex items-start gap-2 rounded-lg bg-accent-rose/10 p-3 text-sm leading-relaxed text-accent-rose">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>🎰 תקציב מוגדר מראש — וזהו.</span>
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-ink-secondary">
          {scored.distanceKm !== null && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {formatDistance(scored.distanceKm)}
            </span>
          )}
          {scored.travelMinutes !== null && (
            // No live routing API is configured — this is a straight-line/walking-speed
            // estimate (see lib/distance.ts), never presented as precise real-time routing.
            <span className="flex items-center gap-1" title="הערכה לפי מרחק אווירי, לא ניווט חי">
              <Navigation size={13} /> ~{scored.travelMinutes} דק׳ הליכה (משוער)
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={13} /> {formatDuration(place.estimatedDurationMinutes)} במקום
          </span>
        </div>

        {hoursCaveat && <p className="text-xs text-ink-muted">⏱ {hoursCaveat}</p>}

        {otherReasons.length > 0 && (
          <div className="rounded-lg border border-base-border">
            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-ink-secondary"
            >
              <span>למה דווקא זה?</span>
              <ChevronDown size={16} className={clsx('transition-transform', showWhy && 'rotate-180')} />
            </button>
            {showWhy && (
              <ul className="flex flex-col gap-1 px-3 pb-3 text-xs text-ink-secondary">
                {otherReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {navUrl ? (
            <motion.a
              href={navUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onGo}
              whileTap={{ scale: 0.95 }}
              className="flex-1 rounded-full bg-gradient-to-l from-accent-gold to-accent-violet py-3 text-center text-sm font-extrabold text-white shadow-glow"
            >
              יאללה לשם 🚀
            </motion.a>
          ) : (
            <div
              className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full bg-base-surface2 px-3 py-2 text-center"
              title="אין לנו כתובת או מיקום מאומתים למקום הזה עדיין"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <CircleOff size={14} />
                אין ניווט זמין
              </span>
              <span className="text-[11px] text-ink-muted">לא אימתנו כתובת למקום הזה</span>
            </div>
          )}
          {hasMoreAlternatives && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onAnotherOption}
              className="flex items-center gap-1.5 rounded-full border border-base-border px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
            >
              <RefreshCcw size={14} />
              אופציה אחרת
            </motion.button>
          )}
        </div>

        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onDismiss}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-base-border py-2 text-xs font-medium text-ink-muted transition-colors hover:border-accent-rose/40 hover:text-accent-rose"
          >
            <ThumbsDown size={13} />
            לא בא לנו
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: justMarkedDone ? 1 : 0.95 }}
            onClick={onMarkDone}
            disabled={justMarkedDone}
            className={clsx(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-medium transition-colors',
              justMarkedDone
                ? 'border-accent-teal/40 text-accent-teal'
                : 'border-base-border text-ink-muted hover:border-accent-teal/40 hover:text-accent-teal',
            )}
          >
            <motion.span
              key={justMarkedDone ? 'done' : 'todo'}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5"
            >
              <CircleCheck size={13} />
              {justMarkedDone ? 'נרשם ✓' : 'עשינו את זה ✓'}
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
