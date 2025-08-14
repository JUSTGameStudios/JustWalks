import { useEffect, useState } from 'react'
import { getSettings, saveSetting } from '../lib/storage'
import { PACE_PRESETS, formatPace } from '../lib/distance'
import type { AppSettings } from '../lib/storage'

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    pace: { unit: 'metric', pace: 12 },
    mapProvider: 'leaflet',
    routingProvider: 'ors'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  
  useEffect(() => {
    loadSettings()
  }, [])
  
  const loadSettings = async () => {
    try {
      const settingsData = await getSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSaving(key)
    try {
      await saveSetting(key, value)
      setSettings(prev => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error(`Failed to save ${key}:`, error)
    } finally {
      setSaving(null)
    }
  }
  
  const handleClearData = async () => {
    if (!confirm('This will delete all your routes, favorites, and settings. Are you sure?')) {
      return
    }
    
    try {
      await indexedDB.deleteDatabase('JustWalksDB')
      localStorage.clear()
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear data:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your walking preferences and app behavior
        </p>
      </div>
      
      <div className="space-y-8">
        <section className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Walking Preferences</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Units
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="units"
                    value="metric"
                    checked={settings.pace.unit === 'metric'}
                    onChange={(e) => handleSaveSetting('pace', {
                      ...settings.pace,
                      unit: e.target.value as 'metric',
                      pace: 12
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Metric (km/h)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="units"
                    value="imperial"
                    checked={settings.pace.unit === 'imperial'}
                    onChange={(e) => handleSaveSetting('pace', {
                      ...settings.pace,
                      unit: e.target.value as 'imperial',
                      pace: 19.3
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Imperial (mph)</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Walking Pace
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PACE_PRESETS[settings.pace.unit].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSaveSetting('pace', {
                      ...settings.pace,
                      pace: preset.pace
                    })}
                    className={`p-3 rounded-lg text-left transition-colors border ${
                      Math.abs(settings.pace.pace - preset.pace) < 0.1
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{preset.label}</div>
                    <div className="text-xs text-gray-500">
                      {formatPace(preset.pace, settings.pace.unit)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <section className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Providers</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Provider
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mapProvider"
                    value="leaflet"
                    checked={settings.mapProvider === 'leaflet'}
                    onChange={(e) => handleSaveSetting('mapProvider', e.target.value as 'leaflet')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Leaflet + OpenStreetMap (Free)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mapProvider"
                    value="mapbox"
                    checked={settings.mapProvider === 'mapbox'}
                    onChange={(e) => handleSaveSetting('mapProvider', e.target.value as 'mapbox')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    disabled={!import.meta.env.VITE_MAPBOX_TOKEN}
                  />
                  <span className={`ml-2 text-sm ${
                    import.meta.env.VITE_MAPBOX_TOKEN ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    Mapbox {!import.meta.env.VITE_MAPBOX_TOKEN && '(Token required)'}
                  </span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Routing Provider
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="routingProvider"
                    value="ors"
                    checked={settings.routingProvider === 'ors'}
                    onChange={(e) => handleSaveSetting('routingProvider', e.target.value as 'ors')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">OpenRouteService (Recommended)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="routingProvider"
                    value="demo"
                    checked={settings.routingProvider === 'demo'}
                    onChange={(e) => handleSaveSetting('routingProvider', e.target.value as 'demo')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Demo Mode (Simulated routes)</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Demo mode generates fake routes for testing without requiring API keys
              </p>
            </div>
          </div>
        </section>
        
        <section className="card bg-red-50 border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">Privacy & Storage</h3>
              <p className="text-sm text-red-700 mb-4">
                All your data is stored locally on your device. Your routes, favorites, and settings 
                never leave your browser. You can clear all data at any time.
              </p>
              
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </section>
      </div>
      
      {saving && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </div>
        </div>
      )}
    </div>
  )
}