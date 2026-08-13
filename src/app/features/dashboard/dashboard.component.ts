import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, BookOpen, CircleAlert, FileCheck2, FileUp, LucideAngularModule, Sparkles, TrendingUp } from 'lucide-angular';
import { TitleDashboard } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';

@Component({ selector:'app-dashboard', standalone:true, imports:[RouterLink,LucideAngularModule], templateUrl:'./dashboard.component.html', styleUrl:'./dashboard.component.scss' })
export class DashboardComponent implements OnInit {
  private readonly api=inject(TitleApiService); readonly data=signal<TitleDashboard|null>(null);
  readonly icons={ArrowRight,BookOpen,CircleAlert,FileCheck2,FileUp,Sparkles,TrendingUp};
  ngOnInit(){this.api.getDashboard().subscribe(value=>this.data.set(value));}
}
