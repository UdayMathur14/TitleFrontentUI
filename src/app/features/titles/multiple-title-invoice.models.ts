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
  reviewDecision?: string | null;
  reviewedBy?: string | null;
  reviewedOn?: string | null;
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
  status?: string;
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
  reviewedBy?: string | null;
}

export interface MultipleInvoiceDecisionResponse {
  decision: 'Approved' | 'Rejected' | string;
  status: string;
  updatedCount: number;
  reviewedBy?: string;
  reviewedOn?: string;
}
