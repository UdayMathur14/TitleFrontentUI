export type PublicationCategory = 'Clean' | 'Blocked' | 'Duplicate' | 'Invalid';

export interface PublicationRecord {
  id: number;
  rowNumber: number;
  codeReference: string;
  invoiceNumber: string;
  paperId: string;
  title: string;
  updatedTitle: string;
  createdBy: string;
  titleYear: string;
  createdOn: string | null;
  status: string;
}

export interface PublicationFilter {
  page: number;
  pageSize: number;
  id?: number | null;
  codeReference?: string;
  invoiceNumber?: string;
  paperId?: string;
  title?: string;
  titleYear?: string;
}

export interface ModifiedPublicationFilter {
  page: number;
  pageSize: number;
  id?: number | null;
  paperId?: string;
}

export interface PublicationDropdownData {
  codeReferences: string[];
  invoiceNumbers: string[];
  paperIds: string[];
  titles: string[];
  years: string[];
}

export interface PublicationImportRow {
  rowNumber: number;
  paperId: string;
  invoiceNumber: string;
  codeReference: string;
  title: string;
  titleYear: string;
  blockedId?: number | null;
  blockedByPaperId?: string | null;
  blockedByInvoiceNo?: string | null;
  blockedCodeRef?: string | null;
  blockedByTitle?: string | null;
  updatedTitle: string;
  status: string;
  category?: PublicationCategory;
}

export interface PublicationImportPreview {
  fileName: string;
  totalRows: number;
  cleanCount: number;
  blockedCount: number;
  duplicateCount: number;
  invalidCount?: number;
  cleanTitles: PublicationImportRow[];
  blockedTitles: PublicationImportRow[];
  duplicateTitlesInExcel: PublicationImportRow[];
  invalidTitles?: PublicationImportRow[];
  importToken: string;
}

export interface PagedPublicationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DeletePublicationResponse { deletedCount: number; }
export interface SavePublicationResponse { savedCount: number; }
