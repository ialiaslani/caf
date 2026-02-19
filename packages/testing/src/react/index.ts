/**
 * React testing utilities for CAF.
 *
 * - renderWithCAF: render with CAFProvider (Ploc/UseCase context)
 * - createTestPloc: create a test Ploc with controllable state
 * - waitForPlocState: wait for Ploc state to match a predicate
 * - mockUseCase: mock UseCase (success, error, async, fn)
 */

export { renderWithCAF, type RenderWithCAFOptions } from './renderWithCAF';
export { createTestPloc } from './createTestPloc';
export { waitForPlocState } from './waitForPlocState';
export { mockUseCase } from './mockUseCase';
