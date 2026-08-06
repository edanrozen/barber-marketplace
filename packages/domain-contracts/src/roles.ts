/** Identity roles — mirrors the DB user_role enum. Category-agnostic: the provider is a `professional`. */
export const USER_ROLES = ['customer', 'professional', 'support', 'moderator', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
