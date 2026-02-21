import { describe, it, expect, vi } from 'vitest';
import { IntlApiTranslator } from '../src/adapters/intl-api';
import type { TranslationsMap } from '../src/adapters/intl-api';

describe('IntlApiTranslator', () => {
  const translations: TranslationsMap = {
    en: {
      'common.greeting': 'Hello',
      'common.welcome': 'Welcome {{name}}',
      'items.count': '{{count}} item',
      'items.count_plural': '{{count}} items',
    },
    fa: {
      'common.greeting': 'سلام',
      'common.welcome': 'خوش آمدید {{name}}',
    },
  };

  describe('translate', () => {
    it('returns translation for key in current language', () => {
      const translator = new IntlApiTranslator('en', translations);
      expect(translator.translate('common.greeting')).toBe('Hello');
    });

    it('returns key when translation missing and no defaultValue', () => {
      const translator = new IntlApiTranslator('en', translations);
      expect(translator.translate('missing.key')).toBe('missing.key');
    });

    it('returns defaultValue when translation missing', () => {
      const translator = new IntlApiTranslator('en', translations);
      expect(translator.translate('missing.key', { defaultValue: 'Fallback' })).toBe('Fallback');
    });

    it('interpolates {{key}} with options', () => {
      const translator = new IntlApiTranslator('en', translations);
      expect(translator.translate('common.welcome', { name: 'Jane' })).toBe('Welcome Jane');
    });

    it('interpolates {key} style', () => {
      const translator = new IntlApiTranslator('en', { en: { 'k': 'Hello {x}' } });
      expect(translator.translate('k', { x: 'World' })).toBe('Hello World');
    });

    it('does not replace ns, defaultValue, count, returnObjects in text', () => {
      const translator = new IntlApiTranslator('en', {
        en: { 'k': 'Value {{ns}} {{defaultValue}}' },
      });
      expect(translator.translate('k', { ns: 'app', defaultValue: 'def' })).toBe('Value {{ns}} {{defaultValue}}');
    });

    it('uses empty object when language has no translations', () => {
      const translator = new IntlApiTranslator('de', translations);
      expect(translator.translate('common.greeting')).toBe('common.greeting');
    });
  });

  describe('getCurrentLanguage', () => {
    it('returns initial language', () => {
      const translator = new IntlApiTranslator('fa', translations);
      expect(translator.getCurrentLanguage()).toBe('fa');
    });
  });

  describe('changeLanguage', () => {
    it('switches current language when target exists', async () => {
      const translator = new IntlApiTranslator('en', translations);
      await translator.changeLanguage('fa');
      expect(translator.getCurrentLanguage()).toBe('fa');
      expect(translator.translate('common.greeting')).toBe('سلام');
    });

    it('does not switch when target language not in map', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const translator = new IntlApiTranslator('en', translations);
      await translator.changeLanguage('de');
      expect(translator.getCurrentLanguage()).toBe('en');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Language 'de' not found"));
      warn.mockRestore();
    });
  });

  describe('exists', () => {
    it('returns true when key exists in current language', () => {
      const translator = new IntlApiTranslator('en', translations);
      expect(translator.exists('common.greeting')).toBe(true);
    });

    it('returns false when key missing', () => {
      const translator = new IntlApiTranslator('en', translations);
      expect(translator.exists('missing.key')).toBe(false);
    });

    it('reflects current language after changeLanguage', async () => {
      const translator = new IntlApiTranslator('en', translations);
      expect(translator.exists('common.greeting')).toBe(true);
      await translator.changeLanguage('fa');
      expect(translator.exists('common.greeting')).toBe(true);
    });
  });

  describe('addTranslations', () => {
    it('adds new language', () => {
      const translator = new IntlApiTranslator('en', translations);
      translator.addTranslations('de', { 'common.greeting': 'Hallo' });
      expect(translator.getAvailableLanguages()).toContain('de');
    });

    it('merges into existing language', () => {
      const translator = new IntlApiTranslator('en', translations);
      translator.addTranslations('en', { 'new.key': 'New Value' });
      expect(translator.translate('new.key')).toBe('New Value');
      expect(translator.translate('common.greeting')).toBe('Hello');
    });
  });

  describe('getAvailableLanguages', () => {
    it('returns all language codes', () => {
      const freshTranslations = { en: { ...translations.en }, fa: { ...translations.fa } };
      const translator = new IntlApiTranslator('en', freshTranslations);
      expect(translator.getAvailableLanguages()).toEqual(['en', 'fa']);
    });

    it('includes languages added via addTranslations', () => {
      const translator = new IntlApiTranslator('en', { en: {} });
      translator.addTranslations('fr', {});
      expect(translator.getAvailableLanguages()).toContain('fr');
    });
  });
});
