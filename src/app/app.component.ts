import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BarChart3, Bell, BookCopy, BookOpen, ChevronLeft, FilePenLine, FileSpreadsheet, LayoutDashboard, LogOut, LucideAngularModule, Menu, Plus, Search, Settings2, Sparkles } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly icons = { BarChart3, Bell, BookCopy, BookOpen, ChevronLeft, FilePenLine, FileSpreadsheet, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, Sparkles };
  readonly sidebarOpen = signal(true);
  readonly mobile = signal(window.innerWidth < 960);
  constructor() { if (this.mobile()) this.sidebarOpen.set(false); }
  @HostListener('window:resize') onResize() { this.mobile.set(window.innerWidth < 960); }
  toggleSidebar() { this.sidebarOpen.update(value => !value); }
  logout() { window.location.replace('http://192.168.29.101:90'); }
}
