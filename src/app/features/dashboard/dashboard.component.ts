import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, BookOpen, CircleAlert, FileCheck2, FileUp, LucideAngularModule, Sparkles, TrendingUp } from 'lucide-angular';
import { TitleDashboard } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(TitleApiService);

  readonly data = signal<TitleDashboard | null>(null);
  readonly icons = { ArrowRight, BookOpen, CircleAlert, FileCheck2, FileUp, Sparkles, TrendingUp };

  readonly cleanPercentage = computed(() => this.percentage(this.data()?.cleanTitles ?? 0));
  readonly blockedPercentage = computed(() => this.percentage(this.data()?.blockedTitles ?? 0));

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: value => this.data.set({
        totalTitles: value?.totalTitles ?? 0,
        cleanTitles: value?.cleanTitles ?? 0,
        blockedTitles: value?.blockedTitles ?? 0,
        uploadedThisMonth: value?.uploadedThisMonth ?? 0,
        recentTitles: value?.recentTitles ?? []
      }),
      error: () => this.data.set(this.emptyDashboard())
    });
  }

  private emptyDashboard(): TitleDashboard {
    return { totalTitles: 0, cleanTitles: 0, blockedTitles: 0, uploadedThisMonth: 0, recentTitles: [] };
  }

  private percentage(count: number) {
    const total = this.data()?.totalTitles ?? 0;
    return total ? Math.round((count / total) * 1000) / 10 : 0;
  }
}
