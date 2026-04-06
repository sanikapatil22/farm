'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { initializeI18n } from '@/lib/i18n';

initializeI18n();

export default function I18nProvider({ children }) {
  useEffect(() => {
    initializeI18n();
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
