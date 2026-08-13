import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TitleListComponent } from './features/titles/title-list.component';
import { TitleUploadComponent } from './features/titles/title-upload.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard · TitleFlow' },
  { path: 'titles', component: TitleListComponent, title: 'Title Library · TitleFlow' },
  { path: 'titles/upload', component: TitleUploadComponent, title: 'Import Titles · TitleFlow' },
  { path: '**', redirectTo: 'dashboard' }
];
