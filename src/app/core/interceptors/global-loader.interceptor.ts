import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { GlobalLoaderService } from '../services/global-loader.service';

export const globalLoaderInterceptor: HttpInterceptorFn = (request, next) => {
  const loader = inject(GlobalLoaderService);
  const requestId = loader.start(loaderMessage(request));
  return next(request).pipe(finalize(() => loader.stop(requestId)));
};

function loaderMessage(request: HttpRequest<unknown>) {
  const url = request.url.toLowerCase();
  if (url.includes('/template') || url.includes('/export')) return 'Preparing download…';
  if (request.method === 'DELETE') return 'Deleting records…';
  if (url.includes('/commit')) return 'Saving records…';
  if (request.body instanceof FormData) return 'Uploading spreadsheet…';
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') return 'Saving changes…';
  return 'Loading records…';
}
