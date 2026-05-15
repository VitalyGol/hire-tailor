import { Injectable, signal } from '@angular/core';

const SPINNER_SHOW_DELAY_MS = 150;
const SPINNER_MIN_VISIBLE_MS = 300;

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private readonly isVisible = signal(false);
  private activeRequests = 0;
  private visibleSince = 0;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly visible = this.isVisible.asReadonly();

  show(): void {
    this.activeRequests += 1;

    if (this.activeRequests > 1 || this.isVisible() || this.showTimeout) {
      return;
    }

    this.showTimeout = setTimeout(() => {
      this.showTimeout = null;

      if (this.activeRequests === 0) {
        return;
      }

      this.visibleSince = Date.now();
      this.isVisible.set(true);
    }, SPINNER_SHOW_DELAY_MS);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    if (this.activeRequests > 0) {
      return;
    }

    this.clearShowTimeout();

    if (!this.isVisible()) {
      return;
    }

    const visibleForMs = Date.now() - this.visibleSince;
    const remainingVisibleMs = Math.max(0, SPINNER_MIN_VISIBLE_MS - visibleForMs);

    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      this.hideTimeout = null;

      if (this.activeRequests === 0) {
        this.isVisible.set(false);
      }
    }, remainingVisibleMs);
  }

  private clearShowTimeout(): void {
    if (!this.showTimeout) {
      return;
    }

    clearTimeout(this.showTimeout);
    this.showTimeout = null;
  }

  private clearHideTimeout(): void {
    if (!this.hideTimeout) {
      return;
    }

    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
  }
}
