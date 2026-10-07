import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  Filter,
  Layers3,
  LucideAngularModule,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  XCircle
} from 'lucide-angular';
import { TITLE_MENU_PERMISSIONS } from '../../core/auth/title-menu-permissions';
import { PermissionService } from '../../core/services/permission.service';
import { apiErrorMessage } from '../../shared/api-error';
import { MultipleTitleInvoiceApiService } from './multiple-title-invoice-api.service';
import {
  MultipleInvoiceDecision,
  MultipleTitleInvoiceFilter,
  MultipleTitleInvoiceRecord
} from './multiple-title-invoice.models';

type ReviewView = 'PendingApproval' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-multiple-title-invoice',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './multiple-title-invoice.component.html',
  styleUrl: './multiple-title-invoice.component.scss'
})
export class MultipleTitleInvoiceComponent implements OnInit {
  private readonly api = inject(MultipleTitleInvoiceApiService);
  private readonly permissions = inject(PermissionService);

  readonly icons = {
    ArrowLeft, ArrowRight, CalendarDays, Check, CheckCheck, ChevronDown, ChevronLeft,
    ChevronRight, CircleAlert, FileCheck2, Filter, Layers3, RefreshCw, Search,
    SlidersHorizontal, X, XCircle
  };

  readonly loading = signal(true);
  readonly processing = signal(false);
  readonly records = signal<MultipleTitleInvoiceRecord[]>([]);
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly selected = signal(new Set<number>());
  readonly filterOpen = signal(true);
  readonly toast = signal('');
  readonly loadMessage = signal('');
  readonly decision = signal<MultipleInvoiceDecision | null>(null);
  readonly decisionIds = signal<number[]>([]);
  readonly viewMode = signal<ReviewView>('PendingApproval');

  readonly canReview = computed(() =>
    this.permissions.hasAny(TITLE_MENU_PERMISSIONS.invoice.editTitles)
  );
  readonly pendingRecords = computed(() => this.records().filter(record => this.isPending(record)));
  readonly pendingCount = computed(() => this.pendingRecords().length);
  readonly showReviewControls = computed(() => this.canReview() && this.viewMode() === 'PendingApproval');
  readonly viewTitle = computed(() => {
    switch (this.viewMode()) {
      case 'Approved': return 'Approved Multiple Invoice Titles';
      case 'Rejected': return 'Rejected Multiple Invoice Titles';
      default: return 'Pending Multiple Invoice Titles';
    }
  });
  readonly allPendingSelected = computed(() =>
    this.showReviewControls() && this.pendingRecords().length > 0 &&
    this.pendingRecords().every(record => this.selected().has(record.id))
  );

  filter: MultipleTitleInvoiceFilter = this.emptyFilter('PendingApproval');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.loadMessage.set('');
    this.selected.set(new Set());
    this.api.search(this.filter).subscribe({
      next: result => {
        this.records.set(result?.items ?? []);
        this.total.set(result?.totalCount ?? 0);
        this.totalPages.set(result?.totalPages ?? 0);
        this.loading.set(false);
      },
      error: error => {
        this.records.set([]);
        this.total.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
        this.loadMessage.set(apiErrorMessage(error, 'The multiple-title review queue is not available yet.'));
      }
    });
  }

  applyFilters() {
    this.filter.page = 1;
    this.load();
  }

  clear() {
    this.filter = this.emptyFilter(this.viewMode());
    this.load();
  }

  switchView(view: ReviewView) {
    if (this.viewMode() === view) return;
    this.viewMode.set(view);
    this.filter = this.emptyFilter(view);
    this.load();
  }

  toggle(record: MultipleTitleInvoiceRecord) {
    if (!this.showReviewControls() || !this.isPending(record)) return;
    const next = new Set(this.selected());
    next.has(record.id) ? next.delete(record.id) : next.add(record.id);
    this.selected.set(next);
  }

  toggleAllPending() {
    if (!this.showReviewControls()) return;
    this.selected.set(this.allPendingSelected()
      ? new Set()
      : new Set(this.pendingRecords().map(record => record.id)));
  }

  askDecision(decision: MultipleInvoiceDecision, record?: MultipleTitleInvoiceRecord) {
    if (!this.showReviewControls()) return;
    const ids = record
      ? (this.isPending(record) ? [record.id] : [])
      : [...this.selected()];
    if (!ids.length) return;
    this.decision.set(decision);
    this.decisionIds.set(ids);
  }

  cancelDecision() {
    if (this.processing()) return;
    this.decision.set(null);
    this.decisionIds.set([]);
  }

  confirmDecision() {
    const decision = this.decision();
    const ids = this.decisionIds();
    if (!this.showReviewControls() || !decision || !ids.length || this.processing()) return;

    this.processing.set(true);
    this.api.decide({ ids, decision }).subscribe({
      next: result => {
        this.processing.set(false);
        this.decision.set(null);
        this.decisionIds.set([]);
        this.selected.set(new Set());
        const count = result?.updatedCount ?? ids.length;
        const completed = decision === 'Approve' ? 'approved' : 'rejected';
        this.notify(`${count} title invoice ${count === 1 ? 'record' : 'records'} ${completed} successfully.`);
        this.load();
      },
      error: error => {
        this.processing.set(false);
        this.notify(apiErrorMessage(error, `The selected records could not be ${decision.toLowerCase()}.`));
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

  isPending(record: MultipleTitleInvoiceRecord) {
    return this.statusIs(record, 'PendingApproval');
  }

  statusIs(record: MultipleTitleInvoiceRecord, status: string) {
    return String(record.status || '').toLowerCase() === status.toLowerCase();
  }

  decisionLabel(record: MultipleTitleInvoiceRecord) {
    if (record.reviewDecision) return record.reviewDecision;
    if (this.statusIs(record, 'Rejected')) return 'Rejected';
    if (this.statusIs(record, 'Clean')) return 'Approved';
    return 'Pending approval';
  }

  notify(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 3000);
  }

  private emptyFilter(status: ReviewView): MultipleTitleInvoiceFilter {
    return { page: 1, pageSize: 100, codeReference: '', title: '', invoiceNumber: '', titleYear: '', status };
  }
}
