'use client';

import { salesFetchJson } from './http';

export type UserInfo = {
  username: string;
  email?: string | null;
  displayName?: string | null;
};

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  AccessToken?: string;
  RefreshToken?: string;
};

const AccessTokenKey = 'auth_access_token';
const RefreshTokenKey = 'auth_refresh_token';
const AccountingYearKey = 'selected_accounting_year';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function decodeJwtPayload(token: string): any | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = safeGet(AccessTokenKey);
      this.refreshToken = safeGet(RefreshTokenKey);
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getUser(): UserInfo | null {
    if (!this.accessToken) return null;
    const payload = decodeJwtPayload(this.accessToken);
    if (!payload) return null;

    const username =
      payload['preferred_username'] ??
      payload['unique_name'] ??
      payload['name'] ??
      payload['sub'];
    if (!username) return null;
    return {
      username: String(username),
      email: payload['email'] ? String(payload['email']) : null,
      displayName: payload['display_name'] ? String(payload['display_name']) : null,
    };
  }

  async login(username: string, password: string) {
    const data = await salesFetchJson<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const access = data.accessToken ?? data.AccessToken;
    const refresh = data.refreshToken ?? data.RefreshToken ?? null;
    if (!access) throw new Error('Login succeeded but access token is missing');

    this.accessToken = access;
    this.refreshToken = refresh;
    safeSet(AccessTokenKey, access);
    safeSet(RefreshTokenKey, refresh);
  }

  async logout() {
    // Best-effort; always clear local tokens.
    try {
      const refreshToken = this.refreshToken;
      if (refreshToken) {
        await salesFetchJson('/api/auth/logout', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // ignore
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
      safeSet(AccessTokenKey, null);
      safeSet(RefreshTokenKey, null);
    }
  }

  setAccountingYear(year: string | null) {
    safeSet(AccountingYearKey, year);
  }

  getAccountingYear(): string | null {
    return safeGet(AccountingYearKey);
  }
}

export const authService = new AuthService();
