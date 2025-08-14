import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSettings, getFavoriteRoutes } from '../lib/storage'
import { formatDistance, formatTime } from '../lib/distance'
import type { Route, AppSettings } from '../lib/storage'

export default function Home() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [settingsData, favoritesData] = await Promise.all([
        getSettings(),
        getFavoriteRoutes()
      ])
      setSettings(settingsData)
      setFavoriteRoutes(favoritesData.slice(0, 3))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to JustWalks
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Generate fresh, looped walking routes by your desired time. 
          Perfect for exploring your neighborhood with variety.
        </p>
        
        <Link
          to="/planner"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 transition-colors"
        >
          Plan Your Walk
          <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your Duration</h3>
          <p className="text-gray-600">Choose from 15 minutes to 2 hours, or set a custom time that fits your schedule.</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Fresh Routes</h3>
          <p className="text-gray-600">Our smart algorithm generates loop routes that avoid repetition and explore new areas.</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Favorites</h3>
          <p className="text-gray-600">Keep track of your favorite routes and build a collection of go-to walks.</p>
        </div>
      </div>
      
      {favoriteRoutes.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Favorite Routes</h2>
            <Link
              to="/history"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {favoriteRoutes.map((route) => (
              <div key={route.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {route.name || `${formatDistance(route.distance, settings?.pace.unit || 'metric')} Loop`}
                  </h3>
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>{formatDistance(route.distance, settings?.pace.unit || 'metric')}</span>
                  <span>{formatTime(route.duration)}</span>
                </div>
                
                <Link
                  to="/planner"
                  state={{ selectedRoute: route }}
                  className="btn-primary w-full text-center text-sm"
                >
                  Walk This Route
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-primary-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Privacy-First Design
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Your location data never leaves your device. All routes are generated using your browser's storage, 
          and we proxy map requests to protect your privacy.
        </p>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Local Storage Only
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            No Tracking
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Open Source
          </div>
        </div>
      </div>
    </div>
  )
}