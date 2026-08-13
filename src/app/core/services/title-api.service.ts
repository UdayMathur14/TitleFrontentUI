import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTitleRequest, DropdownData, ImportPreview, PagedResult, TitleDashboard, TitleFilter, TitleRecord } from '../models/title.models';

@Injectable({ providedIn: 'root' })
export class TitleApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/titles`;

  getDashboard(): Observable<TitleDashboard> {
    return this.http.get<TitleDashboard>(`${this.base}/dashboard`);
  }

  search(filter: TitleFilter): Observable<PagedResult<TitleRecord>> {
    let params = new HttpParams().set('page', filter.page).set('pageSize', filter.pageSize);
    Object.entries(filter).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '' && !['page', 'pageSize'].includes(key)) params = params.set(key, String(value)); });
    return this.http.get<PagedResult<TitleRecord>>(this.base, { params });
  }

  getDropdowns(): Observable<DropdownData> {
    return this.http.get<DropdownData>(`${this.base}/dropdowns`);
  }

  create(request: CreateTitleRequest) { return this.http.post<TitleRecord>(this.base, request); }
  update(id: number, request: CreateTitleRequest) { return this.http.put<TitleRecord>(`${this.base}/${id}`, request); }
  deleteMany(ids: number[]) { return this.http.request<void>('delete', this.base, { body: { ids } }); }
  previewImport(file: File) { const form = new FormData(); form.append('file', file); return this.http.post<ImportPreview>(`${this.base}/import/preview`, form); }
  commitImport(importToken: string) { return this.http.post(`${this.base}/import/commit`, { importToken }); }
  template() { return this.http.get(`${this.base}/template`, { responseType: 'blob' }); }
  export(filter: TitleFilter) { return this.http.get(`${this.base}/export`, { responseType: 'blob' }); }
}
