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
import { ImportPreview, ImportRow } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';
import { apiErrorMessage } from '../../shared/api-error';
import { saveBlob } from '../../shared/download';

type ResultView = 'All' | ImportRow['category'];

@Component({
  selector: 'app-title-upload',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './title-upload.component.html',
  styleUrl: './title-upload.component.scss'
})
export class TitleUploadComponent {
  private readonly api = inject(TitleApiService);

  readonly icons = {
    ArrowLeft, CheckCircle2, CircleAlert, CloudUpload, Download, FileCheck2,
    FileSpreadsheet, Info, Save, ScanSearch, ShieldAlert, Trash2, XCircle
  };

  readonly file = signal<File | null>(null);
  readonly drag = signal(false);
  readonly loading = signal(false);
  readonly preview = signal<ImportPreview | null>(null);
  readonly resultView = signal<ResultView>('All');
  readonly saved = signal(false);
  readonly toast = signal('');
  readonly error = signal('');

  readonly visibleRows = computed(() => {
    const preview = this.preview();
    if (!preview) return [];
    const view = this.resultView();
    return view === 'All' ? preview.rows : preview.rows.filter(row => row.category === view);
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
    this.error.set('');
    this.file.set(file);
    this.preview.set(null);
    this.resultView.set('All');
    this.saved.set(false);
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
        const approvalCount = value.pendingApprovalCount ?? 0;
        this.notify(approvalCount
          ? `Test completed. ${approvalCount} ${approvalCount === 1 ? 'row is' : 'rows are'} blocked and will go for approval after saving.`
          : 'Test upload completed. Review the result before saving.');
      },
      error: error => {
        this.loading.set(false);
        this.preview.set(null);
        this.error.set(apiErrorMessage(error, 'Spreadsheet validation failed.'));
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
        const savedCount = Number(result.savedCount) || 0;
        const cleanCount = Number(result.cleanCount ?? value.cleanCount) || 0;
        const pendingCount = Number(result.pendingApprovalCount ?? value.pendingApprovalCount) || 0;
        const expectedPendingCount = Number(value.pendingApprovalCount) || 0;

        if (savedCount < 1) {
          this.saved.set(false);
          this.error.set('The API returned 0 saved records. The tested result was not saved.');
          return;
        }

        this.saved.set(true);
        if (expectedPendingCount > pendingCount) {
          this.error.set(`${expectedPendingCount} approval ${expectedPendingCount === 1 ? 'row was' : 'rows were'} present in the test result, but the running API did not confirm saving them. Publish the latest approval-enabled backend, then test and save the file again.`);
          this.notify(`${savedCount} records were processed, but approval rows were not confirmed.`);
          return;
        }

        const approvalMessage = pendingCount
          ? ` ${pendingCount} ${pendingCount === 1 ? 'title was' : 'titles were'} sent for approval.`
          : '';
        this.notify(`${cleanCount} clean ${cleanCount === 1 ? 'title' : 'titles'} saved.${approvalMessage}`);
      },
      error: error => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(error, 'Upload and save failed.'));
      }
    });
  }

  downloadTemplate() {
    this.api.template().subscribe({
      next: blob => saveBlob(blob, 'UploadTitles.xlsx'),
      error: error => this.notify(apiErrorMessage(error, 'Template could not be downloaded.'))
    });
  }

  formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  notify(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2800);
  }
}
