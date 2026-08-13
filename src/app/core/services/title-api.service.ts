import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTitleRequest, DropdownData, ImportPreview, PagedResult, TitleDashboard, TitleFilter, TitleRecord } from '../models/title.models';

const MOCK_TITLES: TitleRecord[] = [
  { id: 1048, codeReference: 'CR-4582', invoiceNumber: 'INV-2026-118', title: 'Global Intellectual Property Review', titleYear: '2026-27', status: 'Clean', createdBy: 'Uday Mathur', createdOn: '2026-08-13' },
  { id: 1047, codeReference: 'CR-4579', invoiceNumber: 'INV-2026-116', title: 'Asia Pacific Legal Directory', titleYear: '2026-27', status: 'Clean', createdBy: 'Anjali Singh', createdOn: '2026-08-12' },
  { id: 1046, codeReference: 'CR-4571', invoiceNumber: 'INV-2026-109', title: 'European Patent Leaders', titleYear: '2025-26', status: 'Blocked', createdBy: 'Uday Mathur', createdOn: '2026-08-12' },
  { id: 1045, codeReference: 'CR-4564', invoiceNumber: 'INV-2026-103', title: 'India Corporate Counsel Handbook', titleYear: '2025-26', status: 'Clean', createdBy: 'Rhea Kapoor', createdOn: '2026-08-11' },
  { id: 1044, codeReference: 'CR-4558', invoiceNumber: 'INV-2026-098', title: 'Trademark Strategy Annual', titleYear: '2025-26', status: 'Clean', createdBy: 'Anjali Singh', createdOn: '2026-08-10' },
  { id: 1043, codeReference: 'CR-4551', invoiceNumber: 'INV-2026-091', title: 'International Arbitration Index', titleYear: '2025-26', status: 'Clean', createdBy: 'Uday Mathur', createdOn: '2026-08-09' }
];

@Injectable({ providedIn: 'root' })
export class TitleApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/titles`;

  getDashboard(): Observable<TitleDashboard> {
    const fallback: TitleDashboard = { totalTitles: 1248, cleanTitles: 1174, blockedTitles: 74, uploadedThisMonth: 86, recentTitles: MOCK_TITLES.slice(0, 5) };
    return this.http.get<TitleDashboard>(`${this.base}/dashboard`).pipe(catchError(() => environment.useMockFallback ? of(fallback).pipe(delay(250)) : of(fallback)));
  }

  search(filter: TitleFilter): Observable<PagedResult<TitleRecord>> {
    let params = new HttpParams().set('page', filter.page).set('pageSize', filter.pageSize);
    Object.entries(filter).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '' && !['page', 'pageSize'].includes(key)) params = params.set(key, String(value)); });
    const filtered = MOCK_TITLES.filter(x => (!filter.title || x.title.toLowerCase().includes(filter.title.toLowerCase())) && (!filter.codeReference || x.codeReference.toLowerCase().includes(filter.codeReference.toLowerCase())) && (!filter.invoiceNumber || x.invoiceNumber.toLowerCase().includes(filter.invoiceNumber.toLowerCase())) && (!filter.titleYear || x.titleYear.includes(filter.titleYear)) && (!filter.status || x.status === filter.status));
    const fallback = { items: filtered, page: 1, pageSize: filter.pageSize, totalCount: filtered.length, totalPages: 1 };
    return this.http.get<PagedResult<TitleRecord>>(this.base, { params }).pipe(catchError(() => of(fallback).pipe(delay(220))));
  }

  getDropdowns(): Observable<DropdownData> {
    const fallback = { codeReferences: MOCK_TITLES.map(x => x.codeReference), invoiceNumbers: MOCK_TITLES.map(x => x.invoiceNumber), titles: MOCK_TITLES.map(x => x.title), years: ['2026-27', '2025-26', '2024-25'] };
    return this.http.get<DropdownData>(`${this.base}/dropdowns`).pipe(catchError(() => of(fallback)));
  }

  create(request: CreateTitleRequest) { return this.http.post<TitleRecord>(this.base, request); }
  update(id: number, request: CreateTitleRequest) { return this.http.put<TitleRecord>(`${this.base}/${id}`, request); }
  deleteMany(ids: number[]) { return this.http.request<void>('delete', this.base, { body: { ids } }); }
  previewImport(file: File) { const form = new FormData(); form.append('file', file); return this.http.post<ImportPreview>(`${this.base}/import/preview`, form); }
  commitImport(importToken: string) { return this.http.post(`${this.base}/import/commit`, { importToken }); }
  template() { return this.http.get(`${this.base}/template`, { responseType: 'blob' }); }
  export(filter: TitleFilter) { return this.http.get(`${this.base}/export`, { responseType: 'blob' }); }
}
