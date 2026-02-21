/**
 * Test helpers for I18n.
 * 
 * Provides utilities for testing translation managers and translators.
 * 
 * @example
 * ```ts
 * import { createMockTranslator, createTranslationTester } from '@c-a-f/testing/i18n';
 * import { TranslationManager } from '@c-a-f/i18n';
 * 
 * const mockTranslator = createMockTranslator({
 *   en: { 'greeting': 'Hello', 'welcome': 'Welcome {{name}}' },
 *   fa: { 'greeting': 'سلام', 'welcome': 'خوش آمدید {{name}}' },
 * });
 * const manager = new TranslationManager(mockTranslator);
 * const tester = createTranslationTester(manager);
 * 
 * expect(tester.t('greeting')).toBe('Hello');
 * ```
 */

import type { ITranslator, TranslationManager } from '@c-a-f/i18n';

/**
 * Mock Translator implementation for testing.
 */
export class MockTranslator implements ITranslator {
  constructor(
    private translations: Record<string, Record<string, string>> = {},
    private currentLanguage: string = 'en'
  ) {}

  translate(key: string, options?: Record<string, unknown>): string {
    const langTranslations = this.translations[this.currentLanguage] || {};
    let text = langTranslations[key] || key;

    // Simple interpolation
    if (options) {
      Object.keys(options).forEach((k) => {
        if (k !== 'ns' && k !== 'defaultValue' && k !== 'count' && k !== 'returnObjects') {
          const value = String(options[k]);
          text = text.replace(new RegExp(`{{${k}}}`, 'g'), value);
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), value);
        }
      });
    }

    return text;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  async changeLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
  }

  exists(key: string): boolean {
    const langTranslations = this.translations[this.currentLanguage] || {};
    return key in langTranslations;
  }

  /**
   * Add translations (for testing).
   */
  addTranslations(language: string, translations: Record<string, string>): void {
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    this.translations[language] = { ...this.translations[language], ...translations };
  }
}

/**
 * Create a mock Translator.
 */
export function createMockTranslator(
  translations: Record<string, Record<string, string>> = {},
  initialLanguage: string = 'en'
): MockTranslator {
  return new MockTranslator(translations, initialLanguage);
}

/**
 * Translation tester utility.
 */
export class TranslationTester {
  constructor(public readonly manager: TranslationManager) {}

  /**
   * Translate a key.
   */
  t(key: string, options?: Record<string, unknown>): string {
    return this.manager.t(key, options);
  }

  /**
   * Translate with values.
   */
  translateWithValues(key: string, values: Record<string, unknown>): string {
    return this.manager.translateWithValues(key, values);
  }

  /**
   * Translate plural.
   */
  translatePlural(key: string, count: number, options?: Record<string, unknown>): string {
    return this.manager.translatePlural(key, count, options);
  }

  /**
   * Get current language.
   */
  getCurrentLanguage(): string {
    return this.manager.getCurrentLanguage();
  }

  /**
   * Change language.
   */
  async changeLanguage(language: string): Promise<void> {
    await this.manager.changeLanguage(language);
  }

  /**
   * Check if key exists.
   */
  hasKey(key: string): boolean {
    return this.manager.hasKey(key);
  }
}

/**
 * Create a Translation tester instance.
 */
export function createTranslationTester(manager: TranslationManager): TranslationTester {
  return new TranslationTester(manager);
}
