import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserIdentityService } from '../../core/services/user-identity.service';
import {
  MultipleInvoiceDecisionRequest,
  MultipleInvoiceDecisionResponse,
  MultipleTitleInvoiceFilter,
  MultipleTitleInvoiceResult
} from './multiple-title-invoice.models';

@Injectable({ providedIn: 'root' })
export class MultipleTitleInvoiceApiService {
  private readonly http = inject(HttpClient);
  private readonly identity = inject(UserIdentityService);

  // This workflow belongs only to regular Titles. Publication APIs remain isolated.
  private readonly base = `${environment.apiUrl}/titles/multiple-invoices`;

  search(filter: MultipleTitleInvoiceFilter): Observable<MultipleTitleInvoiceResult> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('pageSize', filter.pageSize);

    for (const [key, value] of Object.entries(filter)) {
      if (key === 'page' || key === 'pageSize' || value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }

    return this.http.get<MultipleTitleInvoiceResult>(this.base, { params });
  }

  decide(request: MultipleInvoiceDecisionRequest): Observable<MultipleInvoiceDecisionResponse> {
    return this.http.patch<MultipleInvoiceDecisionResponse>(`${this.base}/review`, {
      ...request,
      reviewedBy: this.identity.requireUserName()
    });
  }
}
