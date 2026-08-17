import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, BookOpen, CircleAlert, FileCheck2, FileUp, LucideAngularModule, Sparkles, TrendingUp } from 'lucide-angular';
import { TitleDashboard } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';
import { apiErrorMessage } from '../../shared/api-error';

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
  readonly error = signal('');
  readonly icons = { ArrowRight, BookOpen, CircleAlert, FileCheck2, FileUp, Sparkles, TrendingUp };

  readonly cleanPercentage = computed(() => this.percentage(this.data()?.cleanTitles ?? 0));
  readonly blockedPercentage = computed(() => this.percentage(this.data()?.blockedTitles ?? 0));

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: value => this.data.set(value),
      error: error => this.error.set(apiErrorMessage(error, 'Dashboard data could not be loaded.'))
    });
  }

  private percentage(count: number) {
    const total = this.data()?.totalTitles ?? 0;
    return total ? Math.round((count / total) * 1000) / 10 : 0;
  }
}
