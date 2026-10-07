import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TitleListComponent } from './features/titles/title-list.component';
import { TitleUploadComponent } from './features/titles/title-upload.component';
import { MultipleTitleInvoiceComponent } from './features/titles/multiple-title-invoice.component';
import { PublicationImportComponent } from './features/publications/publication-import.component';
import { PublicationListComponent } from './features/publications/publication-list.component';
import { PublicationModifiedComponent } from './features/publications/publication-modified.component';
import { PublicationOverviewComponent } from './features/publications/publication-overview.component';
import { TITLE_MENU_PERMISSIONS } from './core/auth/title-menu-permissions';
import { permissionGuard } from './core/guards/permission.guard';
import { AccessDeniedComponent } from './features/auth/access-denied.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.invoice.overview }, title: 'Normal Titles Overview · TitleFlow' },
  { path: 'titles', component: TitleListComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.invoice.viewTitles }, title: 'Title Library · TitleFlow' },
  { path: 'titles/multiple-invoice', component: MultipleTitleInvoiceComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.invoice.multipleInvoice }, title: 'Multiple Title Invoice · TitleFlow' },
  { path: 'titles/upload', component: TitleUploadComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.invoice.uploadTitles }, title: 'Upload Titles · TitleFlow' },
  { path: 'publications/overview', component: PublicationOverviewComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.publication.overview }, title: 'Publication Overview · TitleFlow' },
  { path: 'publications', component: PublicationImportComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.publication.validateAndUpload }, title: 'Publication Title Validation · TitleFlow' },
  { path: 'publications/records', component: PublicationListComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.publication.viewTitles }, title: 'Publication Titles · TitleFlow' },
  { path: 'publications/modified', component: PublicationModifiedComponent, canActivate: [permissionGuard], data: { permissions: TITLE_MENU_PERMISSIONS.publication.modifiedTitles }, title: 'Modified Publication Titles · TitleFlow' },
  { path: 'access-denied', component: AccessDeniedComponent, title: 'Access restricted · TitleFlow' },
  { path: '**', redirectTo: 'dashboard' }
];
