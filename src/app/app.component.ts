import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BarChart3, Bell, BookCopy, BookOpen, ChevronLeft, ChevronsLeft, FilePenLine, FileSpreadsheet, LayoutDashboard, LogOut, LucideAngularModule, Menu, Plus, Search, Settings2, Sparkles } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly icons = { BarChart3, Bell, BookCopy, BookOpen, ChevronLeft, ChevronsLeft, FilePenLine, FileSpreadsheet, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, Sparkles };
  readonly sidebarOpen = signal(true);
  readonly mobile = signal(window.innerWidth < 960);
  readonly publicationWorkspace = signal(this.router.url.startsWith('/publications'));
  constructor() {
    if (this.mobile()) this.sidebarOpen.set(false);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.publicationWorkspace.set(event.urlAfterRedirects.startsWith('/publications'));
    });
  }
  @HostListener('window:resize') onResize() { this.mobile.set(window.innerWidth < 960); }
  toggleSidebar() { this.sidebarOpen.update(value => !value); }
  logout() { window.location.replace('http://192.168.29.101:90'); }
}
