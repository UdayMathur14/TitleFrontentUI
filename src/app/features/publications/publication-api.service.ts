import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DeletePublicationResponse,
  ModifiedPublicationFilter,
  PagedPublicationResult,
  PublicationDropdownData,
  PublicationFilter,
  PublicationImportPreview,
  PublicationRecord,
  SavePublicationResponse
} from './publication.models';

@Injectable({ providedIn: 'root' })
export class PublicationApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/publication-titles`;

  search(filter: PublicationFilter): Observable<PagedPublicationResult<PublicationRecord>> {
    return this.http.get<PagedPublicationResult<PublicationRecord>>(this.base, { params: this.params(filter) });
  }

  deleteMany(ids: number[]): Observable<DeletePublicationResponse> {
    return this.http.request<DeletePublicationResponse>('delete', this.base, { body: { ids } });
  }

  dropdowns(query?: string, limit = 1000): Observable<PublicationDropdownData> {
    let params = new HttpParams().set('limit', limit);
    if (query?.trim()) params = params.set('query', query.trim());
    return this.http.get<PublicationDropdownData>(`${this.base}/dropdowns`, { params });
  }

  previewImport(file: File): Observable<PublicationImportPreview> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<PublicationImportPreview>(`${this.base}/import/preview`, form);
  }

  commitImport(importToken: string): Observable<SavePublicationResponse> {
    return this.http.post<SavePublicationResponse>(`${this.base}/import/commit`, { importToken });
  }

  template(): Observable<Blob> {
    return this.http.get(`${this.base}/template`, { responseType: 'blob' });
  }

  searchModified(filter: ModifiedPublicationFilter): Observable<PagedPublicationResult<PublicationRecord>> {
    return this.http.get<PagedPublicationResult<PublicationRecord>>(`${this.base}/modified`, { params: this.params(filter) });
  }

  uploadModified(file: File): Observable<SavePublicationResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<SavePublicationResponse>(`${this.base}/modified/import`, form);
  }

  modifiedTemplate(): Observable<Blob> {
    return this.http.get(`${this.base}/modified/template`, { responseType: 'blob' });
  }

  private params(filter: PublicationFilter | ModifiedPublicationFilter) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }
}
