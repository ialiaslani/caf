/**
 * react-intl adapter for CAF I18n.
 * 
 * This adapter allows you to use react-intl (FormatJS) with CAF's I18n interfaces.
 * 
 * @example
 * ```ts
 * import { IntlProvider, useIntl } from 'react-intl';
 * import { ReactIntlTranslator } from '@c-a-f/i18n/react-intl';
 * import { TranslationManager } from '@c-a-f/i18n';
 * 
 * // In your component
 * function MyComponent() {
 *   const intl = useIntl();
 *   const translator = new ReactIntlTranslator(intl);
 *   const translationManager = new TranslationManager(translator);
 *   
 *   // Use in your application
 *   const greeting = translationManager.t('common.greeting');
 * }
 * ```
 */

import type { ITranslator, TranslationOptions } from '../ITranslator';

/**
 * react-intl translator adapter.
 * 
 * Implements ITranslator interface using react-intl (FormatJS) library.
 */
export class ReactIntlTranslator implements ITranslator {
  constructor(private intl: {
    formatMessage: (descriptor: { id: string; defaultMessage?: string }, values?: Record<string, unknown>) => string;
    locale: string;
  }) {}

  translate(key: string, options?: TranslationOptions): string {
    return this.intl.formatMessage(
      {
        id: key,
        defaultMessage: options?.defaultValue,
      },
      options
    );
  }

  getCurrentLanguage(): string {
    return this.intl.locale;
  }

  async changeLanguage(language: string): Promise<void> {
    // react-intl language changes are handled by IntlProvider
    // This is a no-op as the locale is controlled by the provider
    // Users should update the IntlProvider's locale prop
    console.warn(
      'ReactIntlTranslator.changeLanguage() is a no-op. Update IntlProvider locale prop instead.'
    );
  }

  exists(key: string): boolean {
    // react-intl doesn't have a direct exists method
    // We check if the formatted message differs from the key
    const message = this.intl.formatMessage({ id: key });
    return message !== key;
  }
}
