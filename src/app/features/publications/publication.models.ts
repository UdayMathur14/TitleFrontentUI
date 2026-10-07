export type PublicationCategory = 'Clean' | 'Blocked' | 'Invalid';

export interface PublicationRecord {
  id: number;
  rowNumber: number;
  codeReference: string;
  invoiceNumber?: string;
  lotNumber?: string;
  lotNo?: string;
  paperId: string;
  title: string;
  updatedTitle: string;
  updatedTitleBy?: string | null;
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
  invoiceNumbers?: string[];
  lotNumbers?: string[];
  lotNos?: string[];
  paperIds: string[];
  titles: string[];
  years: string[];
}

export interface PublicationImportRow {
  rowNumber: number;
  paperId: string;
  invoiceNumber?: string;
  lotNumber?: string;
  lotNo?: string;
  codeReference: string;
  title: string;
  titleYear: string;
  category: PublicationCategory;
  message: string;
  blockedById?: number | null;
  blockedByRow?: number | null;
  blockedByPaperId?: string | null;
  blockedByLotNumber?: string | null;
  blockedByCodeReference?: string | null;
  blockedByTitle?: string | null;

  // Backward-compatible aliases used by an earlier publication API build.
  blockedId?: number | null;
  blockedByInvoiceNo?: string | null;
  blockedByLotNo?: string | null;
  blockedCodeRef?: string | null;
  updatedTitle?: string;
  status?: string;
}

export interface PublicationImportPreview {
  fileName: string;
  totalRows: number;
  cleanCount: number;
  blockedCount: number;
  duplicateCount?: number;
  invalidCount?: number;
  rows?: PublicationImportRow[];

  // Backward-compatible split collections used by an earlier API build.
  cleanTitles?: PublicationImportRow[];
  blockedTitles?: PublicationImportRow[];
  duplicateTitlesInExcel?: PublicationImportRow[];
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

export interface PublicationYearOverview {
  titleYear: string;
  totalTitles: number;
  modifiedTitles: number;
}

export interface PublicationOverview {
  totalTitles: number;
  cleanTitles: number;
  modifiedTitles: number;
  originalTitles: number;
  uploadedThisMonth: number;
  uniqueLotNumbers: number;
  uniquePaperIds: number;
  uniqueCodeReferences: number;
  financialYears: number;
  modifiedPercentage: number;
  yearBreakdown: PublicationYearOverview[];
  recentTitles: PublicationRecord[];
}

export interface DeletePublicationResponse { deletedCount: number; }
export interface SavePublicationResponse { savedCount: number; }
