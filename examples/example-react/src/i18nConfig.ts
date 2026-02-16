import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const i18nObject = i18n.use(LanguageDetector).use(initReactI18next);

i18nObject.init({
  fallbackLng: 'fa',
  // debug: process.env.NODE_ENV === "development",
  detection: {
    caches: ['localStorage', 'cookie'],
    lookupLocalStorage: 'lng',
    lookupCookie: 'lng',
    cookieMinutes: 1000,
    order: ['localStorage', 'cookie'],
  },

  react: {
    bindI18n: 'languageChanged loaded',
    nsMode: 'default',
    useSuspense: true,
  },
  interpolation: {
    escapeValue: false,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addTranslationSchema = (locale: 'fa' | 'en', resources: any) => {
  i18nObject.addResourceBundle(
    locale,
    'translation',
    resources,
    true,
    true
  );
};

export { i18nObject, addTranslationSchema };
