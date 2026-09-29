import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * The app must stay usable even when something unexpected breaks — never a
 * blank white screen. Catches render-time errors anywhere below it and
 * shows a plain, actionable fallback instead. `App` remounts this per
 * route (keyed by pathname) so navigating away from whatever broke always
 * recovers cleanly.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-8 py-16 text-center">
        <span className="text-4xl">😕</span>
        <p className="text-base font-semibold text-ink-primary">משהו נתקע</p>
        <p className="text-sm leading-relaxed text-ink-secondary">
          קרתה תקלה לא צפויה במסך הזה. אפשר לנסות לרענן, שאר האפליקציה עדיין עובדת.
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="flex items-center gap-1.5 rounded-full bg-accent-gold px-4 py-2 text-sm font-bold text-base-bg"
        >
          <RefreshCw size={14} />
          ניסיון נוסף
        </button>
      </div>
    );
  }
}
