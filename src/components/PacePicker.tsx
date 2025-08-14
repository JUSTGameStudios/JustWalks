import { PACE_PRESETS, formatPace, type PaceSettings } from '../lib/distance'

interface PacePickerProps {
  pace: PaceSettings
  onPaceChange: (pace: PaceSettings) => void
  className?: string
}

export default function PacePicker({ 
  pace, 
  onPaceChange,
  className = ''
}: PacePickerProps) {
  const presets = PACE_PRESETS[pace.unit]
  
  const handleUnitChange = (unit: 'metric' | 'imperial') => {
    const newPace = unit === 'metric' ? 12 : 19.3
    onPaceChange({ unit, pace: newPace })
  }
  
  const handlePresetChange = (presetPace: number) => {
    onPaceChange({ ...pace, pace: presetPace })
  }
  
  const handleCustomPaceChange = (newPace: number) => {
    onPaceChange({ ...pace, pace: newPace })
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Walking Pace
        </label>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleUnitChange('metric')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              pace.unit === 'metric'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            km/h
          </button>
          <button
            onClick={() => handleUnitChange('imperial')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              pace.unit === 'imperial'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            mph
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetChange(preset.pace)}
            className={`p-3 rounded-lg text-left transition-colors border ${
              Math.abs(pace.pace - preset.pace) < 0.1
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">{preset.label}</div>
            <div className="text-xs text-gray-500">
              {formatPace(preset.pace, pace.unit)}
            </div>
          </button>
        ))}
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Custom pace ({formatPace(pace.pace, pace.unit)})
        </label>
        <input
          type="range"
          min={pace.unit === 'metric' ? 8 : 13}
          max={pace.unit === 'metric' ? 20 : 32}
          step="0.1"
          value={pace.pace}
          onChange={(e) => handleCustomPaceChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>
    </div>
  )
}