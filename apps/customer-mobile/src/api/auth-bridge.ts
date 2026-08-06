/** Decouples the API client from the auth context: the client reads tokens + reacts to auth loss
 *  through this bridge, which the AuthProvider registers on mount. Avoids a circular import. */
export interface AuthBridge {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  onTokensRefreshed(accessToken: string, refreshToken: string): void;
  onAuthLost(): void;
}

let bridge: AuthBridge | null = null;
export const setAuthBridge = (b: AuthBridge): void => {
  bridge = b;
};
export const getAuthBridge = (): AuthBridge | null => bridge;
