import type { ReactNode } from 'react';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="text-base font-semibold text-ink-primary">{title}</p>
      <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
      {action}
    </div>
  );
}
