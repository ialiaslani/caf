/**
 * Internationalization (i18n) interfaces.
 * 
 * Provides framework-agnostic interfaces for translation.
 * Infrastructure layers should implement these interfaces (e.g., using i18next).
 */

/**
 * Translation options for interpolation and pluralization.
 */
export interface TranslationOptions {
  /** Interpolation values (e.g., { name: 'John' } for "Hello {{name}}") */
  [key: string]: unknown;
  /** Optional namespace for translations */
  ns?: string;
  /** Optional default value if translation key is not found */
  defaultValue?: string;
  /** Optional count for pluralization */
  count?: number;
  /** Optional return objects flag (for complex translations) */
  returnObjects?: boolean;
}

/**
 * Translator interface.
 * 
 * Implement this interface in infrastructure layers to provide translation functionality.
 * Can be implemented using i18next, vue-i18n, ngx-translate, or any other i18n library.
 * 
 * @example
 * ```ts
 * class I18nextTranslator implements ITranslator {
 *   constructor(private i18n: i18n) {}
 *   
 *   translate(key: string, options?: TranslationOptions): string {
 *     return this.i18n.t(key, options);
 *   }
 *   
 *   getCurrentLanguage(): string {
 *     return this.i18n.language;
 *   }
 *   
 *   changeLanguage(language: string): Promise<void> {
 *     return this.i18n.changeLanguage(language);
 *   }
 * }
 * ```
 */
export interface ITranslator {
  /**
   * Translate a key to the current language.
   * @param key Translation key (e.g., 'user.name', 'common.save')
   * @param options Optional translation options (interpolation, pluralization, etc.)
   * @returns Translated string
   */
  translate(key: string, options?: TranslationOptions): string;
  
  /**
   * Get the current language code.
   * @returns Current language code (e.g., 'en', 'fa', 'fr')
   */
  getCurrentLanguage(): string;
  
  /**
   * Change the current language.
   * @param language Language code to switch to
   * @returns Promise that resolves when language change is complete
   */
  changeLanguage(language: string): Promise<void> | void;
  
  /**
   * Check if a translation key exists.
   * @param key Translation key to check
   * @returns True if key exists, false otherwise
   */
  exists(key: string): boolean;
}
