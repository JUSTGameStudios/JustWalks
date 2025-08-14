import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRoutes, getFavoriteRoutes, deleteRoute, getSettings } from '../lib/storage'
import { formatDistance, formatTime } from '../lib/distance'
import type { Route, AppSettings } from '../lib/storage'

export default function History() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [favorites, setFavorites] = useState<Route[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [routesData, favoritesData, settingsData] = await Promise.all([
        getRoutes(),
        getFavoriteRoutes(),
        getSettings()
      ])
      
      setRoutes(routesData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
      setFavorites(favoritesData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
      setSettings(settingsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return
    
    try {
      await deleteRoute(routeId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete route:', error)
    }
  }
  
  const handleNavigateToRoute = (route: Route) => {
    const [lat, lng] = route.startPoint
    const waypointParams = route.coordinates
      .filter((_, i) => i % 5 === 0)
      .slice(1, -1)
      .map(([lat, lng]) => `${lat},${lng}`)
      .join('/')
    
    const url = `https://www.google.com/maps/dir/${lat},${lng}/${waypointParams}/${lat},${lng}`
    window.open(url, '_blank')
  }
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  const displayRoutes = activeTab === 'recent' ? routes : favorites
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Walking History</h1>
        <p className="text-gray-600">
          View your recent routes and saved favorites
        </p>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Routes ({routes.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites ({favorites.length})
            </button>
          </nav>
        </div>
      </div>
      
      {displayRoutes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeTab === 'recent' ? 'No routes yet' : 'No favorites yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'recent' 
              ? 'Start by planning your first walking route.'
              : 'Save your favorite routes to see them here.'
            }
          </p>
          <div className="mt-6">
            <Link
              to="/planner"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Plan a Route
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayRoutes.map((route) => (
            <div key={route.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {route.name || `${formatDistance(route.distance, settings?.pace.unit || 'metric')} Loop`}
                    </h3>
                    {route.isFavorite && (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      {formatDistance(route.distance, settings?.pace.unit || 'metric')}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(route.duration)}
                    </span>
                    <span className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1m6-1v1m-6 0H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3m-6 0a2 2 0 002-2V5a2 2 0 00-2-2m0 0a2 2 0 012 2v2a2 2 0 01-2 2z" />
                      </svg>
                      {new Date(route.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to="/planner"
                    state={{ selectedRoute: route }}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    View
                  </Link>
                  
                  <button
                    onClick={() => handleNavigateToRoute(route)}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Navigate
                  </button>
                  
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete route"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {displayRoutes.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/planner"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Plan New Route
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}