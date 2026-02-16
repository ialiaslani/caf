/**
 * Native Intl API adapter for CAF I18n.
 * 
 * This adapter provides a simple implementation using the browser's native Intl API.
 * Useful for basic translation needs without external libraries.
 * 
 * @example
 * ```ts
 * import { IntlApiTranslator } from '@caf/i18n/intl-api';
 * import { TranslationManager } from '@caf/i18n';
 * 
 * // Create translator with translations map
 * const translations = {
 *   en: {
 *     'common.greeting': 'Hello',
 *     'common.welcome': 'Welcome {{name}}',
 *   },
 *   fa: {
 *     'common.greeting': 'سلام',
 *     'common.welcome': 'خوش آمدید {{name}}',
 *   },
 * };
 * 
 * const translator = new IntlApiTranslator('en', translations);
 * const translationManager = new TranslationManager(translator);
 * 
 * // Use in your application
 * const greeting = translationManager.t('common.greeting');
 * await translationManager.changeLanguage('fa');
 * ```
 */

import type { ITranslator, TranslationOptions } from '../ITranslator';

/**
 * Translations map structure.
 * Maps language codes to translation key-value pairs.
 */
export interface TranslationsMap {
  [language: string]: {
    [key: string]: string;
  };
}

/**
 * Native Intl API translator adapter.
 * 
 * Implements ITranslator interface using a simple translations map.
 * Provides basic interpolation and language switching.
 */
export class IntlApiTranslator implements ITranslator {
  constructor(
    private currentLanguage: string,
    private translations: TranslationsMap = {}
  ) {}

  translate(key: string, options?: TranslationOptions): string {
    const langTranslations = this.translations[this.currentLanguage] || {};
    let text = langTranslations[key] || options?.defaultValue || key;

    // Simple interpolation
    if (options) {
      Object.keys(options).forEach((k) => {
        if (
          k !== 'ns' &&
          k !== 'defaultValue' &&
          k !== 'count' &&
          k !== 'returnObjects'
        ) {
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
    if (this.translations[language]) {
      this.currentLanguage = language;
    } else {
      console.warn(`Language '${language}' not found in translations map`);
    }
  }

  exists(key: string): boolean {
    const langTranslations = this.translations[this.currentLanguage] || {};
    return key in langTranslations;
  }

  /**
   * Add or update translations for a language.
   */
  addTranslations(language: string, translations: Record<string, string>): void {
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    this.translations[language] = { ...this.translations[language], ...translations };
  }

  /**
   * Get all available languages.
   */
  getAvailableLanguages(): string[] {
    return Object.keys(this.translations);
  }
}
