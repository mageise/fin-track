import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Settings as SettingsIcon, CheckCircle, User, Globe, DollarSign } from 'lucide-react'
import { useFinancial, type Locale, type Currency } from '../contexts/FinancialContext'
import { useTranslation } from '../hooks/useTranslation'
import { Card } from '../components/Card'

export function Settings() {
  const { 
    locale, 
    currency, 
    firstName, 
    setLocale, 
    setCurrency, 
    setFirstName 
  } = useFinancial()
  const { t } = useTranslation()
  
  const [localLocale, setLocalLocale] = useState<Locale>(locale)
  const [localCurrency, setLocalCurrency] = useState<Currency>(currency)
  const [localFirstName, setLocalFirstName] = useState(firstName)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    setLocale(localLocale)
    setCurrency(localCurrency)
    setFirstName(localFirstName)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const hasChanges = 
    localLocale !== locale || 
    localCurrency !== currency || 
    localFirstName !== firstName

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-10 h-10 text-rose-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('settingsTitle')}</h1>
              <p className="text-gray-600">{t('settingsSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-6">
            <CheckCircle className="w-5 h-5" />
            <span>{t('settingsSaved')}</span>
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Personal Settings */}
          <Card title={t('personalSettings')}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('firstNameLabel')}
                  </div>
                </label>
                <input
                  type="text"
                  value={localFirstName}
                  onChange={(e) => setLocalFirstName(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-xs text-gray-500 mt-1">{t('firstNameHint')}</p>
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card title={t('languageSettings')}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('languageLabel')}
                  </div>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="locale"
                      value="de"
                      checked={localLocale === 'de'}
                      onChange={(e) => setLocalLocale(e.target.value as Locale)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{t('german')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="locale"
                      value="en"
                      checked={localLocale === 'en'}
                      onChange={(e) => setLocalLocale(e.target.value as Locale)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{t('english')}</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Currency Settings */}
          <Card title={t('currencySettings')}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('currencyLabel')}
                  </div>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="currency"
                      value="EUR"
                      checked={localCurrency === 'EUR'}
                      onChange={(e) => setLocalCurrency(e.target.value as Currency)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{t('euro')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="currency"
                      value="USD"
                      checked={localCurrency === 'USD'}
                      onChange={(e) => setLocalCurrency(e.target.value as Currency)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{t('usd')}</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-6 py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
