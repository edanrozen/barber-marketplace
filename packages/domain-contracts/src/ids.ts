/** Nominal (branded) identifier types so IDs of different entities aren't interchangeable. */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, 'UserId'>;
export type CustomerProfileId = Brand<string, 'CustomerProfileId'>;
export type ProfessionalProfileId = Brand<string, 'ProfessionalProfileId'>;
export type ZoneId = Brand<string, 'ZoneId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type AddressId = Brand<string, 'AddressId'>;

/** Cast a raw string into a branded id at a trust boundary (e.g. after validation). */
export const brand = <B extends string>(value: string): Brand<string, B> => value as Brand<string, B>;
