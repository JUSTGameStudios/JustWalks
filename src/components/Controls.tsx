import { useState } from 'react'
import DurationPills from './DurationPills'
import PacePicker from './PacePicker'
import { timeToDistance, formatDistance, formatTime, type PaceSettings } from '../lib/distance'

interface ControlsProps {
  duration: number
  onDurationChange: (duration: number) => void
  pace: PaceSettings
  onPaceChange: (pace: PaceSettings) => void
  onGenerateRoute: () => void
  onNewRoute: () => void
  isGenerating: boolean
  hasRoute: boolean
  showStartLocationPicker?: boolean
  onSetStartLocation?: () => void
  hasStartLocation?: boolean
  className?: string
}

export default function Controls({
  duration,
  onDurationChange,
  pace,
  onPaceChange,
  onGenerateRoute,
  onNewRoute,
  isGenerating,
  hasRoute,
  showStartLocationPicker = true,
  onSetStartLocation,
  hasStartLocation = false,
  className = ''
}: ControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const estimatedDistance = timeToDistance(duration, pace.pace)
  
  return (
    <div className={`space-y-6 ${className}`}>
      {showStartLocationPicker && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Start Location</h3>
              <p className="text-xs text-gray-500 mt-1">
                {hasStartLocation ? 'Tap map to change location' : 'Tap map to set your starting point'}
              </p>
            </div>
            {onSetStartLocation && (
              <button
                onClick={onSetStartLocation}
                className="btn-secondary text-sm"
              >
                {hasStartLocation ? 'Change' : 'Set Home'}
              </button>
            )}
          </div>
          {hasStartLocation && (
            <div className="mt-2 flex items-center text-xs text-green-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Start location set
            </div>
          )}
        </div>
      )}
      
      <div className="card">
        <DurationPills
          selectedDuration={duration}
          onDurationChange={onDurationChange}
        />
      </div>
      
      <div className="card">
        <PacePicker
          pace={pace}
          onPaceChange={onPaceChange}
        />
      </div>
      
      <div className="card bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Estimated distance:</span>
          <span className="font-medium text-gray-900">
            {formatDistance(estimatedDistance, pace.unit)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Walking time:</span>
          <span className="font-medium text-gray-900">
            {formatTime(duration)}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {!hasRoute ? (
          <button
            onClick={onGenerateRoute}
            disabled={isGenerating || !hasStartLocation}
            className={`w-full btn-primary py-3 text-base font-medium ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              !hasStartLocation ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Route...
              </div>
            ) : (
              'Generate Walking Route'
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onNewRoute}
              disabled={isGenerating}
              className={`w-full btn-primary py-3 text-base font-medium ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Finding New Route...
                </div>
              ) : (
                'New Route, Same Length'
              )}
            </button>
            
            <button
              onClick={onGenerateRoute}
              disabled={isGenerating}
              className="w-full btn-secondary py-2 text-sm"
            >
              Different Duration
            </button>
          </div>
        )}
        
        {!hasStartLocation && (
          <p className="text-xs text-amber-600 text-center">
            Please set a start location on the map first
          </p>
        )}
      </div>
      
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        <svg className={`w-4 h-4 inline ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showAdvanced && (
        <div className="card bg-gray-50 border-gray-200 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Advanced Options</h4>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4" />
              <span className="ml-2 text-sm text-gray-700">Avoid busy roads</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4" />
              <span className="ml-2 text-sm text-gray-700">Prefer parks and trails</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4" />
              <span className="ml-2 text-sm text-gray-700">Include hills for exercise</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}