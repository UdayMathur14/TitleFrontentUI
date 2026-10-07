import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserIdentityService } from '../services/user-identity.service';

export const actorInterceptor: HttpInterceptorFn = (request, next) => {
  const method = request.method.toUpperCase();
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (!isMutation || !request.url.startsWith(environment.apiUrl)) return next(request);

  const userName = inject(UserIdentityService).requireUserName();
  return next(request.clone({ setHeaders: { 'X-User-Name': userName } }));
};
