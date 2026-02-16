/**
 * ngx-translate adapter for CAF I18n.
 * 
 * This adapter allows you to use ngx-translate with CAF's I18n interfaces.
 * 
 * @example
 * ```ts
 * import { TranslateService } from '@ngx-translate/core';
 * import { NgxTranslateTranslator } from '@caf/i18n/ngx-translate';
 * import { TranslationManager } from '@caf/i18n';
 * 
 * // In Angular service/component
 * constructor(private translate: TranslateService) {
 *   const translator = new NgxTranslateTranslator(translate);
 *   const translationManager = new TranslationManager(translator);
 *   
 *   // Use in your application
 *   const greeting = translationManager.t('common.greeting');
 * }
 * ```
 */

import type { ITranslator, TranslationOptions } from '../ITranslator';

/**
 * ngx-translate translator adapter.
 * 
 * Implements ITranslator interface using ngx-translate library.
 */
export class NgxTranslateTranslator implements ITranslator {
  constructor(private translateService: any) {}

  translate(key: string, options?: TranslationOptions): string {
    // ngx-translate uses get() for synchronous translation
    return this.translateService.instant(key, options);
  }

  getCurrentLanguage(): string {
    return this.translateService.currentLang || this.translateService.defaultLang;
  }

  async changeLanguage(language: string): Promise<void> {
    await this.translateService.use(language).toPromise();
  }

  exists(key: string): boolean {
    // ngx-translate doesn't have a direct exists method, so we check if translation differs from key
    const translation = this.translateService.instant(key);
    return translation !== key;
  }
}
