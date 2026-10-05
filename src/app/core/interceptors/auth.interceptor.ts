import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl) || request.headers.has('Authorization')) {
    return next(request);
  }

  let token = '';
  try {
    const profile = JSON.parse(localStorage.getItem('profile') ?? '{}') as Record<string, unknown>;
    token = typeof profile['accessToken'] === 'string' ? profile['accessToken'] : '';
  } catch {
    token = '';
  }

  return next(token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request);
};

