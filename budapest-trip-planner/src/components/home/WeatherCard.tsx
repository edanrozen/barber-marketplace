import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { useWeatherStore } from '@/store';
import { weatherVisual } from '@/lib/weatherVisuals';

/** Compact, premium weather card for Home — tapping opens the full forecast (Phase 6b). */
export function WeatherCard(): JSX.Element {
  const current = useWeatherStore((s) => s.current);
  const loading = useWeatherStore((s) => s.currentLoading);
  const error = useWeatherStore((s) => s.currentError);
  const daily = useWeatherStore((s) => s.daily);

  const tomorrow = daily && daily.length > 1 ? daily[1] : null;

  if (loading && !current) {
    return (
      <div className="mx-4 flex items-center gap-2 rounded-xl2 border border-base-border bg-base-surface px-4 py-3 text-sm text-ink-muted">
        <span className="animate-pulse-soft">🌤️ טוען מזג אוויר...</span>
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="mx-4 flex items-center gap-2 rounded-xl2 border border-base-border bg-base-surface px-4 py-3 text-sm text-ink-muted">
        <span>לא הצלחנו לטעון את מזג האוויר</span>
      </div>
    );
  }

  if (!current) return <></>;

  const visual = weatherVisual(current.condition);

  return (
    <Link to="/weather">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          'relative mx-4 overflow-hidden rounded-xl3 bg-gradient-to-br p-4 shadow-card',
          visual.gradient,
        )}
      >
        {visual.motionClass === 'rain' && <RainOverlay />}
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={clsx('text-3xl', visual.motionClass === 'animate-glow-pulse' && 'animate-glow-pulse')}>
                {current.icon}
              </span>
              <span className="text-3xl font-extrabold text-ink-primary">{current.temperature}°</span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-ink-secondary">Budapest · {current.description}</p>
            <p className="mt-1 text-xs text-ink-muted">
              מרגיש כמו {current.feelsLike}°
              {current.precipitationProbability !== null && <> · גשם {current.precipitationProbability}%</>}
            </p>
          </div>
          <div className="flex items-center gap-1 text-ink-muted">
            {tomorrow && (
              <div className="ml-1 text-left text-xs">
                <p className="text-ink-muted">מחר</p>
                <p className="font-semibold text-ink-primary">
                  {tomorrow.icon} {tomorrow.maxTemperature}°/{tomorrow.minTemperature}°
                </p>
              </div>
            )}
            <ChevronLeft size={18} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function RainOverlay(): JSX.Element {
  const drops = [10, 30, 50, 70, 90];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
      {drops.map((left, i) => (
        <span
          key={left}
          className="absolute top-0 h-6 w-px bg-ink-secondary animate-rain-fall"
          style={{ left: `${left}%`, animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}
