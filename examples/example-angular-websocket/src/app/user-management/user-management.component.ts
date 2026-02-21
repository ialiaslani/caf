import {
  Component,
  Injector,
  OnInit,
  signal,
  type Signal,
  inject,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getPlocFromContext, plocToObservable } from '@c-a-f/infrastructure-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import type { UserPloc } from '../../../caf/application';
import type { UserState } from '../../../caf/application';
import type { User } from '../../../caf/domain';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <h1 class="title">CAF Demo</h1>
        <p class="subtitle">Clean Architecture Frontend – Reactive State (WebSocket)</p>
        <div class="badges">
          <span class="badge">@c-a-f/core</span>
          <span class="badge">@c-a-f/infrastructure-angular</span>
          <span class="badge">@c-a-f/validation</span>
          <span class="badge">WebSocket</span>
        </div>
      </div>

      <div class="grid">
        <!-- Users list -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Users List</h2>
            <button
              type="button"
              class="btn btn-primary"
              (click)="loadUsers()"
              [disabled]="state()?.loading ?? false"
            >
              {{ state()?.loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>

          @if (state(); as s) {
            @if (s.error) {
              <div class="alert alert-error">
                {{ s.error }}
                <button type="button" class="alert-dismiss" (click)="clearError()">×</button>
              </div>
            }
            @if (s.loading && s.users.length === 0) {
              <div class="loading">Loading users...</div>
            }
            @if (s.users.length === 0 && !s.loading) {
              <p class="empty">No users found. Create one below!</p>
            }
            <ul class="user-list">
              @for (u of s.users; track u.id) {
                <li
                  class="user-item"
                  [class.selected]="(state()?.selectedUser?.id) === u.id"
                  (click)="selectUser(u)"
                >
                  <span class="user-avatar">{{ u.name?.[0]?.toUpperCase() || '?' }}</span>
                  <div class="user-info">
                    <span class="user-name">{{ u.name || '(No name)' }}</span>
                    <span class="user-email">{{ u.email || '(No email)' }}</span>
                  </div>
                  @if ((state()?.selectedUser?.id) === u.id) {
                    <span class="check">✓</span>
                  }
                </li>
              }
            </ul>
          }
        </div>

        <!-- Create user form -->
        <div class="card">
          <h2 class="card-title">Create New User</h2>

          <form class="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label for="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter user name"
                [value]="newName()"
                (input)="onNameInput($event)"
                [disabled]="creating()"
              />
              @if (nameError()) {
                <span class="field-error">{{ nameError() }}</span>
              }
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter user email"
                [value]="newEmail()"
                (input)="onEmailInput($event)"
                [disabled]="creating()"
              />
              @if (emailError()) {
                <span class="field-error">{{ emailError() }}</span>
              }
            </div>

            @if (state()?.validationErrors && validationErrorSummary()) {
              <div class="alert alert-warning">
                <strong>Validation:</strong> {{ validationErrorSummary() }}
              </div>
            }

            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="!canSubmit()"
            >
              {{ creating() ? 'Creating...' : 'Create User' }}
            </button>
          </form>

          <p class="hint">Data is synced via WebSocket; new users appear in the list in real time.</p>
        </div>
      </div>

      @if (state(); as s) {
        <p class="footer">Total users: <strong>{{ s.users.length }}</strong></p>
      }
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 1rem;
      }
      .header {
        text-align: center;
        margin-bottom: 3rem;
        color: white;
      }
      .title { font-size: 2rem; margin: 0 0 0.5rem; }
      .subtitle { font-size: 1.1rem; opacity: 0.9; margin-bottom: 1.5rem; }
      .badges { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
      .badge {
        padding: 0.25rem 0.75rem;
        background: rgba(255,255,255,0.2);
        border-radius: 9999px;
        font-size: 0.85rem;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto 2rem;
      }
      .card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .card-title { margin: 0 0 1rem; font-size: 1.25rem; }
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: #f5f5f5;
        cursor: pointer;
        font-size: 0.95rem;
      }
      .btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .btn-primary { background: #667eea; color: white; border-color: #667eea; }
      .btn-block { width: 100%; margin-top: 0.5rem; }
      .alert {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ef5350; }
      .alert-warning { background: #fff3e0; color: #e65100; border: 1px solid #ff9800; }
      .alert-dismiss { background: none; border: none; font-size: 1.25rem; cursor: pointer; }
      .loading, .empty { text-align: center; color: #666; padding: 2rem; }
      .user-list { list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto; }
      .user-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        cursor: pointer;
        background: #fafafa;
        transition: all 0.2s;
      }
      .user-item:hover { background: #f5f5f5; }
      .user-item.selected {
        border-color: #667eea;
        background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
      }
      .user-avatar {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
      .user-info { flex: 1; display: flex; flex-direction: column; }
      .user-name { font-weight: 600; color: #333; }
      .user-email { font-size: 0.9rem; color: #666; }
      .check { color: #667eea; font-size: 1.2rem; }
      .form { display: flex; flex-direction: column; gap: 1rem; }
      .field label { display: block; margin-bottom: 0.25rem; font-weight: 500; color: #333; }
      .field input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
      }
      .field input:focus { outline: none; border-color: #667eea; }
      .field-error { font-size: 0.85rem; color: #c62828; }
      .hint { font-size: 0.9rem; color: #666; margin-top: 1rem; }
      .footer { text-align: center; color: white; margin-top: 2rem; }
    `,
  ],
})
export class UserManagementComponent implements OnInit {
  private injector = inject(Injector);
  private ploc: UserPloc | undefined;
  state!: Signal<UserState | null>;

  newName = signal('');
  newEmail = signal('');
  creating = signal(false);

  nameError = computed(() => {
    const s = this.state?.();
    if (!s?.validationErrors) return null;
    return s.validationErrors['name'] ?? null;
  });
  emailError = computed(() => {
    const s = this.state?.();
    if (!s?.validationErrors) return null;
    return s.validationErrors['email'] ?? null;
  });
  validationErrorSummary = computed(() => {
    const s = this.state?.();
    if (!s?.validationErrors) return null;
    const entries = Object.entries(s.validationErrors).filter(([, v]) => v);
    return entries.length ? entries.map(([k, v]) => `${k}: ${v}`).join('; ') : null;
  });

  constructor() {
    this.ploc = getPlocFromContext<UserPloc>(this.injector, 'user');
    this.state = this.ploc
      ? toSignal(plocToObservable(this.ploc), {
          initialValue: this.ploc.state as UserState,
        })
      : signal(null as UserState | null);
  }

  ngOnInit(): void {
    this.ploc?.loadUsers();
  }

  loadUsers(): void {
    this.ploc?.loadUsers();
  }

  clearError(): void {
    this.ploc?.clearError();
  }

  selectUser(user: User | null): void {
    this.ploc?.selectUser(user ?? null);
  }

  onNameInput(e: Event): void {
    this.newName.set((e.target as HTMLInputElement).value);
  }
  onEmailInput(e: Event): void {
    this.newEmail.set((e.target as HTMLInputElement).value);
  }

  canSubmit(): boolean {
    return (
      !!this.newName().trim() &&
      !!this.newEmail().trim() &&
      !this.creating() &&
      !!this.ploc
    );
  }

  async onSubmit(): Promise<void> {
    const name = this.newName().trim();
    const email = this.newEmail().trim();
    if (!name || !email || !this.ploc || this.creating()) return;

    this.creating.set(true);
    try {
      await this.ploc.createUser({ name, email });
      this.newName.set('');
      this.newEmail.set('');
    } finally {
      this.creating.set(false);
    }
  }
}
