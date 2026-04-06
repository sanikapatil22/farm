'use client';

import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { persistLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n';

const OPTIONS = [
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'hi', label: 'Hindi', flag: 'IN' },
  { code: 'mr', label: 'Marathi', flag: 'IN' },
  { code: 'kn', label: 'Kannada', flag: 'IN' },
  { code: 'ta', label: 'Tamil', flag: 'IN' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const value = (i18n?.language || 'en').split('-')[0];

  const handleChange = async (event) => {
    const next = event.target.value;
    if (!SUPPORTED_LANGUAGES.includes(next)) {
      return;
    }

    await i18n.changeLanguage(next);
    persistLanguage(next);
  };

  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <Languages className="h-4 w-4 text-emerald-600" />
      <span className="hidden sm:inline">{t('language')}</span>
      <select
        value={value}
        onChange={handleChange}
        className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
        aria-label={t('select_language')}
      >
        {OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.flag} {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
