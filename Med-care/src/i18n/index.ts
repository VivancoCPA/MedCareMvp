import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import esJson from './locales/es.json'
import enJson from './locales/en.json'

i18n.use(initReactI18next).init({
  lng: 'es',
  fallbackLng: 'en',
  resources: {
    es: { translation: esJson },
    en: { translation: enJson },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
