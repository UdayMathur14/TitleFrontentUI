import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalLoaderService {
  private readonly requests = new Map<number, string>();
  private nextId = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private visibleSince = 0;

  readonly visible = signal(false);
  readonly message = signal('Loading data…');

  start(message: string) {
    const id = ++this.nextId;
    this.requests.set(id, message);
    this.message.set(message);

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (!this.visible() && !this.showTimer) {
      this.showTimer = setTimeout(() => {
        this.showTimer = null;
        if (!this.requests.size) return;
        this.visibleSince = Date.now();
        this.visible.set(true);
      }, 120);
    }

    return id;
  }

  stop(id: number) {
    this.requests.delete(id);

    if (this.requests.size) {
      this.message.set(Array.from(this.requests.values()).at(-1) ?? 'Loading data…');
      return;
    }

    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.visible()) return;
    const remaining = Math.max(0, 360 - (Date.now() - this.visibleSince));
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (!this.requests.size) this.visible.set(false);
    }, remaining);
  }
}
