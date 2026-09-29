import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, MapPin, Navigation, CircleOff, StickyNote, Clock3, CircleHelp, AlertTriangle, Phone, Heart, ThumbsDown, Star, ShieldAlert, Dices, Footprints } from 'lucide-react';
import clsx from 'clsx';
import type { PlaceStatus } from '@/types';
import { usePlacesStore, useUserStateStore } from '@/store';
import { CATEGORY_LABELS, CategoryIcon } from '@/components/common/CategoryIcon';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDuration, getCurrentTime, hasKnownHoursForDay, isOpenAt } from '@/lib/time';
import { mapsUrl } from '@/lib/maps';
import { formatDistance, getTravelTime } from '@/lib/distance';
import { HOTEL_MIKA } from '@/data/hotel';

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
  const toggleSaved = usePlacesStore((s) => s.toggleSaved);
  const currentLocation = useUserStateStore((s) => s.currentLocation);

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

  const navUrl = mapsUrl(place);
  const isMedical = place.category === 'medical';
  const isCasino = place.category === 'casino';
  const isPokerRoom = place.subcategory === 'Poker Room';
  const effectiveLocation = currentLocation ?? HOTEL_MIKA.coordinates;
  const travel = isCasino && place.coordinates ? getTravelTime(effectiveLocation, place.coordinates) : null;

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-48 w-full bg-gradient-to-br from-accent-gold/15 via-accent-violet/10 to-base-surface2"
      >
        {place.image ? (
          <img src={place.image} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <CategoryIcon category={place.category} size={48} />
          </div>
        )}
      </motion.div>

      <div className="flex flex-col gap-4 px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <CategoryIcon category={place.category} size={14} />
            <span>{CATEGORY_LABELS[place.category]}</span>
            {place.priceLevel && <span>· {'₪'.repeat(place.priceLevel)}</span>}
            {place.rating !== undefined && (
              <span className="flex items-center gap-0.5 text-accent-gold">
                <Star size={12} fill="currentColor" /> {place.rating.toFixed(1)}
                {place.reviewCount !== undefined && (
                  <span className="text-ink-muted">· {place.reviewCount.toLocaleString()}+ ביקורות</span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-extrabold text-ink-primary">{place.name}</h1>
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

        {isMedical && (
          <p className="flex items-start gap-2 rounded-lg bg-accent-rose/10 p-3 text-xs font-medium leading-relaxed text-accent-rose">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            🚨 במקרה של סכנת חיים או מצב חירום רפואי מיידי — התקשרו לשירותי החירום המקומיים.
          </p>
        )}

        {isCasino && (
          <>
            <p className="flex items-start gap-2 rounded-lg bg-accent-rose/10 p-3 text-sm leading-relaxed text-accent-rose">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>🎰 משחקים באחריות — הגדירו תקציב מראש ואל תחרגו ממנו.</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={clsx(
                  'rounded-full px-2.5 py-1 font-bold',
                  isPokerRoom ? 'bg-accent-violet/15 text-accent-violet' : 'bg-accent-gold/15 text-accent-gold',
                )}
              >
                {isPokerRoom ? '♠️ Poker Room' : '🎰 Casino'}
              </span>
              {place.minimumAge && (
                <span className="rounded-full bg-base-surface2 px-2.5 py-1 font-semibold text-ink-secondary">
                  כניסה מגיל {place.minimumAge}+
                </span>
              )}
            </div>

            {place.gamesOffered && place.gamesOffered.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-ink-muted">
                  <Dices size={13} /> משחקים במקום
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {place.gamesOffered.map((game) => (
                    <span key={game} className="rounded-full bg-base-surface2 px-2.5 py-1 text-xs text-ink-secondary">
                      {game}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {travel && (
              <p className="flex items-center gap-1.5 text-sm text-ink-secondary">
                <Footprints size={14} />
                {formatDistance(travel.distanceKm)} · כ-{travel.minutes} דק׳ הליכה
                {!currentLocation && ' (מהמלון)'}
              </p>
            )}
          </>
        )}

        {place.description && <p className="text-sm leading-relaxed text-ink-secondary">{place.description}</p>}

        {isMedical && place.phone && (
          <a
            href={`tel:${place.phone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-1.5 rounded-full border border-accent-rose/40 py-2 text-sm font-semibold text-accent-rose"
          >
            <Phone size={14} />
            {place.phone}
          </a>
        )}

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

        {navUrl ? (
          <a
            href={navUrl}
            target="_blank"
            rel="noreferrer"
            className={clsx(
              'flex items-center justify-center gap-1.5 rounded-full py-2.5 text-center text-sm font-bold transition-transform active:scale-95',
              isMedical ? 'bg-accent-rose text-white' : 'bg-accent-gold text-base-bg',
            )}
          >
            <Navigation size={15} />
            {isMedical ? 'נווטו לשם 🚑' : 'בואו לשם 🚀'}
          </a>
        ) : (
          <div
            className="flex items-center justify-center gap-1.5 rounded-full bg-base-surface2 px-3 py-2.5 text-center text-sm font-semibold text-ink-muted"
            title="אין לנו כתובת או מיקום מאומתים למקום הזה עדיין"
          >
            <CircleOff size={14} />
            אין ניווט זמין — לא אימתנו כתובת למקום הזה
          </div>
        )}

        {!isMedical && (
          <div className="flex gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSaved(place.id)}
              className={clsx(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-medium transition-colors',
                place.saved
                  ? 'border-accent-rose/50 bg-accent-rose/10 text-accent-rose'
                  : 'border-base-border text-ink-muted hover:border-accent-rose/40 hover:text-accent-rose',
              )}
            >
              <Heart size={13} fill={place.saved ? 'currentColor' : 'none'} />
              {place.saved ? 'שמור ✓' : 'שמור'}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatus(place.id, 'NOT_RELEVANT')}
              className={clsx(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-medium transition-colors',
                place.status === 'NOT_RELEVANT'
                  ? 'border-ink-muted/50 bg-base-surface2 text-ink-secondary'
                  : 'border-base-border text-ink-muted hover:border-ink-secondary/40 hover:text-ink-secondary',
              )}
            >
              <ThumbsDown size={13} />
              לא בשבילנו
            </motion.button>
          </div>
        )}

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
