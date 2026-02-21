import { describe, it, expect, beforeEach } from 'vitest';
import { Ploc } from '@c-a-f/core';
import { CAFDevToolsService } from './CAFDevToolsService';

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
}

describe('CAFDevToolsService', () => {
  let service: CAFDevToolsService;

  beforeEach(() => {
    service = new CAFDevToolsService();
  });

  it('initial enabled is false', () => {
    expect(service.enabled()).toBe(false);
  });

  it('enable() sets enabled to true', () => {
    service.enable();
    expect(service.enabled()).toBe(true);
  });

  it('disable() sets enabled to false', () => {
    service.enable();
    service.disable();
    expect(service.enabled()).toBe(false);
  });

  it('trackPloc adds ploc to map', () => {
    const ploc = new CounterPloc(1);
    service.trackPloc(ploc, 'Counter');
    expect(service.plocs.has(ploc)).toBe(true);
    expect(service.plocs.get(ploc)?.name).toBe('Counter');
  });

  it('untrackPloc removes ploc from map', () => {
    const ploc = new CounterPloc(1);
    service.trackPloc(ploc);
    service.untrackPloc(ploc);
    expect(service.plocs.has(ploc)).toBe(false);
  });
});
