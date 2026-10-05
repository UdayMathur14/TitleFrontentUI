export type MultipleInvoiceStatus = 'PendingApproval' | string;
export type MultipleInvoiceDecision = 'Approve' | 'Reject';

export interface MultipleTitleInvoiceRecord {
  id: number;
  titleId?: number | null;
  rowNumber?: number | null;
  codeReference: string;
  title: string;
  invoiceNumber: string;
  titleYear?: string | null;
  status: MultipleInvoiceStatus;
  existingTitleId?: number | null;
  existingRowNumber?: number | null;
  existingInvoiceNumber?: string | null;
  existingCodeReference?: string | null;
  existingStatus?: string | null;
  createdBy?: string | null;
  createdOn?: string | null;
}

export interface MultipleTitleInvoiceFilter {
  page: number;
  pageSize: number;
  codeReference?: string;
  title?: string;
  invoiceNumber?: string;
  titleYear?: string;
}

export interface MultipleTitleInvoiceResult {
  items: MultipleTitleInvoiceRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MultipleInvoiceDecisionRequest {
  ids: number[];
  decision: MultipleInvoiceDecision;
}

export interface MultipleInvoiceDecisionResponse {
  decision: MultipleInvoiceDecision;
  status: string;
  updatedCount: number;
}
