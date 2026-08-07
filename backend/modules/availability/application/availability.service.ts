import { Inject, Injectable } from '@nestjs/common';
import { type AvailabilityDay, type AvailabilityResponse, type SlotView } from '@barber-marketplace/api-contracts';
import { NotFoundError, ValidationError } from '@barber-marketplace/errors';
import { computeDaySlotStarts, minutesToHHmm, type WorkingWindow } from '../domain/slots';
import { AVAILABILITY_REPOSITORY, type AvailabilityRepository } from '../ports/ports';

const SLOT_STEP_MINUTES = 15;
const LEAD_MINUTES = 120; // earliest bookable time today
const TZ = 'Asia/Jerusalem';
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

interface IlParts { date: string; weekday: number; minutes: number; }
function ilParts(d: Date): IlParts {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? '';
  const weekday = WEEKDAY_INDEX[get('weekday')] ?? 0;
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  return { date: `${get('year')}-${get('month')}-${get('day')}`, weekday, minutes };
}

@Injectable()
export class AvailabilityService {
  constructor(@Inject(AVAILABILITY_REPOSITORY) private readonly repo: AvailabilityRepository) {}

  async computeAvailability(professionalId: string, serviceId: string, days: number): Promise<AvailabilityResponse> {
    if (serviceId.length === 0) throw new ValidationError('service_required', 'יש לבחור שירות כדי לראות זמינות.');
    const duration = await this.repo.getServiceDuration(professionalId, serviceId);
    if (duration === null) throw new NotFoundError('service_not_found', 'השירות לא נמצא.');

    const hours = await this.repo.getWorkingHours(professionalId);
    const byWeekday = new Map<number, WorkingWindow[]>();
    for (const h of hours) {
      const list = byWeekday.get(h.weekday) ?? [];
      list.push({ startMinutes: h.startMinutes, endMinutes: h.endMinutes });
      byWeekday.set(h.weekday, list);
    }

    const now = new Date();
    const out: AvailabilityDay[] = [];
    for (let i = 0; i < days; i += 1) {
      const parts = ilParts(new Date(now.getTime() + i * 24 * 60 * 60 * 1000));
      const windows = byWeekday.get(parts.weekday);
      if (windows === undefined || windows.length === 0) continue;
      const earliest = i === 0 ? parts.minutes + LEAD_MINUTES : 0;
      const starts = computeDaySlotStarts({ windows, serviceDurationMinutes: duration, slotStepMinutes: SLOT_STEP_MINUTES, earliestStartMinutes: earliest });
      if (starts.length === 0) continue;
      const slots: SlotView[] = starts.map((s) => ({ start: minutesToHHmm(s), end: minutesToHHmm(s + duration) }));
      out.push({ date: parts.date, weekday: parts.weekday, slots });
    }
    return { professionalId, serviceId, durationMinutes: duration, days: out };
  }
}
