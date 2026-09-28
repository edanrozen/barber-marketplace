import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, RefreshCcw, Navigation, ChevronDown, ThumbsDown, CircleCheck, ShieldAlert, CircleOff } from 'lucide-react';
import clsx from 'clsx';
import type { ScoredPlace } from '@/types';
import { CATEGORY_LABELS, CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDistance } from '@/lib/distance';
import { formatDuration } from '@/lib/time';

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

/**
 * Navigation fallback chain: precise coordinates first, a verified address
 * second, and if we have neither, no link at all — never a bare name-only
 * guess. The CTA disables itself and says why instead of offering a search
 * that isn't grounded in anything we actually verified.
 */
function mapsUrl(scored: ScoredPlace): string | null {
  const { coordinates, name, location } = scored.place;
  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  }
  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${location}`)}`;
  }
  return null;
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
  const navUrl = mapsUrl(scored);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl2 border border-accent-gold/30 bg-base-surface shadow-glow"
    >
      <div className="relative h-40 w-full bg-base-surface2">
        {place.image ? (
          <img src={place.image} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <CategoryIcon category={place.category} size={40} />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-accent-gold">
          🎯 הבחירה שלנו
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <CategoryIcon category={place.category} size={14} />
            <span>{CATEGORY_LABELS[place.category]}</span>
            {place.priceLevel && <span>· {'₪'.repeat(place.priceLevel)}</span>}
          </div>
          <h2 className="text-lg font-bold text-ink-primary">{place.name}</h2>
        </div>

        {explanation && (
          <p className="rounded-lg bg-base-surface2 p-3 text-sm leading-relaxed text-ink-secondary">
            {explanation}
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

        {reasons.length > 0 && (
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
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {navUrl ? (
            <a
              href={navUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onGo}
              className="flex-1 rounded-full bg-accent-gold py-2.5 text-center text-sm font-bold text-base-bg transition-transform active:scale-95"
            >
              יאללה לשם 🚀
            </a>
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
            <button
              type="button"
              onClick={onAnotherOption}
              className="flex items-center gap-1.5 rounded-full border border-base-border px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
            >
              <RefreshCcw size={14} />
              אופציה אחרת
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-base-border py-2 text-xs font-medium text-ink-muted transition-colors hover:border-accent-rose/40 hover:text-accent-rose"
          >
            <ThumbsDown size={13} />
            לא בא לנו
          </button>
          <button
            type="button"
            onClick={onMarkDone}
            disabled={justMarkedDone}
            className={clsx(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-medium transition-colors',
              justMarkedDone
                ? 'border-accent-teal/40 text-accent-teal'
                : 'border-base-border text-ink-muted hover:border-accent-teal/40 hover:text-accent-teal',
            )}
          >
            <CircleCheck size={13} />
            {justMarkedDone ? 'נרשם ✓' : 'עשינו את זה ✓'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
