/**
 * Vue testing utilities for CAF.
 *
 * - mountWithCAF: mount with CAF context (Ploc/UseCase provide)
 * - createTestPloc: create a test Ploc with controllable state
 * - waitForPlocState: wait for Ploc state to match a predicate
 * - mockUseCase: mock UseCase (success, error, async, fn)
 */

export { mountWithCAF, type MountWithCAFOptions } from './mountWithCAF';
export { createTestPloc } from './createTestPloc';
export { waitForPlocState } from './waitForPlocState';
export { mockUseCase } from './mockUseCase';
