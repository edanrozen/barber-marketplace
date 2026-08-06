/** Profile API contracts (Epic E5). */
export interface MeResponse {
  readonly id: string;
  readonly phone: string;
  readonly role: string;
  readonly displayName: string | null;
}
export interface UpdateProfileBody {
  readonly displayName: string;
}
