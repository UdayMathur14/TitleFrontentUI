import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  FilePenLine,
  Hash,
  LucideAngularModule,
  RefreshCw,
  Search,
  Upload,
  X
} from 'lucide-angular';
import { apiErrorMessage } from '../../shared/api-error';
import { saveBlob } from '../../shared/download';
import { PublicationApiService } from './publication-api.service';
import { ModifiedPublicationFilter, PublicationRecord } from './publication.models';

@Component({
  selector: 'app-publication-modified',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './publication-modified.component.html',
  styleUrl: './publication-modified.component.scss'
})
export class PublicationModifiedComponent implements OnInit {
  private readonly api = inject(PublicationApiService);

  readonly icons = {
    ArrowLeft, ChevronLeft, ChevronRight, CircleAlert, Download, FilePenLine,
    Hash, RefreshCw, Search, Upload, X
  };

  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly downloading = signal(false);
  readonly records = signal<PublicationRecord[]>([]);
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly paperIds = signal<string[]>([]);
  readonly toast = signal('');

  filter: ModifiedPublicationFilter = this.emptyFilter();

  ngOnInit() {
    this.load();
    this.api.dropdowns(undefined, 1000).subscribe({
      next: value => this.paperIds.set(value.paperIds),
      error: () => this.paperIds.set([])
    });
  }

  load() {
    this.loading.set(true);
    this.api.searchModified(this.filter).subscribe({
      next: result => {
        this.records.set(result.items);
        this.total.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: error => {
        this.records.set([]);
        this.total.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    this.filter.page = 1;
    this.load();
  }

  clear() {
    this.filter = this.emptyFilter();
    this.load();
  }

  openPicker(input: HTMLInputElement) {
    input.value = '';
    input.click();
  }

  choose(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      this.notify('Please choose an Excel file in .xlsx format.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.notify('The Excel file cannot be larger than 50 MB.');
      return;
    }

    this.uploading.set(true);
    this.api.uploadModified(file).subscribe({
      next: result => {
        this.uploading.set(false);
        this.notify(`${result.savedCount} modified publication titles saved successfully.`);
        this.load();
      },
      error: error => {
        this.uploading.set(false);
        this.notify(apiErrorMessage(error, 'Modified publication upload failed.'));
      }
    });
  }

  downloadTemplate() {
    if (this.downloading()) return;
    this.downloading.set(true);
    this.api.modifiedTemplate().subscribe({
      next: blob => {
        this.downloading.set(false);
        saveBlob(blob, 'UploadModifiedPublicationTitles.xlsx');
      },
      error: error => {
        this.downloading.set(false);
        this.notify(apiErrorMessage(error, 'Modified title template could not be downloaded.'));
      }
    });
  }

  previousPage() {
    if (this.filter.page > 1) {
      this.filter.page--;
      this.load();
    }
  }

  nextPage() {
    if (this.filter.page < this.totalPages()) {
      this.filter.page++;
      this.load();
    }
  }

  notify(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2800);
  }

  private emptyFilter(): ModifiedPublicationFilter {
    return { page: 1, pageSize: 100, id: null, paperId: '' };
  }
}
