import { describe, it, expect } from 'vitest';
import { CAFErrorService } from './CAFErrorService';

describe('CAFErrorService', () => {
  it('initial error is null', () => {
    const service = new CAFErrorService();
    expect(service.error()).toBeNull();
  });

  it('setError sets error signal', () => {
    const service = new CAFErrorService();
    const err = new Error('test');
    service.setError(err);
    expect(service.error()).toBe(err);
  });

  it('resetError clears error', () => {
    const service = new CAFErrorService();
    service.setError(new Error('test'));
    expect(service.error()).not.toBeNull();
    service.resetError();
    expect(service.error()).toBeNull();
  });
});
