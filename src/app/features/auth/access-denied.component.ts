import { Component } from '@angular/core';
import { LucideAngularModule, ShieldX } from 'lucide-angular';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <section class="access-card">
      <span><lucide-icon [img]="icon" [size]="30" /></span>
      <p>Access restricted</p>
      <h1>You do not have permission to open this page.</h1>
      <small>Ask your UMS administrator to assign the required Title Validation permission.</small>
      <a href="http://192.168.29.101:90/dashboard">Return to dashboard</a>
    </section>
  `,
  styles: [`
    :host { min-height: calc(100vh - 72px); display: grid; place-items: center; padding: 24px; }
    .access-card { width: min(520px, 100%); padding: 42px; border: 1px solid #e2e8f0; border-radius: 24px; background: #fff; box-shadow: 0 24px 70px rgba(15,23,42,.09); text-align: center; }
    .access-card > span { width: 64px; height: 64px; display: grid; place-items: center; margin: 0 auto 18px; color: #dc2626; background: #fef2f2; border-radius: 20px; }
    p { margin: 0 0 8px; color: #dc2626; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 0; color: #0f172a; font-size: clamp(23px, 4vw, 32px); line-height: 1.2; }
    small { display: block; margin: 14px auto 24px; color: #64748b; font-size: 14px; line-height: 1.6; }
    a { display: inline-flex; padding: 12px 18px; border-radius: 12px; color: #fff; background: #0f172a; font-weight: 750; text-decoration: none; }
  `]
})
export class AccessDeniedComponent {
  readonly icon = ShieldX;
}

