import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TitleListComponent } from './features/titles/title-list.component';
import { TitleUploadComponent } from './features/titles/title-upload.component';
import { PublicationImportComponent } from './features/publications/publication-import.component';
import { PublicationListComponent } from './features/publications/publication-list.component';
import { PublicationModifiedComponent } from './features/publications/publication-modified.component';
import { PublicationOverviewComponent } from './features/publications/publication-overview.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent, title: 'Normal Titles Overview · TitleFlow' },
  { path: 'titles', component: TitleListComponent, title: 'Title Library · TitleFlow' },
  { path: 'titles/upload', component: TitleUploadComponent, title: 'Upload Titles · TitleFlow' },
  { path: 'publications/overview', component: PublicationOverviewComponent, title: 'Publication Overview · TitleFlow' },
  { path: 'publications', component: PublicationImportComponent, title: 'Publication Title Validation · TitleFlow' },
  { path: 'publications/records', component: PublicationListComponent, title: 'Publication Titles · TitleFlow' },
  { path: 'publications/modified', component: PublicationModifiedComponent, title: 'Modified Publication Titles · TitleFlow' },
  { path: '**', redirectTo: 'dashboard' }
];
