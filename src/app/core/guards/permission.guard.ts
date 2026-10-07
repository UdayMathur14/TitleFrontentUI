import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TITLE_ROUTE_ACCESS } from '../auth/title-route-access';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  permissionService.refresh();

  const required = route.data['permissions'] as readonly string[] | undefined;
  if (!required?.length || permissionService.hasAny(required)) return true;

  if (state.url === '/dashboard') {
    const firstAllowed = TITLE_ROUTE_ACCESS.find(item => permissionService.hasAny(item.permissions));
    if (firstAllowed) return router.parseUrl(firstAllowed.path);
  }

  return router.parseUrl('/access-denied');
};
