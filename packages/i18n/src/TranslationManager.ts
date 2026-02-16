import type { ITranslator, TranslationOptions } from './ITranslator';

/**
 * Translation manager utility.
 * 
 * Provides convenient methods for translation using a translator implementation.
 * Can be used in use cases, Plocs, or infrastructure layers.
 */
export class TranslationManager {
  constructor(private translator: ITranslator) {}

  /**
   * Translate a key to the current language.
   * @param key Translation key
   * @param options Optional translation options
   * @returns Translated string
   */
  t(key: string, options?: TranslationOptions): string {
    return this.translator.translate(key, options);
  }

  /**
   * Translate with interpolation.
   * @param key Translation key
   * @param values Interpolation values
   * @returns Translated string with interpolated values
   */
  translateWithValues(key: string, values: Record<string, unknown>): string {
    return this.translator.translate(key, values);
  }

  /**
   * Translate with pluralization.
   * @param key Translation key
   * @param count Count for pluralization
   * @param options Additional translation options
   * @returns Translated string with pluralization
   */
  translatePlural(
    key: string,
    count: number,
    options?: Omit<TranslationOptions, 'count'>
  ): string {
    return this.translator.translate(key, { ...options, count });
  }

  /**
   * Get the current language code.
   */
  getCurrentLanguage(): string {
    return this.translator.getCurrentLanguage();
  }

  /**
   * Change the current language.
   */
  async changeLanguage(language: string): Promise<void> {
    await this.translator.changeLanguage(language);
  }

  /**
   * Check if a translation key exists.
   */
  hasKey(key: string): boolean {
    return this.translator.exists(key);
  }

  /**
   * Get the underlying translator.
   */
  getTranslator(): ITranslator {
    return this.translator;
  }
}
