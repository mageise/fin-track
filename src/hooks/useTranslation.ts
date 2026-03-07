import { useFinancial } from '../contexts/FinancialContext'
import { translations, type TranslationKey } from '../i18n/translations'

export function useTranslation() {
  const { locale } = useFinancial()
  
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation: string = translations[locale][key]
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in locale: ${locale}`)
      // Fallback to English if translation missing
      translation = translations.en[key] || key
    }
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value))
      })
    }
    
    return translation
  }
  
  return { t, locale }
}
