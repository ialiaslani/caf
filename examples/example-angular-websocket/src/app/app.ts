import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { injectRouteManager } from '@c-a-f/infrastructure-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <nav class="nav">
      <button
        type="button"
        class="nav-btn"
        [class.primary]="isActive('/users')"
        (click)="navigate('/users')"
      >
        User Management
      </button>
      <button
        type="button"
        class="nav-btn"
        [class.primary]="isActive('/patterns')"
        (click)="navigate('/patterns')"
      >
        Patterns
      </button>
      <div class="nav-route">
        <span>Current Route:</span>
        <code>{{ currentRoute }}</code>
      </div>
    </nav>
    <main class="main">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 1rem 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .nav-btn {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: #f5f5f5;
        cursor: pointer;
        font-size: 1rem;
      }
      .nav-btn.primary {
        background: #1976d2;
        color: white;
        border-color: #1976d2;
        font-weight: 600;
      }
      .nav-btn:hover:not(.primary) {
        background: #eee;
      }
      .nav-route {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: #666;
      }
      .nav-route code {
        padding: 0.25rem 0.5rem;
        background: #f5f5f5;
        border-radius: 4px;
        font-family: monospace;
      }
      .main {
        padding-top: 70px;
        min-height: 100vh;
      }
    `,
  ],
})
export class App {
  private router = inject(Router);
  private routeManager = injectRouteManager();

  get currentRoute(): string {
    return this.router.url;
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  navigate(path: string): void {
    this.routeManager.changeRoute(path);
  }
}
