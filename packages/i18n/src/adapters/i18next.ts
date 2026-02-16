/**
 * i18next adapter for CAF I18n.
 * 
 * This adapter allows you to use i18next with CAF's I18n interfaces.
 * 
 * @example
 * ```ts
 * import i18n from 'i18next';
 * import { I18nextTranslator } from '@caf/i18n/i18next';
 * import { TranslationManager } from '@caf/i18n';
 * 
 * // Initialize i18next
 * await i18n.init({ ... });
 * 
 * // Create translator adapter
 * const translator = new I18nextTranslator(i18n);
 * const translationManager = new TranslationManager(translator);
 * 
 * // Use in your application
 * const greeting = translationManager.t('common.greeting');
 * ```
 */

import type { ITranslator, TranslationOptions } from '../ITranslator';

/**
 * i18next translator adapter.
 * 
 * Implements ITranslator interface using i18next library.
 */
export class I18nextTranslator implements ITranslator {
  constructor(private i18n: any) {}

  translate(key: string, options?: TranslationOptions): string {
    return this.i18n.t(key, options);
  }

  getCurrentLanguage(): string {
    return this.i18n.language;
  }

  async changeLanguage(language: string): Promise<void> {
    await this.i18n.changeLanguage(language);
  }

  exists(key: string): boolean {
    return this.i18n.exists(key);
  }
}
