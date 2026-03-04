/**
 * i18n configuration — i18next with 10 Indian languages + English.
 * Language change is triggered from languageSlice via changeAppLanguage().
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en';
import hi from './translations/hi';
import bn from './translations/bn';
import te from './translations/te';
import mr from './translations/mr';
import ta from './translations/ta';
import gu from './translations/gu';
import kn from './translations/kn';
import pa from './translations/pa';
import ml from './translations/ml';

export const LANGUAGES = [
  { code: 'en', name: 'English',   nativeName: 'English',    flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',     nativeName: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',   nativeName: 'বাংলা',      flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',    nativeName: 'తెలుగు',     flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',   nativeName: 'मराठी',      flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',     nativeName: 'தமிழ்',      flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati',  nativeName: 'ગુજરાતી',    flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',   nativeName: 'ಕನ್ನಡ',      flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi',   nativeName: 'ਪੰਜਾਬੀ',     flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം',     flag: '🇮🇳' },
];

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      te: { translation: te },
      mr: { translation: mr },
      ta: { translation: ta },
      gu: { translation: gu },
      kn: { translation: kn },
      pa: { translation: pa },
      ml: { translation: ml },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

/** Call this when user picks a language to sync i18next + Redux */
export function changeAppLanguage(code: string): void {
  void i18n.changeLanguage(code);
}

export default i18n;
