import type { Ploc } from '@c.a.f/core';
import { Injectable, signal, type WritableSignal } from '@angular/core';

/**
 * Minimal DevTools service for CAF Angular apps.
 * Tracks enabled state and registered Plocs for debugging (e.g. console inspection).
 * For full Ploc state history and time-travel, use @c.a.f/devtools in your app and wrap Plocs there.
 */
@Injectable({ providedIn: 'root' })
export class CAFDevToolsService {
  readonly enabled: WritableSignal<boolean> = signal(false);

  /** Plocs registered via trackPloc(), for debugging. */
  readonly plocs = new Map<Ploc<unknown>, { name?: string }>();

  enable(): void {
    this.enabled.set(true);
  }

  disable(): void {
    this.enabled.set(false);
  }

  /**
   * Register a Ploc for DevTools (e.g. so it appears in __CAF_DEVTOOLS__ for console debugging).
   * Call in component when you have a Ploc; unregistration is automatic when the service is destroyed or you call untrackPloc.
   */
  trackPloc<T>(ploc: Ploc<T>, name?: string): void {
    this.plocs.set(ploc as Ploc<unknown>, { name });
  }

  untrackPloc(ploc: Ploc<unknown>): void {
    this.plocs.delete(ploc);
  }
}
