export type TitleStatus = 'Clean' | 'Blocked' | string;
export type ImportCategory = 'Clean' | 'Blocked' | 'Invalid';

export interface TitleRecord {
  id: number;
  rowNumber: number;
  codeReference: string;
  invoiceNumber: string;
  title: string;
  titleYear: string;
  status: TitleStatus;
  referenceTitle: string;
  createdBy: string;
  createdOn: string | null;
}

export interface TitleFilter {
  page: number;
  pageSize: number;
  id?: number | null;
  codeReference?: string;
  invoiceNumber?: string;
  title?: string;
  titleYear?: string;
  status?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TitleDashboard {
  totalTitles: number;
  cleanTitles: number;
  blockedTitles: number;
  uploadedThisMonth: number;
  recentTitles: TitleRecord[];
}

export interface DropdownData {
  codeReferences: string[];
  invoiceNumbers: string[];
  titles: string[];
  years: string[];
}

export interface ImportRow {
  rowNumber: number;
  title: string;
  invoiceNumber: string;
  codeReference: string;
  titleYear: string;
  category: ImportCategory;
  message: string;
  blockedByInvoiceNumber?: string | null;
  blockedByCodeReference?: string | null;
  // Reserved for the requested UI column. The current backend contract does not return this value.
  blockedByRow?: number | null;
}

export interface ImportPreview {
  fileName: string;
  totalRows: number;
  cleanCount: number;
  blockedCount: number;
  invalidCount: number;
  rows: ImportRow[];
  importToken: string;
}

export interface CreateTitleRequest {
  codeReference: string;
  invoiceNumber: string;
  title: string;
  titleYear: string;
  createdBy?: string | null;
}

export type UpdateTitleRequest = CreateTitleRequest;
export interface DeleteTitlesResponse { deletedCount: number; }
export interface CommitImportResponse { savedCount: number; }
