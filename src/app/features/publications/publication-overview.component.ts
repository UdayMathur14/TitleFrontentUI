import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  BookCopy,
  CircleCheckBig,
  FilePenLine,
  FileSpreadsheet,
  LayoutDashboard,
  LucideAngularModule
} from 'lucide-angular';
import { PublicationApiService } from './publication-api.service';
import { PublicationOverview, PublicationRecord } from './publication.models';

@Component({
  selector: 'app-publication-overview',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule],
  templateUrl: './publication-overview.component.html',
  styleUrl: './publication-overview.component.scss'
})
export class PublicationOverviewComponent implements OnInit {
  private readonly api = inject(PublicationApiService);

  readonly icons = {
    ArrowRight,
    BookCopy,
    CircleCheckBig,
    FilePenLine,
    FileSpreadsheet,
    LayoutDashboard
  };

  readonly loading = signal(true);
  readonly overview = signal<PublicationOverview | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getOverview().subscribe({
      next: result => {
        this.overview.set(result ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.overview.set(null);
        this.loading.set(false);
      }
    });
  }

  lotNumber(record: PublicationRecord) {
    return record.lotNumber || record.lotNo || record.invoiceNumber || '';
  }

  isStatus(value: string | null | undefined, expected: string) {
    return (value ?? '').trim().toLowerCase() === expected;
  }

  yearPercentage(total: number, maximum: number) {
    if (!total || !maximum) return 0;
    return Math.max(0, Math.min(100, (total / maximum) * 100));
  }

  maxYearTotal(data: PublicationOverview) {
    return Math.max(0, ...(data.yearBreakdown ?? []).map(item => item.totalTitles ?? 0));
  }
}
