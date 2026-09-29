import { Plane, BedDouble, UtensilsCrossed, Landmark, ShoppingBag, PartyPopper, Car, Clock, MoreHorizontal, type LucideIcon } from 'lucide-react';
import type { ScheduleItemType } from '@/types';

export const TYPE_ICON: Record<ScheduleItemType, LucideIcon> = {
  FLIGHT: Plane,
  HOTEL: BedDouble,
  RESTAURANT: UtensilsCrossed,
  ATTRACTION: Landmark,
  SHOPPING: ShoppingBag,
  NIGHTLIFE: PartyPopper,
  TRANSPORT: Car,
  FREE_TIME: Clock,
  OTHER: MoreHorizontal,
};

export const TYPE_LABEL: Record<ScheduleItemType, string> = {
  FLIGHT: 'טיסה',
  HOTEL: 'מלון',
  RESTAURANT: 'מסעדה',
  ATTRACTION: 'אטרקציה',
  SHOPPING: 'שופינג',
  NIGHTLIFE: 'חיי לילה',
  TRANSPORT: 'נסיעה',
  FREE_TIME: 'זמן פנוי',
  OTHER: 'אחר',
};

export const SCHEDULE_ITEM_TYPES = Object.keys(TYPE_LABEL) as ScheduleItemType[];
