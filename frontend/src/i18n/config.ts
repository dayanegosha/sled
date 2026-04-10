import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locales/en/translation.json';
import ru from '../../public/locales/ru/translation.json';
import zh from '../../public/locales/zh/translation.json';

if (!i18n.isInitialized) {
  void i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en', 'zh'],
    load: 'languageOnly',
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      zh: { translation: zh },
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
    interpolation: { escapeValue: false },
  } as any);
}

export default i18n;
