import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, MapPin, StickyNote, Clock3, CircleHelp } from 'lucide-react';
import clsx from 'clsx';
import type { PlaceStatus } from '@/types';
import { usePlacesStore } from '@/store';
import { CATEGORY_LABELS, CategoryIcon } from '@/components/common/CategoryIcon';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDuration, getCurrentTime, hasKnownHoursForDay, isOpenAt } from '@/lib/time';

const STATUS_ACTIONS: { status: PlaceStatus; label: string }[] = [
  { status: 'AVAILABLE', label: 'זמין' },
  { status: 'DONE', label: 'עשינו ✓' },
  { status: 'SKIPPED', label: 'דילגנו' },
  { status: 'NOT_RELEVANT', label: 'לא רלוונטי' },
  { status: 'NEEDS_VERIFICATION', label: 'טעון אימות' },
  { status: 'CONFIRMED', label: 'מאושר בלו״ז' },
];

export function PlaceDetailPage(): JSX.Element {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const place = usePlacesStore((s) => s.places.find((p) => p.id === placeId));
  const setStatus = usePlacesStore((s) => s.setStatus);

  const now = getCurrentTime();
  const hoursKnownToday = place ? hasKnownHoursForDay(place.openingHours, now) : false;
  const openNow = place ? isOpenAt(place.openingHours, now) : false;

  if (!place) {
    return (
      <EmptyState
        emoji="🔍"
        title="המקום לא נמצא"
        description="ייתכן שהוא הוסר מהמאגר."
        action={
          <Link to="/catalog" className="text-sm font-medium text-accent-gold">
            חזרה לכל האפשרויות
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="px-4 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
        >
          <ArrowRight size={16} />
          חזרה
        </button>
      </div>

      <div className="relative h-44 w-full bg-base-surface2">
        {place.image ? (
          <img src={place.image} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <CategoryIcon category={place.category} size={44} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <CategoryIcon category={place.category} size={14} />
            <span>{CATEGORY_LABELS[place.category]}</span>
            {place.priceLevel && <span>· {'₪'.repeat(place.priceLevel)}</span>}
          </div>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-ink-primary">{place.name}</h1>
            <StatusBadge status={place.status} />
          </div>
          {place.location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-secondary">
              <MapPin size={14} /> {place.location}
            </p>
          )}
          {hoursKnownToday ? (
            <p
              className={clsx(
                'mt-1 flex items-center gap-1 text-sm font-medium',
                openNow ? 'text-accent-teal' : 'text-ink-secondary',
              )}
            >
              <Clock3 size={14} /> {openNow ? 'פתוח עכשיו' : 'סגור עכשיו'}
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
              <CircleHelp size={14} /> שעות פעילות לא ידועות
            </p>
          )}
        </div>

        {place.description && <p className="text-sm leading-relaxed text-ink-secondary">{place.description}</p>}

        {place.notes && (
          <p
            className={clsx(
              'flex items-start gap-2 rounded-lg p-3 text-sm leading-relaxed',
              place.status === 'NEEDS_VERIFICATION'
                ? 'bg-accent-rose/10 text-accent-rose'
                : 'bg-base-surface2 text-ink-secondary',
            )}
          >
            <StickyNote size={16} className="mt-0.5 shrink-0" />
            <span>{place.notes}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-ink-secondary">
          <span className="rounded-full bg-base-surface2 px-2.5 py-1">⏱ {formatDuration(place.estimatedDurationMinutes)}</span>
          {place.requiresBooking && (
            <span className="rounded-full bg-accent-gold/15 px-2.5 py-1 text-accent-gold">דורש הזמנה מראש</span>
          )}
          {place.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-base-surface2 px-2.5 py-1">
              #{tag}
            </span>
          ))}
        </div>

        {(place.website || place.bookingUrl) && (
          <div className="flex gap-2">
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-base-border px-3 py-1.5 text-xs font-medium text-ink-secondary hover:border-accent-gold/40"
              >
                <ExternalLink size={12} /> אתר
              </a>
            )}
            {place.bookingUrl && (
              <a
                href={place.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-accent-gold/40 px-3 py-1.5 text-xs font-medium text-accent-gold"
              >
                <ExternalLink size={12} /> הזמנה
              </a>
            )}
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-ink-muted">סטטוס</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS.map(({ status, label }) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatus(place.id, status)}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  place.status === status
                    ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                    : 'border-base-border text-ink-secondary hover:border-accent-gold/30',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
