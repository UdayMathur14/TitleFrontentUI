import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Hash,
  LucideAngularModule,
  Pencil,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  X
} from 'lucide-angular';
import { CreateTitleRequest, DropdownData, TitleFilter, TitleRecord } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';
import { apiErrorMessage } from '../../shared/api-error';
import { saveBlob } from '../../shared/download';

type EditableTitle = Pick<CreateTitleRequest, 'codeReference' | 'invoiceNumber' | 'title' | 'titleYear'>;

@Component({
  selector: 'app-title-list',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './title-list.component.html',
  styleUrl: './title-list.component.scss'
})
export class TitleListComponent implements OnInit {
  private readonly api = inject(TitleApiService);

  readonly icons = {
    ArrowLeft, BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download,
    Filter, Hash, Pencil, RefreshCw, Save, Search, SlidersHorizontal,
    Trash2, TriangleAlert, X
  };

  readonly loading = signal(true);
  readonly records = signal<TitleRecord[]>([]);
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly dropdowns = signal<DropdownData>({ codeReferences: [], invoiceNumbers: [], titles: [], years: [] });
  readonly selected = signal(new Set<number>());
  readonly filterOpen = signal(true);
  readonly toast = signal('');
  readonly error = signal('');
  readonly exporting = signal(false);
  readonly editing = signal<TitleRecord | null>(null);
  readonly editError = signal('');
  readonly saving = signal(false);
  readonly deleteIds = signal<number[]>([]);
  readonly bulkDelete = signal(false);
  readonly deleting = signal(false);

  filter: TitleFilter = {
    page: 1,
    pageSize: 100,
    id: null,
    title: '',
    codeReference: '',
    invoiceNumber: '',
    titleYear: ''
  };

  editForm: EditableTitle = { codeReference: '', invoiceNumber: '', title: '', titleYear: '' };

  readonly allSelected = computed(() =>
    this.records().length > 0 && this.records().every(record => this.selected().has(record.id))
  );

  ngOnInit() {
    this.load();
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.api.getDropdowns(undefined, 1000).subscribe({
      next: value => this.dropdowns.set(value),
      error: () => this.dropdowns.set({ codeReferences: [], invoiceNumbers: [], titles: [], years: [] })
    });
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.selected.set(new Set());
    this.api.search(this.filter).subscribe({
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
        this.error.set(apiErrorMessage(error, 'Title records could not be loaded.'));
      }
    });
  }

  applyFilters() { this.filter.page = 1; this.load(); }

  clear() {
    this.filter = { page: 1, pageSize: 100, id: null, title: '', codeReference: '', invoiceNumber: '', titleYear: '' };
    this.load();
  }

  previousPage() { if (this.filter.page > 1) { this.filter.page--; this.load(); } }
  nextPage() { if (this.filter.page < this.totalPages()) { this.filter.page++; this.load(); } }

  toggle(id: number) {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  toggleAll() {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.records().map(record => record.id)));
  }

  exportTitles() {
    if (this.exporting()) return;
    this.exporting.set(true);
    this.api.export(this.filter).subscribe({
      next: blob => {
        this.exporting.set(false);
        saveBlob(blob, `TitleRecords-${new Date().toISOString().slice(0, 10)}.xlsx`);
        this.notify('Title export downloaded successfully');
      },
      error: error => {
        this.exporting.set(false);
        this.notify(apiErrorMessage(error, 'Title export could not be downloaded.'));
      }
    });
  }

  openEdit(record: TitleRecord) {
    this.editing.set(record);
    this.editError.set('');
    this.editForm = {
      codeReference: record.codeReference,
      invoiceNumber: record.invoiceNumber,
      title: record.title,
      titleYear: record.titleYear
    };
  }

  closeEdit() {
    if (this.saving()) return;
    this.editing.set(null);
    this.editError.set('');
  }

  saveEdit() {
    const record = this.editing();
    if (!record || this.saving()) return;

    const value: EditableTitle = {
      codeReference: this.editForm.codeReference.trim(),
      invoiceNumber: this.editForm.invoiceNumber.trim(),
      title: this.editForm.title.trim(),
      titleYear: this.editForm.titleYear.trim()
    };

    if (!value.codeReference || !value.invoiceNumber || !value.title || !value.titleYear) {
      this.editError.set('All four fields are required. Empty values cannot be saved.');
      return;
    }

    const yearMatch = /^(\d{4})-(\d{2})$/.exec(value.titleYear);
    const startYear = yearMatch ? Number(yearMatch[1]) : 0;
    const validConsecutiveYear = yearMatch && startYear >= 1999 && startYear <= 2099 && Number(yearMatch[2]) === (startYear + 1) % 100;
    if (!validConsecutiveYear) {
      this.editError.set('Financial year must be consecutive and use YYYY-YY format, for example 2025-26.');
      return;
    }

    this.saving.set(true);
    this.editError.set('');
    this.api.update(record.id, { ...value, createdBy: record.createdBy }).subscribe({
      next: updated => {
        this.records.update(records => records.map(item => item.id === record.id ? { ...item, ...updated } : item));
        this.saving.set(false);
        this.editing.set(null);
        this.notify('Title updated successfully');
      },
      error: error => {
        this.saving.set(false);
        this.editError.set(apiErrorMessage(error, 'Title could not be updated. Please try again.'));
      }
    });
  }

  askDelete(record?: TitleRecord) {
    const ids = record ? [record.id] : [...this.selected()];
    if (ids.length) {
      this.bulkDelete.set(!record);
      this.deleteIds.set(ids);
    }
  }

  cancelDelete() {
    if (!this.deleting()) this.deleteIds.set([]);
  }

  confirmDelete() {
    const ids = this.deleteIds();
    if (!ids.length || this.deleting()) return;

    this.deleting.set(true);
    const request = this.bulkDelete() ? this.api.deleteMany(ids) : this.api.deleteOne(ids[0]);
    request.subscribe({
      next: result => {
        this.deleting.set(false);
        this.deleteIds.set([]);
        this.selected.set(new Set());
        this.notify(result.deletedCount === 1 ? 'Title deleted successfully' : `${result.deletedCount} titles deleted successfully`);
        this.load();
      },
      error: error => {
        this.deleting.set(false);
        this.deleteIds.set([]);
        this.notify(apiErrorMessage(error, 'Delete failed. Please try again.'));
      }
    });
  }

  notify(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2600);
  }
}
