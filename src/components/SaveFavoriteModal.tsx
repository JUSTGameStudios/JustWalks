import { useState } from 'react'
import type { Route } from '../lib/storage'

interface SaveFavoriteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (route: Route) => void
  route: Route | null
}

export default function SaveFavoriteModal({
  isOpen,
  onClose,
  onSave,
  route
}: SaveFavoriteModalProps) {
  const [name, setName] = useState(route?.name || '')
  
  const handleSave = () => {
    if (!route) return
    
    const updatedRoute = {
      ...route,
      name: name.trim() || `${Math.round(route.distance * 10) / 10}km Loop`,
      isFavorite: true
    }
    onSave(updatedRoute)
    onClose()
  }
  
  if (!isOpen || !route) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Save to Favorites</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${Math.round(route.distance * 10) / 10}km Loop`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Distance:</span>
              <span className="font-medium">{Math.round(route.distance * 100) / 100} km</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{Math.round(route.duration)} minutes</span>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-primary py-2"
            >
              Save Favorite
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}