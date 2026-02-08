import { useFinancial } from '../contexts/FinancialContext'

export function useFormatters() {
  const { locale, currency } = useFinancial()
  
  // Map locale to Intl format
  const intlLocale = locale === 'en' ? 'en-US' : 'de-DE'
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  const formatNumber = (value: number, decimals = 2): string => {
    return new Intl.NumberFormat(intlLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }
  
  const formatPercent = (value: number, decimals = 2): string => {
    return new Intl.NumberFormat(intlLocale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100)
  }
  
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(intlLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d)
  }
  
  const formatShortDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(intlLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  }
  
  return {
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDate,
    formatShortDate,
  }
}
