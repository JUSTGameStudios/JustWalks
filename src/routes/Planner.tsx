import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import MapView from '../components/MapView'
import Controls from '../components/Controls'
import RouteStats from '../components/RouteStats'
import SaveFavoriteModal from '../components/SaveFavoriteModal'
import { generateLoopRoute, getRoutingProvider } from '../lib/routing'
import { getSettings, saveSetting, saveRoute, getRoutes } from '../lib/storage'
import { DEFAULT_PACE } from '../lib/distance'
import type { Route, AppSettings } from '../lib/storage'

export default function Planner() {
  const location = useLocation()
  const selectedRoute = location.state?.selectedRoute as Route | undefined
  
  const [settings, setSettings] = useState<AppSettings>({
    pace: DEFAULT_PACE,
    mapProvider: 'leaflet',
    routingProvider: 'ors'
  })
  const [duration, setDuration] = useState(30)
  const [currentRoute, setCurrentRoute] = useState<Route | null>(selectedRoute || null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [recentRoutes, setRecentRoutes] = useState<string[][]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])
  const [locationLoading, setLocationLoading] = useState(true)
  
  useEffect(() => {
    loadSettings()
    loadRecentRoutes()
    getUserLocation()
  }, [])
  
  const loadSettings = async () => {
    try {
      const settingsData = await getSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
  
  const loadRecentRoutes = async () => {
    try {
      const routes = await getRoutes()
      const recent = routes
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(route => route.segments)
      setRecentRoutes(recent)
    } catch (error) {
      console.error('Failed to load recent routes:', error)
    }
  }
  
  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ]
          setMapCenter(userLocation)
          // If no home location is saved, set it to user's current location
          if (!settings.homeLocation) {
            handleSetHomeLocation(userLocation)
          }
          setLocationLoading(false)
        },
        (error) => {
          console.warn('Geolocation error:', error)
          setLocationLoading(false)
          // Fall back to IP-based location or default
          // Could add IP geolocation here as fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      console.warn('Geolocation not supported')
      setLocationLoading(false)
    }
  }
  
  const handleSetHomeLocation = (latlng: [number, number]) => {
    saveSetting('homeLocation', latlng)
    setSettings(prev => ({ ...prev, homeLocation: latlng }))
  }
  
  const handleGenerateRoute = async () => {
    if (!settings.homeLocation) {
      setError('Please set a start location on the map first')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const apiProvider = getRoutingProvider(settings.routingProvider)
      
      const routeRequest = {
        start: settings.homeLocation,
        targetDuration: duration,
        pace: settings.pace,
        recentRoutes
      }
      
      const route = await generateLoopRoute(routeRequest, apiProvider)
      
      if (route) {
        setCurrentRoute(route)
        await saveRoute(route)
        await loadRecentRoutes()
      } else {
        setError('Could not generate a suitable route. Try adjusting your duration or location.')
      }
    } catch (error) {
      console.error('Route generation failed:', error)
      setError('Failed to generate route. Please try again or check your connection.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleNewRoute = async () => {
    setCurrentRoute(null)
    await handleGenerateRoute()
  }
  
  const handleSaveFavorite = async (route: Route) => {
    try {
      await saveRoute(route)
      setCurrentRoute(route)
      setShowSaveModal(false)
    } catch (error) {
      console.error('Failed to save favorite:', error)
    }
  }
  
  const handleStartWalk = () => {
    console.log('Starting walk with route:', currentRoute?.id)
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Walk</h1>
        <p className="text-gray-600">
          Set your preferences and generate a fresh walking route
        </p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6 relative">
            {locationLoading && (
              <div className="absolute top-4 left-4 z-10 bg-white shadow-md rounded-lg px-3 py-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                  Getting your location...
                </div>
              </div>
            )}
            <MapView
              center={settings.homeLocation || mapCenter}
              zoom={15}
              route={currentRoute}
              onMapClick={handleSetHomeLocation}
              showStartMarker={true}
              startLocation={settings.homeLocation}
              mapProvider={settings.mapProvider}
              className="h-96 md:h-[500px]"
            />
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}
          
          {currentRoute && (
            <RouteStats
              route={currentRoute}
              settings={settings}
              onSaveFavorite={() => setShowSaveModal(true)}
              onStartWalk={handleStartWalk}
              isFavorite={currentRoute.isFavorite}
            />
          )}
        </div>
        
        <div>
          <div className="sticky top-8">
            <Controls
              duration={duration}
              onDurationChange={setDuration}
              pace={settings.pace}
              onPaceChange={(pace) => {
                saveSetting('pace', pace)
                setSettings(prev => ({ ...prev, pace }))
              }}
              onGenerateRoute={handleGenerateRoute}
              onNewRoute={handleNewRoute}
              isGenerating={isGenerating}
              hasRoute={!!currentRoute}
              hasStartLocation={!!settings.homeLocation}
              onSetStartLocation={() => {
                setError('Tap anywhere on the map to set your starting location')
              }}
            />
          </div>
        </div>
      </div>
      
      {settings.routingProvider === 'demo' && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-amber-700 text-sm">
              Demo mode active - routes are simulated for testing
            </span>
          </div>
        </div>
      )}
      
      <SaveFavoriteModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFavorite}
        route={currentRoute}
      />
    </div>
  )
}