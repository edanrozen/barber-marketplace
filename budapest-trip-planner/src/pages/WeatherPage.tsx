import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTripStore, useWeatherStore } from '@/store';
import { weatherVisual } from '@/lib/weatherVisuals';
import type { DailyForecast } from '@/types';
import clsx from 'clsx';

const WEEKDAY_LABELS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()}.${d.getMonth() + 1} · יום ${WEEKDAY_LABELS[d.getDay()]}`;
}

export function WeatherPage(): JSX.Element {
  const current = useWeatherStore((s) => s.current);
  const currentLoading = useWeatherStore((s) => s.currentLoading);
  const currentError = useWeatherStore((s) => s.currentError);
  const daily = useWeatherStore((s) => s.daily);
  const dailyLoading = useWeatherStore((s) => s.dailyLoading);
  const dailyError = useWeatherStore((s) => s.dailyError);
  const plan = useTripStore((s) => s.plan);

  const dailyByDate = useMemo(() => {
    const map = new Map<string, DailyForecast>();
    daily?.forEach((d) => map.set(d.date, d));
    return map;
  }, [daily]);

  const visual = current ? weatherVisual(current.condition) : null;

  return (
    <div className="flex min-h-full flex-col gap-5 pb-6">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold">מזג האוויר בבודפשט</h1>
        <p className="mt-1 text-sm text-ink-secondary">תחזית לאורך הטיול</p>
      </div>

      {currentLoading && !current && (
        <p className="mx-4 text-sm text-ink-muted animate-pulse-soft">🌤️ טוען מזג אוויר...</p>
      )}
      {currentError && !current && <p className="mx-4 text-sm text-ink-muted">לא הצלחנו לטעון את מזג האוויר</p>}

      {current && visual && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx('relative mx-4 overflow-hidden rounded-xl3 bg-gradient-to-br p-5 shadow-card', visual.gradient)}
        >
          <div className="flex items-center gap-3">
            <span className="text-5xl">{current.icon}</span>
            <div>
              <p className="text-4xl font-extrabold text-ink-primary">{current.temperature}°</p>
              <p className="text-sm text-ink-secondary">{current.description}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-secondary">
            <span>מרגיש כמו {current.feelsLike}°</span>
            {current.precipitationProbability !== null && <span>· גשם {current.precipitationProbability}%</span>}
            <span>· רוח {current.windSpeed} קמ״ש</span>
            {current.humidity !== null && <span>· לחות {current.humidity}%</span>}
          </div>
        </motion.div>
      )}

      <div className="px-4">
        <h2 className="mb-2 text-sm font-bold text-ink-primary">תחזית לימי הטיול</h2>
        {dailyLoading && !daily && <p className="text-sm text-ink-muted animate-pulse-soft">🌤️ טוען תחזית...</p>}
        {dailyError && !daily && <p className="text-sm text-ink-muted">לא הצלחנו לטעון את התחזית</p>}
        <div className="flex flex-col gap-2">
          {plan.days.map((day) => {
            const forecast = dailyByDate.get(day.date);
            return (
              <div
                key={day.id}
                className="flex items-center justify-between rounded-xl2 border border-base-border bg-base-surface px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink-primary">{formatDayLabel(day.date)}</p>
                  <p className="text-xs text-ink-muted">{day.title}</p>
                </div>
                {forecast ? (
                  <div className="text-left">
                    <p className="text-lg">
                      {forecast.icon} {forecast.maxTemperature}° / {forecast.minTemperature}°
                    </p>
                    {forecast.precipitationProbability !== null && (
                      <p className="text-xs text-ink-muted">☔ {forecast.precipitationProbability}%</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted">תחזית עדיין לא זמינה</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
