import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IRouteManager } from '@caf/core/application';

@Injectable({
  providedIn: 'root'
})
export class RouteManager implements IRouteManager {
  constructor(private router: Router) {}

  public navigate(path: string, params?: any): void {
    this.router.navigate([path], { queryParams: params });
  }
}
