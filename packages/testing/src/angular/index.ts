/**
 * Angular testing utilities for CAF.
 *
 * - provideTestingCAF: provide CAF context in TestBed (plocs, useCases)
 * - createTestPloc: create a test Ploc with controllable state
 * - waitForPlocState: wait for Ploc state to match a predicate
 * - mockUseCase: mock UseCase (success, error, async, fn)
 */

export { provideTestingCAF, type ProvideTestingCAFConfig } from './provideTestingCAF';
export { createTestPloc } from './createTestPloc';
export { waitForPlocState } from './waitForPlocState';
export { mockUseCase } from './mockUseCase';
