import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CommitImportResponse,
  CreateTitleRequest,
  DeleteTitlesResponse,
  DropdownData,
  ImportPreview,
  PagedResult,
  TitleDashboard,
  TitleFilter,
  TitleRecord,
  UpdateTitleRequest
} from '../models/title.models';

@Injectable({ providedIn: 'root' })
export class TitleApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/titles`;

  search(filter: TitleFilter): Observable<PagedResult<TitleRecord>> {
    return this.http.get<PagedResult<TitleRecord>>(this.base, { params: this.filterParams(filter, true) });
  }

  getById(id: number): Observable<TitleRecord> {
    return this.http.get<TitleRecord>(`${this.base}/${id}`);
  }

  create(request: CreateTitleRequest): Observable<TitleRecord> {
    return this.http.post<TitleRecord>(this.base, request);
  }

  update(id: number, request: UpdateTitleRequest): Observable<TitleRecord> {
    return this.http.put<TitleRecord>(`${this.base}/${id}`, request);
  }

  deleteOne(id: number): Observable<DeleteTitlesResponse> {
    return this.http.delete<DeleteTitlesResponse>(`${this.base}/${id}`);
  }

  deleteMany(ids: number[]): Observable<DeleteTitlesResponse> {
    return this.http.request<DeleteTitlesResponse>('delete', this.base, { body: { ids } });
  }

  getDashboard(): Observable<TitleDashboard> {
    return this.http.get<TitleDashboard>(`${this.base}/dashboard`);
  }

  getDropdowns(query?: string, limit = 10_000): Observable<DropdownData> {
    let params = new HttpParams().set('limit', limit);
    if (query?.trim()) params = params.set('query', query.trim());
    return this.http.get<DropdownData>(`${this.base}/dropdowns`, { params });
  }

  previewImport(file: File): Observable<ImportPreview> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImportPreview>(`${this.base}/import/preview`, form);
  }

  commitImport(importToken: string): Observable<CommitImportResponse> {
    return this.http.post<CommitImportResponse>(`${this.base}/import/commit`, { importToken });
  }

  template(): Observable<Blob> {
    return this.http.get(`${this.base}/template`, { responseType: 'blob' });
  }

  export(filter: TitleFilter): Observable<Blob> {
    return this.http.get(`${this.base}/export`, { params: this.filterParams(filter, false), responseType: 'blob' });
  }

  private filterParams(filter: TitleFilter, includePaging: boolean) {
    let params = new HttpParams();
    if (includePaging) params = params.set('page', filter.page).set('pageSize', filter.pageSize);

    for (const [key, value] of Object.entries(filter)) {
      if (['page', 'pageSize'].includes(key) || value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }
}
