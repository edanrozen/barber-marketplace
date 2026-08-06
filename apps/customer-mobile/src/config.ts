import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };
/** Backend base URL. Overridable per environment via app.json `extra.apiBaseUrl`. */
export const API_BASE_URL: string = extra.apiBaseUrl ?? 'http://localhost:3000';
export const API_VERSION = 'v1';
