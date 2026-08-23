import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  BookCopy,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Hash,
  LucideAngularModule,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  X
} from 'lucide-angular';
import { apiErrorMessage } from '../../shared/api-error';
import { PublicationApiService } from './publication-api.service';
import { PublicationDropdownData, PublicationFilter, PublicationRecord } from './publication.models';

@Component({
  selector: 'app-publication-list',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './publication-list.component.html',
  styleUrl: './publication-list.component.scss'
})
export class PublicationListComponent implements OnInit {
  private readonly api = inject(PublicationApiService);

  readonly icons = {
    ArrowLeft, BookCopy, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
    Filter, Hash, RefreshCw, Search, SlidersHorizontal, Trash2, TriangleAlert, X
  };

  readonly loading = signal(true);
  readonly records = signal<PublicationRecord[]>([]);
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly dropdowns = signal<PublicationDropdownData>({
    codeReferences: [], invoiceNumbers: [], paperIds: [], titles: [], years: []
  });
  readonly selected = signal(new Set<number>());
  readonly filterOpen = signal(true);
  readonly error = signal('');
  readonly toast = signal('');
  readonly deleteIds = signal<number[]>([]);
  readonly deleting = signal(false);

  filter: PublicationFilter = this.emptyFilter();

  readonly allSelected = computed(() =>
    this.records().length > 0 && this.records().every(record => this.selected().has(record.id))
  );

  ngOnInit() {
    this.load();
    this.loadDropdowns();
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
        this.error.set(apiErrorMessage(error, 'Publication title records could not be loaded.'));
      }
    });
  }

  loadDropdowns() {
    this.api.dropdowns(undefined, 1000).subscribe({
      next: value => this.dropdowns.set(value),
      error: () => this.dropdowns.set({ codeReferences: [], invoiceNumbers: [], paperIds: [], titles: [], years: [] })
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

  toggle(id: number) {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  toggleAll() {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.records().map(record => record.id)));
  }

  askDelete() {
    const ids = [...this.selected()];
    if (ids.length) this.deleteIds.set(ids);
  }

  cancelDelete() {
    if (!this.deleting()) this.deleteIds.set([]);
  }

  confirmDelete() {
    const ids = this.deleteIds();
    if (!ids.length || this.deleting()) return;

    this.deleting.set(true);
    this.api.deleteMany(ids).subscribe({
      next: result => {
        this.deleting.set(false);
        this.deleteIds.set([]);
        this.selected.set(new Set());
        this.notify(`${result.deletedCount} publication title${result.deletedCount === 1 ? '' : 's'} deleted successfully.`);
        this.load();
      },
      error: error => {
        this.deleting.set(false);
        this.deleteIds.set([]);
        this.notify(apiErrorMessage(error, 'Publication title delete failed.'));
      }
    });
  }

  notify(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2800);
  }

  private emptyFilter(): PublicationFilter {
    return {
      page: 1,
      pageSize: 100,
      id: null,
      codeReference: '',
      invoiceNumber: '',
      paperId: '',
      title: '',
      titleYear: ''
    };
  }
}
