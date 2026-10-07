import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserIdentityService {
  private readonly loginUrl = 'http://192.168.29.101:90';

  currentUserName(): string {
    const storedName = this.clean(this.safeGet(localStorage, 'userName'));
    if (storedName) return storedName;

    const profiles = [
      this.readObject(this.safeGet(localStorage, 'profile')),
      this.readObject(this.safeGet(sessionStorage, 'profile'))
    ];

    for (const profile of profiles) {
      const profileName = this.clean(profile?.['userName'] ?? profile?.['UserName'] ?? profile?.['name']);
      if (profileName) return this.remember(profileName);
    }

    const tokens = [
      ...profiles.map(profile => this.clean(profile?.['accessToken'] ?? profile?.['AccessToken'] ?? profile?.['token'])),
      this.clean(this.safeGet(localStorage, 'umsToken'))
    ];

    for (const token of tokens) {
      const tokenName = this.nameFromToken(token);
      if (tokenName) return this.remember(tokenName);
    }

    return '';
  }

  requireUserName(): string {
    const userName = this.currentUserName();
    if (userName) return userName;

    this.logout();
    throw new Error('A valid user name is required for this activity.');
  }

  ensureUserNameOrLogout(): boolean {
    if (this.currentUserName()) return true;
    this.logout();
    return false;
  }

  logout(): void {
    for (const storage of [localStorage, sessionStorage]) {
      try {
        storage.removeItem('profile');
        storage.removeItem('permissions');
        storage.removeItem('umsToken');
        storage.removeItem('umsAppId');
        storage.removeItem('userName');
      } catch { /* Storage can be unavailable in restricted browser modes. */ }
    }
    window.location.replace(this.loginUrl);
  }

  private nameFromToken(token: string): string {
    if (!token) return '';

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return '';
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
      return this.clean(
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? payload['name']
        ?? payload['unique_name']
        ?? payload['preferred_username']
      );
    } catch {
      return '';
    }
  }

  private remember(userName: string): string {
    try { localStorage.setItem('userName', userName); } catch { /* Best effort only. */ }
    return userName;
  }

  private readObject(value: string): Record<string, unknown> | null {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }

  private safeGet(storage: Storage, key: string): string {
    try { return storage.getItem(key) ?? ''; } catch { return ''; }
  }

  private clean(value: unknown): string {
    if (typeof value !== 'string') return '';
    const clean = value.trim();
    return !clean || ['null', 'undefined'].includes(clean.toLowerCase()) ? '' : clean.slice(0, 240);
  }
}
