/**
 * Provide CAF context (Plocs/UseCases) in Angular tests. Use with TestBed:
 *
 * @example
 * ```ts
 * import { TestBed } from '@angular/core/testing';
 * import { provideTestingCAF, createTestPloc, mockUseCase } from '@c-a-f/testing/angular';
 *
 * const ploc = createTestPloc({ count: 0 });
 * await TestBed.configureTestingModule({
 *   imports: [MyComponent],
 *   providers: [provideTestingCAF({ plocs: { counter: ploc }, useCases: { submit: mockUseCase.success({ id: '1' }) })],
 * }).compileComponents();
 *
 * const fixture = TestBed.createComponent(MyComponent);
 * ```
 */

import type { Provider } from '@angular/core';
import type { Ploc, UseCase } from '@c-a-f/core';
import { provideCAF as provideCAFFromInfra } from '@c-a-f/infrastructure-angular';

export interface ProvideTestingCAFConfig {
  plocs?: Record<string, Ploc<unknown>>;
  useCases?: Record<string, UseCase<any[], any>>;
}

/**
 * Returns Angular providers for CAF context. Use in TestBed.configureTestingModule providers.
 * Same as provideCAF from @c-a-f/infrastructure-angular; re-exported here so tests
 * can use a single import from @c-a-f/testing/angular.
 */
export function provideTestingCAF(config: ProvideTestingCAFConfig): Provider {
  return provideCAFFromInfra(config);
}
