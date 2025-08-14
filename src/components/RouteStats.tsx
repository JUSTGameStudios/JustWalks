import { formatDistance, formatTime } from '../lib/distance'
import type { Route, AppSettings } from '../lib/storage'

interface RouteStatsProps {
  route: Route
  settings: AppSettings
  onSaveFavorite?: () => void
  onStartWalk?: () => void
  isFavorite?: boolean
  className?: string
}

export default function RouteStats({
  route,
  settings,
  onSaveFavorite,
  onStartWalk,
  isFavorite = false,
  className = ''
}: RouteStatsProps) {
  const handleNavigate = () => {
    const [lat, lng] = route.startPoint
    const waypointParams = route.coordinates
      .filter((_, i) => i % 5 === 0)
      .slice(1, -1)
      .map(([lat, lng]) => `${lat},${lng}`)
      .join('/')
    
    const url = `https://www.google.com/maps/dir/${lat},${lng}/${waypointParams}/${lat},${lng}`
    window.open(url, '_blank')
  }
  
  return (
    <div className={`card space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Route Details</h3>
        {onSaveFavorite && (
          <button
            onClick={onSaveFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            {formatDistance(route.distance, settings.pace.unit)}
          </div>
          <div className="text-sm text-gray-600">Distance</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            {formatTime(route.duration)}
          </div>
          <div className="text-sm text-gray-600">Duration</div>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Starts and ends at your location</span>
      </div>
      
      <div className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span>Loop route - no backtracking</span>
      </div>
      
      <div className="flex space-x-3">
        {onStartWalk && (
          <button
            onClick={onStartWalk}
            className="flex-1 btn-primary py-2 text-sm"
          >
            Start Walk
          </button>
        )}
        
        <button
          onClick={handleNavigate}
          className="flex-1 btn-secondary py-2 text-sm"
        >
          Navigate
        </button>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Generated {new Date(route.createdAt).toLocaleTimeString()}
      </div>
    </div>
  )
}