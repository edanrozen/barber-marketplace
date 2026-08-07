export interface WorkingHourRow {
  readonly weekday: number;
  readonly startMinutes: number;
  readonly endMinutes: number;
}
export interface AvailabilityRepository {
  /** Active service duration for this professional, or null if the service is not theirs / inactive. */
  getServiceDuration(professionalProfileId: string, serviceId: string): Promise<number | null>;
  getWorkingHours(professionalProfileId: string): Promise<readonly WorkingHourRow[]>;
}
export const AVAILABILITY_REPOSITORY = Symbol('AVAILABILITY_REPOSITORY');
