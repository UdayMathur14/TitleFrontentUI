export interface TitleRecord {
  id: number;
  codeReference: string;
  invoiceNumber: string;
  title: string;
  titleYear: string;
  status: 'Clean' | 'Blocked';
  referenceTitle?: string;
  createdBy: string;
  createdOn: string;
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

export interface PagedResult<T> { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number; }
export interface TitleDashboard { totalTitles: number; cleanTitles: number; blockedTitles: number; uploadedThisMonth: number; recentTitles: TitleRecord[]; }
export interface DropdownData { codeReferences: string[]; invoiceNumbers: string[]; titles: string[]; years: string[]; }
export interface ImportRow extends Omit<Partial<TitleRecord>, 'status'> {
  rowNumber: number;
  category: 'Clean' | 'Blocked' | 'Invalid';
  status: string;
  blockedByRow?: number | null;
  blockedByInvoiceNumber?: string | null;
  blockedByCodeReference?: string | null;
}
export interface ImportPreview { fileName: string; totalRows: number; cleanCount: number; blockedCount: number; invalidCount: number; rows: ImportRow[]; importToken: string; }
export interface CreateTitleRequest { codeReference: string; invoiceNumber: string; title: string; titleYear: string; createdBy: string; }
