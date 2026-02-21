import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCAF, RouteHandler } from '@c-a-f/infrastructure-angular';
import { setupUserPloc } from '../../caf/setup';
import { routes } from './app.routes';
import { AppRouteHandler } from './route-handler';

const { ploc, createUserUseCase } = setupUserPloc();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    { provide: RouteHandler, useClass: AppRouteHandler },
    provideCAF({ plocs: { user: ploc }, useCases: { createUser: createUserUseCase } }),
  ],
};
