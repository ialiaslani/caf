/**
 * next-intl adapter for CAF I18n.
 * 
 * This adapter allows you to use next-intl with CAF's I18n interfaces.
 * 
 * @example
 * ```ts
 * import { useTranslations } from 'next-intl';
 * import { NextIntlTranslator } from '@c.a.f/i18n/next-intl';
 * import { TranslationManager } from '@c.a.f/i18n';
 * 
 * // In your Next.js component
 * export default function MyComponent() {
 *   const t = useTranslations();
 *   const translator = new NextIntlTranslator(t);
 *   const translationManager = new TranslationManager(translator);
 *   
 *   // Use in your application
 *   const greeting = translationManager.t('common.greeting');
 * }
 * ```
 */

import type { ITranslator, TranslationOptions } from '../ITranslator';

/**
 * next-intl translator adapter.
 * 
 * Implements ITranslator interface using next-intl library.
 */
export class NextIntlTranslator implements ITranslator {
  constructor(
    private t: (key: string, values?: Record<string, unknown>) => string,
    private locale?: string
  ) {}

  translate(key: string, options?: TranslationOptions): string {
    // Merge options into values for next-intl
    const values = options ? { ...options } : {};
    // Remove non-value properties
    if (values.ns) delete values.ns;
    if (values.defaultValue) delete values.defaultValue;
    if (values.returnObjects) delete values.returnObjects;
    
    return this.t(key, values);
  }

  getCurrentLanguage(): string {
    return this.locale || 'en';
  }

  async changeLanguage(language: string): Promise<void> {
    // next-intl language changes are handled by Next.js routing
    // This is a no-op as the locale is controlled by Next.js routing
    // Users should use Next.js routing to change language
    console.warn(
      'NextIntlTranslator.changeLanguage() is a no-op. Use Next.js routing to change language.'
    );
  }

  exists(key: string): boolean {
    // next-intl doesn't have a direct exists method
    // We check if the translated message differs from the key
    try {
      const message = this.t(key);
      return message !== key;
    } catch {
      return false;
    }
  }
}
