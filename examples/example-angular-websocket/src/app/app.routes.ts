import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  {
    path: 'users',
    loadComponent: () =>
      import('./user-management/user-management.component').then((m) => m.UserManagementComponent),
  },
  {
    path: 'patterns',
    loadComponent: () =>
      import('./patterns/patterns.component').then((m) => m.PatternsComponent),
  },
];
