import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  CloudUpload,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Info,
  LucideAngularModule,
  Save,
  ScanSearch,
  ShieldAlert,
  Trash2,
  XCircle
} from 'lucide-angular';
import { apiErrorMessage } from '../../shared/api-error';
import { saveBlob } from '../../shared/download';
import { PublicationApiService } from './publication-api.service';
import { PublicationCategory, PublicationImportPreview, PublicationImportRow } from './publication.models';

type ResultView = 'All' | PublicationCategory;

@Component({
  selector: 'app-publication-import',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './publication-import.component.html',
  styleUrl: './publication-import.component.scss'
})
export class PublicationImportComponent {
  private readonly api = inject(PublicationApiService);

  readonly icons = {
    ArrowLeft, CheckCircle2, CircleAlert, CloudUpload, Download, FileCheck2,
    FileSpreadsheet, Info, Save, ScanSearch, ShieldAlert, Trash2, XCircle
  };

  readonly file = signal<File | null>(null);
  readonly drag = signal(false);
  readonly loading = signal(false);
  readonly preview = signal<PublicationImportPreview | null>(null);
  readonly resultView = signal<ResultView>('All');
  readonly saved = signal(false);
  readonly error = signal('');
  readonly toast = signal('');

  readonly allRows = computed<PublicationImportRow[]>(() => {
    const value = this.preview();
    if (!value) return [];

    // The current publication API returns a single Rows collection. Keep the
    // split collections as a fallback so older deployed API builds still work.
    if (value.rows) return value.rows.map(row => this.normalizeRow(row));

    return [
      ...(value.cleanTitles ?? []).map(row => ({ ...row, category: 'Clean' as const, message: row.message || 'Clean' })),
      ...(value.blockedTitles ?? []).map(row => ({ ...row, category: 'Blocked' as const, message: row.message || 'Blocked' })),
      ...(value.duplicateTitlesInExcel ?? []).map(row => ({ ...row, category: 'Invalid' as const, message: row.message || 'Duplicate row in Excel' })),
      ...(value.invalidTitles ?? []).map(row => ({ ...row, category: 'Invalid' as const }))
    ];
  });

  readonly visibleRows = computed(() => {
    const view = this.resultView();
    return view === 'All' ? this.allRows() : this.allRows().filter(row => row.category === view);
  });
  readonly committableCount = computed(() => {
    const preview = this.preview();
    if (!preview) return 0;
    const countFromRows = this.allRows().filter(row => row.category === 'Clean').length;
    const countFromSummary = Number(preview.cleanCount) || 0;
    return Math.max(countFromRows, countFromSummary);
  });
  readonly canCommit = computed(() =>
    !!this.preview()?.importToken && !this.loading() && !this.saved()
  );

  openPicker(input: HTMLInputElement) {
    input.value = '';
    input.click();
  }

  choose(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.setFile(input.files[0]);
  }

  drop(event: DragEvent) {
    event.preventDefault();
    this.drag.set(false);
    if (event.dataTransfer?.files[0]) this.setFile(event.dataTransfer.files[0]);
  }

  setFile(file: File) {
    if (!/\.xlsx$/i.test(file.name)) {
      this.notify('Please choose an Excel file in .xlsx format.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.notify('The Excel file cannot be larger than 50 MB.');
      return;
    }
    this.file.set(file);
    this.preview.set(null);
    this.resultView.set('All');
    this.saved.set(false);
    this.error.set('');
  }

  removeFile(event?: Event) {
    event?.stopPropagation();
    this.file.set(null);
    this.preview.set(null);
    this.resultView.set('All');
    this.saved.set(false);
    this.error.set('');
  }

  testUpload() {
    const file = this.file();
    if (!file || this.loading()) return;

    this.loading.set(true);
    this.error.set('');
    this.saved.set(false);
    this.api.previewImport(file).subscribe({
      next: value => {
        this.preview.set(value);
        this.resultView.set('All');
        this.loading.set(false);
        this.notify('Test upload completed. Review the validation result before saving.');
      },
      error: error => {
        this.loading.set(false);
        this.preview.set(null);
        this.error.set(apiErrorMessage(error, 'Publication spreadsheet validation failed.'));
      }
    });
  }

  commit() {
    const value = this.preview();
    if (!value || !this.canCommit()) return;

    this.loading.set(true);
    this.error.set('');
    this.api.commitImport(value.importToken).subscribe({
      next: result => {
        this.loading.set(false);
        this.saved.set(true);
        this.notify(`${result.savedCount} clean publication titles saved successfully.`);
      },
      error: error => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(error, 'Publication upload and save failed.'));
      }
    });
  }

  downloadTemplate() {
    this.api.template().subscribe({
      next: blob => saveBlob(blob, 'UploadPublicationTitles.xlsx'),
      error: error => this.notify(apiErrorMessage(error, 'Publication template could not be downloaded.'))
    });
  }

  exportResults() {
    const result = this.preview();
    const rows = this.allRows();
    if (!result || rows.length === 0) {
      this.notify('There are no publication validation rows to export.');
      return;
    }

    const headings = [
      'Row No', 'Lot Number', 'Paper ID', 'CodeRef', 'Title', 'FinancialYear',
      'Result', 'Status Message', 'Blocked DB ID', 'Blocked By Row',
      'Blocked Paper ID', 'Blocked Lot Number', 'Blocked CodeRef', 'Blocked Existing Title'
    ];
    const data = rows.map(row => [
      row.rowNumber,
      this.lotNumber(row),
      row.paperId || '',
      row.codeReference || '',
      row.title || '',
      row.titleYear || '',
      row.category,
      row.message || row.status || row.category,
      this.blockedDatabaseId(row),
      row.blockedByRow ?? '',
      row.blockedByPaperId || '',
      this.blockedLotNumber(row),
      this.blockedCodeReference(row),
      row.blockedByTitle || ''
    ]);
    const csv = '\uFEFF' + [headings, ...data]
      .map(columns => columns.map(value => this.csvCell(value)).join(','))
      .join('\r\n');
    const name = (result.fileName || 'PublicationTitles').replace(/\.xlsx$/i, '').replace(/[^a-z0-9_-]+/gi, '-');

    saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${name}-Validation-Result.csv`);
    this.notify('Publication validation result exported successfully.');
  }

  formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  lotNumber(row: PublicationImportRow) {
    return row.lotNumber || row.lotNo || row.invoiceNumber || '';
  }

  blockedLotNumber(row: PublicationImportRow) {
    return row.blockedByLotNumber || row.blockedByLotNo || row.blockedByInvoiceNo || '';
  }

  blockedDatabaseId(row: PublicationImportRow) {
    return row.blockedById ?? row.blockedId ?? '';
  }

  blockedCodeReference(row: PublicationImportRow) {
    return row.blockedByCodeReference || row.blockedCodeRef || '';
  }

  notify(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2800);
  }

  private normalizeRow(row: PublicationImportRow): PublicationImportRow {
    const rawCategory = String(row.category || row.status || '').toLowerCase();
    const category: PublicationCategory = rawCategory === 'clean'
      ? 'Clean'
      : rawCategory === 'blocked'
        ? 'Blocked'
        : 'Invalid';
    return {
      ...row,
      category,
      message: row.message || row.status || category
    };
  }

  private csvCell(value: unknown) {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }
}
