'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../../locales/en/common.json';
import bnCommon from '../../locales/bn/common.json';
import hiCommon from '../../locales/hi/common.json';
import knCommon from '../../locales/kn/common.json';
import mlCommon from '../../locales/ml/common.json';
import mrCommon from '../../locales/mr/common.json';
import taCommon from '../../locales/ta/common.json';
import teCommon from '../../locales/te/common.json';
import urCommon from '../../locales/ur/common.json';

const STORAGE_KEY = 'farmchain_language';
export const SUPPORTED_LANGUAGES = [
  'en',
  'bn',
  'hi',
  'kn',
  'ml',
  'mr',
  'ta',
  'te',
  'ur',
];

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
  }
}

export function applyDocumentLanguage(language) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = language || 'en';
  document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
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
        bn: { common: bnCommon },
        hi: { common: hiCommon },
        kn: { common: knCommon },
        ml: { common: mlCommon },
        mr: { common: mrCommon },
        ta: { common: taCommon },
        te: { common: teCommon },
        ur: { common: urCommon },
      },
      lng: getInitialLanguage(),
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common'],
      react: { useSuspense: false },
      interpolation: { escapeValue: false },
      returnNull: false,
      returnEmptyString: false,
    });

  persistLanguage(i18n.language);
  return i18n;
}

initializeI18n();

export default i18n;
