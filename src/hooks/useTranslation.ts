import { useFinancial } from '../contexts/FinancialContext'
import { translations, type TranslationKey } from '../i18n/translations'

export function useTranslation() {
  const { locale } = useFinancial()
  
  const t = (key: TranslationKey): string => {
    const translation = translations[locale][key]
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in locale: ${locale}`)
      // Fallback to English if translation missing
      return translations.en[key] || key
    }
    return translation
  }
  
  return { t, locale }
}
