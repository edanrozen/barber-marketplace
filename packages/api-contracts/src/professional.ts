/** Professional catalog API contracts (customer-facing, read-only). */
export interface ProfessionalServiceView {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly priceMinorUnits: number;
  readonly currency: string;
  readonly durationMinutes: number;
}
export interface PortfolioItemView {
  readonly id: string;
  readonly url: string;
  readonly caption: string | null;
}
export interface TravelAreaView {
  readonly zoneName: string;
  readonly radiusMeters: number;
  readonly etaMinMinutes: number | null;
  readonly etaMaxMinutes: number | null;
}
/** List-card shape. */
export interface ProfessionalSummary {
  readonly id: string;
  readonly displayName: string;
  readonly profilePhotoUrl: string | null;
  readonly ratingAvg: number;
  readonly ratingCount: number;
  readonly priceFromMinorUnits: number | null;
  readonly currency: string;
  readonly zoneName: string;
  readonly etaMinMinutes: number | null;
  readonly etaMaxMinutes: number | null;
  readonly availabilitySummary: string | null;
}
/** Full profile shape. */
export interface ProfessionalDetail {
  readonly id: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly profilePhotoUrl: string | null;
  readonly coverPhotoUrl: string | null;
  readonly ratingAvg: number;
  readonly ratingCount: number;
  readonly availabilitySummary: string | null;
  readonly travelArea: TravelAreaView;
  readonly services: readonly ProfessionalServiceView[];
  readonly portfolio: readonly PortfolioItemView[];
}
