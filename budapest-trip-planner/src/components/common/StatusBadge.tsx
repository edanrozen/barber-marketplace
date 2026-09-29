import clsx from 'clsx';
import type { PlaceStatus } from '@/types';

const STATUS_META: Record<PlaceStatus, { label: string; className: string }> = {
  AVAILABLE: { label: 'זמין', className: 'bg-accent-teal/15 text-accent-teal' },
  DONE: { label: 'עשינו ✓', className: 'bg-ink-muted/15 text-ink-secondary' },
  SKIPPED: { label: 'דילגנו', className: 'bg-ink-muted/15 text-ink-muted' },
  NOT_RELEVANT: { label: 'לא רלוונטי', className: 'bg-ink-muted/15 text-ink-muted' },
  CLOSED: { label: 'סגור', className: 'bg-accent-rose/15 text-accent-rose' },
  BOOKING_REQUIRED: { label: 'דורש הזמנה', className: 'bg-accent-gold/15 text-accent-gold' },
  NEEDS_VERIFICATION: { label: '⚠️ טעון אימות', className: 'bg-accent-rose/15 text-accent-rose' },
  CONFIRMED: { label: 'מאושר בלו״ז 🔒', className: 'bg-accent-violet/15 text-accent-violet' },
};

export function StatusBadge({ status }: { status: PlaceStatus }): JSX.Element {
  const meta = STATUS_META[status];
  return (
    <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-medium', meta.className)}>
      {meta.label}
    </span>
  );
}
