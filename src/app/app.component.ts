import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BarChart3, Bell, BookCopy, BookOpen, ChevronLeft, ChevronsLeft, FilePenLine, FileSpreadsheet, LayoutDashboard, ListChecks, LogOut, LucideAngularModule, Menu, Moon, Plus, Search, Settings2, Sparkles, Sun } from 'lucide-angular';
import { GlobalLoaderService } from './core/services/global-loader.service';
import { PermissionService } from './core/services/permission.service';
import { TITLE_MENU_PERMISSIONS } from './core/auth/title-menu-permissions';
import { UserIdentityService } from './core/services/user-identity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);
  private readonly identity = inject(UserIdentityService);
  readonly loader = inject(GlobalLoaderService);
  readonly menuPermissions = TITLE_MENU_PERMISSIONS;
  readonly icons = { BarChart3, Bell, BookCopy, BookOpen, ChevronLeft, ChevronsLeft, FilePenLine, FileSpreadsheet, LayoutDashboard, ListChecks, LogOut, Menu, Moon, Plus, Search, Settings2, Sparkles, Sun };
  readonly sidebarOpen = signal(true);
  readonly mobile = signal(window.innerWidth < 960);
  readonly darkMode = signal(this.savedTheme() === 'dark');
  readonly publicationWorkspace = signal(this.router.url.startsWith('/publications'));
  constructor() {
    this.applyTheme(this.darkMode());
    if (this.mobile()) this.sidebarOpen.set(false);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.publicationWorkspace.set(event.urlAfterRedirects.startsWith('/publications'));
    });
  }
  @HostListener('window:resize') onResize() { this.mobile.set(window.innerWidth < 960); }
  toggleSidebar() { this.sidebarOpen.update(value => !value); }
  toggleTheme() {
    this.darkMode.update(value => !value);
    this.applyTheme(this.darkMode());
  }
  logout() {
    this.identity.logout();
  }
  canAccess(permissions: readonly string[]) {
    return this.permissionService.hasAny(permissions);
  }
  canAccessInvoiceMenu() {
    return this.canAccess(this.menuPermissions.invoice.group);
  }
  canAccessPublicationMenu() {
    return this.canAccess(this.menuPermissions.publication.group);
  }
  private savedTheme(): 'light' | 'dark' {
    try {
      return localStorage.getItem('titleflow-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
  private applyTheme(dark: boolean) {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.dataset['theme'] = theme;
    try { localStorage.setItem('titleflow-theme', theme); } catch { /* Storage can be disabled. */ }
  }
}
