/**
 * vue-i18n adapter for CAF I18n.
 * 
 * This adapter allows you to use vue-i18n with CAF's I18n interfaces.
 * 
 * @example
 * ```ts
 * import { createI18n } from 'vue-i18n';
 * import { VueI18nTranslator } from '@caf/i18n/vue-i18n';
 * import { TranslationManager } from '@caf/i18n';
 * 
 * // Initialize vue-i18n
 * const i18n = createI18n({ ... });
 * 
 * // Create translator adapter
 * const translator = new VueI18nTranslator(i18n.global);
 * const translationManager = new TranslationManager(translator);
 * 
 * // Use in your application
 * const greeting = translationManager.t('common.greeting');
 * ```
 */

import type { ITranslator, TranslationOptions } from '../ITranslator';

/**
 * vue-i18n translator adapter.
 * 
 * Implements ITranslator interface using vue-i18n library.
 */
export class VueI18nTranslator implements ITranslator {
  constructor(private vueI18n: any) {}

  translate(key: string, options?: TranslationOptions): string {
    return this.vueI18n.t(key, options);
  }

  getCurrentLanguage(): string {
    return this.vueI18n.locale.value || this.vueI18n.locale;
  }

  async changeLanguage(language: string): Promise<void> {
    this.vueI18n.locale.value = language;
    if (typeof this.vueI18n.locale === 'string') {
      this.vueI18n.locale = language;
    }
  }

  exists(key: string): boolean {
    return this.vueI18n.te(key);
  }
}
