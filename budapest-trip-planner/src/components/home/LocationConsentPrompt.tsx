import { MapPin } from 'lucide-react';

interface LocationConsentPromptProps {
  onAllow: () => void;
  onNotNow: () => void;
}

/**
 * Our own plain-language ask, shown once before the browser's native
 * geolocation permission dialog ever appears. Answered once (either way)
 * and never shown again — see `userState.locationConsent`.
 */
export function LocationConsentPrompt({ onAllow, onNotNow }: LocationConsentPromptProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-xl2 border border-base-border bg-base-surface2 p-4">
      <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-secondary">
        <MapPin size={16} className="mt-0.5 shrink-0 text-accent-gold" />
        📍 כדי לתת לכם המלצה מדויקת לפי המיקום שלכם, אפשר להשתמש במיקום?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAllow}
          className="flex-1 rounded-full bg-accent-gold py-2 text-sm font-bold text-base-bg transition-transform active:scale-95"
        >
          אפשר מיקום
        </button>
        <button
          type="button"
          onClick={onNotNow}
          className="flex-1 rounded-full border border-base-border py-2 text-sm font-medium text-ink-secondary hover:border-accent-gold/40"
        >
          לא עכשיו
        </button>
      </div>
    </div>
  );
}
