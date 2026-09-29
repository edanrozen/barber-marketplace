import {
  Bike,
  Coffee,
  Dices,
  Martini,
  PartyPopper,
  ShoppingBag,
  UtensilsCrossed,
  Landmark,
  Waves,
  Cross,
  IceCreamCone,
  type LucideIcon,
} from 'lucide-react';
import type { PlaceCategory } from '@/types';

const ICONS: Record<PlaceCategory, LucideIcon> = {
  food: UtensilsCrossed,
  cafe: Coffee,
  bar: Martini,
  club: PartyPopper,
  attraction: Landmark,
  shopping: ShoppingBag,
  adrenaline: Bike,
  water: Waves,
  casino: Dices,
  medical: Cross,
  dessert: IceCreamCone,
};

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  food: 'אוכל',
  cafe: 'קפה',
  bar: 'בר',
  club: 'מועדון',
  attraction: 'אטרקציה',
  shopping: 'שופינג',
  adrenaline: 'אדרנלין',
  water: 'מים',
  casino: '🎰 קזינו',
  medical: 'רפואי',
  dessert: '🍰 קינוחים',
};

interface CategoryIconProps {
  category: PlaceCategory;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 18, className }: CategoryIconProps): JSX.Element {
  const Icon = ICONS[category];
  return <Icon size={size} className={className} />;
}
