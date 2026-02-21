import { Component, Injector, OnInit, signal, type WritableSignal } from '@angular/core';
import { getPlocFromContext, plocToObservable } from '@c-a-f/infrastructure-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import type { UserPloc } from '../../../caf/application';
import type { UserState } from '../../../caf/application';

@Component({
  selector: 'app-users',
  standalone: true,
  template: `
    <h2>Users (WebSocket + real-time)</h2>
    @if (state(); as s) {
      @if (s.loading && s.users.length === 0) {
        <p>Loading users...</p>
      } @else {
        <ul>
          @for (u of s.users; track u.id) {
            <li>{{ u.name }} — {{ u.email }}</li>
          }
        </ul>
        @if (s.error) {
          <p class="error">{{ s.error }}</p>
        }
        <button (click)="load()" [disabled]="s.loading">Refresh</button>
      }
    }
  `,
  styles: [
    `
      .error { color: #c00; }
      ul { list-style: none; padding: 0; }
      li { padding: 0.25rem 0; }
    `,
  ],
})
export class UsersComponent implements OnInit {
  private ploc: UserPloc | undefined;
  state!: WritableSignal<UserState | null>;

  constructor(private injector: Injector) {
    this.ploc = getPlocFromContext<UserPloc>(this.injector, 'user');
    this.state = this.ploc
      ? toSignal(plocToObservable(this.ploc), { initialValue: this.ploc.state as UserState })
      : signal(null as UserState | null);
  }

  ngOnInit(): void {
    this.ploc?.loadUsers();
  }

  load(): void {
    this.ploc?.loadUsers();
  }
}
