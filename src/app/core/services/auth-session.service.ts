import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermissionService } from './permission.service';

interface UmsProfile extends Record<string, unknown> {
  accessToken?: string;
  permissions?: unknown;
  userName?: string;
  code?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly permissionService = inject(PermissionService);

  /**
   * Runs before Angular renders the first route. UMS opens this application with
   * `data` (its bearer token) and `appId`; the returned application profile is
   * then used for both UI permissions and Title API authentication.
   */
  async initialize(): Promise<void> {
    const url = new URL(window.location.href);
    const incomingToken = url.searchParams.get('data')?.trim() ?? '';
    const incomingAppId = url.searchParams.get('appId')?.trim() ?? '';

    if (incomingToken) localStorage.setItem('umsToken', incomingToken);
    if (incomingAppId) localStorage.setItem('umsAppId', incomingAppId);
    if (incomingToken || incomingAppId) this.removeHandoffFromAddressBar(url);

    const umsToken = incomingToken || localStorage.getItem('umsToken')?.trim() || '';
    const appId = incomingAppId || localStorage.getItem('umsAppId')?.trim() || '';

    if (!umsToken || !appId) {
      this.permissionService.refresh();
      return;
    }

    try {
      const response = await firstValueFrom(this.http.post<UmsProfile>(
        environment.umsPermissionUrl,
        { appId },
        { headers: new HttpHeaders({ Authorization: `Bearer ${umsToken}` }) }
      ));

      const profile = this.normaliseProfile(response);
      localStorage.setItem('profile', JSON.stringify(profile));
      localStorage.setItem('userName', profile.userName ?? '');
      this.permissionService.refresh();
    } catch (error) {
      // Keep an existing application session usable during a temporary UMS
      // outage. The Title API still validates that JWT and its expiry itself.
      this.permissionService.refresh();
      console.error('Unable to refresh UMS permissions.', error);
    }
  }

  private normaliseProfile(response: UmsProfile): UmsProfile {
    const source = response as Record<string, unknown>;
    return {
      ...response,
      accessToken: this.stringValue(source['accessToken'] ?? source['AccessToken']),
      permissions: source['permissions'] ?? source['Permissions'] ?? [],
      userName: this.stringValue(source['userName'] ?? source['UserName'])
    };
  }

  private removeHandoffFromAddressBar(url: URL): void {
    url.searchParams.delete('data');
    url.searchParams.delete('appId');
    window.history.replaceState(window.history.state, document.title, `${url.pathname}${url.search}${url.hash}`);
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }
}

