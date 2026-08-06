import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthenticatedUser } from '@barber-marketplace/api-contracts';
import { setAuthBridge } from '../api/auth-bridge';
import { requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp, logout as apiLogout } from '../api/auth-api';
import { getMe } from '../api/profile-api';
import { clearTokens, loadTokens, saveTokens } from './session-storage';

type Status = 'loading' | 'unauthenticated' | 'authenticated';

interface AuthState {
  status: Status;
  user: AuthenticatedUser | null;
  requestOtp(phone: string): Promise<{ challengeId: string }>;
  verifyOtp(challengeId: string, code: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const tokens = useRef<{ accessToken: string | null; refreshToken: string | null }>({ accessToken: null, refreshToken: null });

  useEffect(() => {
    // Register the bridge so the API client can read tokens + react to auth loss (e.g. failed refresh).
    setAuthBridge({
      getAccessToken: () => tokens.current.accessToken,
      getRefreshToken: () => tokens.current.refreshToken,
      onTokensRefreshed: (accessToken, refreshToken) => {
        tokens.current = { accessToken, refreshToken };
        void saveTokens({ accessToken, refreshToken });
      },
      onAuthLost: () => {
        tokens.current = { accessToken: null, refreshToken: null };
        void clearTokens();
        setUser(null);
        setStatus('unauthenticated');
      },
    });
    void bootstrap();
  }, []);

  // Session persistence: restore tokens on cold start and validate them against /me.
  async function bootstrap(): Promise<void> {
    const stored = await loadTokens();
    if (stored === null) {
      setStatus('unauthenticated');
      return;
    }
    tokens.current = stored;
    try {
      const me = await getMe();
      setUser({ id: me.id, phone: me.phone, role: me.role });
      setStatus('authenticated');
    } catch {
      await clearTokens();
      tokens.current = { accessToken: null, refreshToken: null };
      setStatus('unauthenticated');
    }
  }

  async function requestOtp(phone: string): Promise<{ challengeId: string }> {
    const res = await apiRequestOtp(phone);
    return { challengeId: res.challengeId };
  }

  async function verifyOtp(challengeId: string, code: string): Promise<void> {
    const session = await apiVerifyOtp(challengeId, code);
    tokens.current = { accessToken: session.tokens.accessToken, refreshToken: session.tokens.refreshToken };
    await saveTokens({ accessToken: session.tokens.accessToken, refreshToken: session.tokens.refreshToken });
    setUser(session.user);
    setStatus('authenticated');
  }

  async function logout(): Promise<void> {
    const refreshToken = tokens.current.refreshToken;
    if (refreshToken !== null) {
      try {
        await apiLogout(refreshToken);
      } catch {
        // Best-effort server revoke; local session is cleared regardless.
      }
    }
    await clearTokens();
    tokens.current = { accessToken: null, refreshToken: null };
    setUser(null);
    setStatus('unauthenticated');
  }

  const value = useMemo<AuthState>(
    () => ({ status, user, requestOtp, verifyOtp, logout }),
    [status, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
