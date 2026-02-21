import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">
      <header>
        <h1>CAF Angular WebSocket Example</h1>
        <nav>
          <a routerLink="/users" routerLinkActive="active">Users</a>
        </nav>
      </header>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .app { max-width: 800px; margin: 0 auto; padding: 1rem; }
      header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
      nav a { margin-left: 1rem; color: #1976d2; }
      nav a.active { font-weight: bold; }
    `,
  ],
})
export class App {}
