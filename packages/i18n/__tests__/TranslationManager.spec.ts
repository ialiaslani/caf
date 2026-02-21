import { describe, it, expect, vi } from 'vitest';
import { TranslationManager } from '../src/TranslationManager';
import type { ITranslator } from '../src/ITranslator';

function createMockTranslator(overrides?: Partial<ITranslator>): ITranslator {
  return {
    translate: vi.fn((key: string) => key),
    getCurrentLanguage: vi.fn(() => 'en'),
    changeLanguage: vi.fn(() => Promise.resolve()),
    exists: vi.fn((key: string) => key.startsWith('valid.')),
    ...overrides,
  };
}

describe('TranslationManager', () => {
  describe('t', () => {
    it('delegates to translator.translate', () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      manager.t('common.save');
      expect(translator.translate).toHaveBeenCalledWith('common.save', undefined);
    });

    it('passes options to translator', () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      manager.t('user.name', { name: 'John' });
      expect(translator.translate).toHaveBeenCalledWith('user.name', { name: 'John' });
    });
  });

  describe('translateWithValues', () => {
    it('calls translator with key and values', () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      manager.translateWithValues('greeting', { name: 'Jane' });
      expect(translator.translate).toHaveBeenCalledWith('greeting', { name: 'Jane' });
    });
  });

  describe('translatePlural', () => {
    it('calls translator with count in options', () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      manager.translatePlural('items.count', 5);
      expect(translator.translate).toHaveBeenCalledWith('items.count', { count: 5 });
    });

    it('merges extra options with count', () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      manager.translatePlural('items.count', 3, { name: 'Test' });
      expect(translator.translate).toHaveBeenCalledWith('items.count', { name: 'Test', count: 3 });
    });
  });

  describe('getCurrentLanguage', () => {
    it('returns value from translator', () => {
      const translator = createMockTranslator({ getCurrentLanguage: () => 'fa' });
      const manager = new TranslationManager(translator);
      expect(manager.getCurrentLanguage()).toBe('fa');
    });
  });

  describe('changeLanguage', () => {
    it('delegates to translator.changeLanguage', async () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      await manager.changeLanguage('fr');
      expect(translator.changeLanguage).toHaveBeenCalledWith('fr');
    });

    it('handles sync changeLanguage (void)', async () => {
      const translator = createMockTranslator({
        changeLanguage: vi.fn(() => undefined),
      });
      const manager = new TranslationManager(translator);
      await manager.changeLanguage('de');
      expect(translator.changeLanguage).toHaveBeenCalledWith('de');
    });
  });

  describe('hasKey', () => {
    it('delegates to translator.exists', () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      expect(manager.hasKey('valid.key')).toBe(true);
      expect(manager.hasKey('missing.key')).toBe(false);
    });
  });

  describe('getTranslator', () => {
    it('returns the underlying translator', () => {
      const translator = createMockTranslator();
      const manager = new TranslationManager(translator);
      expect(manager.getTranslator()).toBe(translator);
    });
  });
});
