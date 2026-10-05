import { Injectable, signal } from '@angular/core';

type PermissionSource = Record<string, unknown> | null;

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly permissionSet = signal<ReadonlySet<string>>(new Set());

  constructor() {
    this.refresh();
    window.addEventListener('storage', event => {
      if (!event.key || ['profile', 'permissions', 'umsToken'].includes(event.key)) {
        this.refresh();
      }
    });
  }

  /** Re-read permissions after login/UMS validation stores a new profile. */
  refresh(): void {
    const permissions = this.readPermissions().map(permission => this.normalise(permission));
    this.permissionSet.set(new Set(permissions.filter(Boolean)));
  }

  has(permission: string): boolean {
    return this.permissionSet().has(this.normalise(permission));
  }

  hasAny(permissions: readonly string[]): boolean {
    return permissions.some(permission => this.has(permission));
  }

  private readPermissions(): string[] {
    const profiles = [
      this.readJson(localStorage.getItem('profile')),
      this.readJson(sessionStorage.getItem('profile')),
      this.readJsonCookie('profile')
    ];

    const directPermissions = [
      this.readJson(localStorage.getItem('permissions')),
      this.readJson(sessionStorage.getItem('permissions')),
      this.readJsonCookie('permissions')
    ];

    const permissions = [
      ...profiles.flatMap(profile => this.permissionsFromProfile(profile)),
      ...directPermissions.flatMap(value => this.permissionValues(value))
    ];

    if (permissions.length) return permissions;

    const profile = profiles.find(value => value && typeof value === 'object');
    const accessToken = profile && typeof profile === 'object'
      ? this.stringValue(profile['accessToken']) || this.stringValue(profile['token'])
      : '';

    return this.permissionsFromJwt(accessToken);
  }

  private permissionsFromProfile(profile: PermissionSource): string[] {
    if (!profile || typeof profile !== 'object') return [];

    const user = profile['user'];
    return [
      ...this.permissionValues(profile['permissions']),
      ...this.permissionValues(profile['permission']),
      ...this.permissionValues(profile['securityGroups']),
      ...(user && typeof user === 'object'
        ? this.permissionValues((user as Record<string, unknown>)['permissions'])
        : [])
    ];
  }

  private permissionValues(value: unknown): string[] {
    if (typeof value === 'string') {
      const parsed = this.readJson(value);
      if (parsed !== null && parsed !== value) return this.permissionValues(parsed);
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }

    if (!Array.isArray(value)) return [];

    return value.flatMap(item => {
      if (typeof item === 'string') return [item];
      if (!item || typeof item !== 'object') return [];
      const permission = item as Record<string, unknown>;
      const name = permission['permissionName'] ?? permission['name'] ?? permission['key'];
      return typeof name === 'string' ? [name] : [];
    });
  }

  private permissionsFromJwt(token: string): string[] {
    if (!token) return [];

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return [];
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64)))) as Record<string, unknown>;
      return [
        ...this.permissionValues(payload['permissions']),
        ...this.permissionValues(payload['permission']),
        ...this.permissionValues(payload['Permission']),
        ...this.permissionValues(payload['securityGroups'])
      ];
    } catch {
      return [];
    }
  }

  private readJson(value: string | null): any {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private readJsonCookie(name: string): PermissionSource {
    const prefix = `${encodeURIComponent(name)}=`;
    const value = document.cookie
      .split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith(prefix))
      ?.slice(prefix.length);

    if (!value) return null;
    return this.readJson(decodeURIComponent(value));
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private normalise(permission: string): string {
    return permission.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
