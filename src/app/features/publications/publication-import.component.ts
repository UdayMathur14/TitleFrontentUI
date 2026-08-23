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
    return [
      ...value.cleanTitles.map(row => ({ ...row, category: 'Clean' as const })),
      ...value.blockedTitles.map(row => ({ ...row, category: 'Blocked' as const })),
      ...value.duplicateTitlesInExcel.map(row => ({ ...row, category: 'Duplicate' as const })),
      ...(value.invalidTitles ?? []).map(row => ({ ...row, category: 'Invalid' as const }))
    ];
  });

  readonly visibleRows = computed(() => {
    const view = this.resultView();
    return view === 'All' ? this.allRows() : this.allRows().filter(row => row.category === view);
  });

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
    if (!value || value.cleanCount < 1 || this.loading() || this.saved()) return;

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
