'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../../locales/en/common.json';
import hiCommon from '../../locales/hi/common.json';
import mrCommon from '../../locales/mr/common.json';
import knCommon from '../../locales/kn/common.json';
import taCommon from '../../locales/ta/common.json';

const STORAGE_KEY = 'farmchain_language';
export const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'kn', 'ta'];

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
    return stored;
  }

  const browserLang = (navigator.language || 'en').toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
}

export function persistLanguage(language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }
}

export function initializeI18n() {
  if (i18n.isInitialized) {
    return i18n;
  }

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { common: enCommon },
        hi: { common: hiCommon },
        mr: { common: mrCommon },
        kn: { common: knCommon },
        ta: { common: taCommon },
      },
      lng: getInitialLanguage(),
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common'],
      interpolation: { escapeValue: false },
      returnNull: false,
      returnEmptyString: false,
    });

  persistLanguage(i18n.language);
  return i18n;
}

export default i18n;
