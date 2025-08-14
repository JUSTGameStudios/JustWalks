interface DurationPillsProps {
  selectedDuration: number
  onDurationChange: (duration: number) => void
  className?: string
}

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90]

export default function DurationPills({ 
  selectedDuration, 
  onDurationChange,
  className = ''
}: DurationPillsProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Target Duration
      </label>
      
      <div className="flex flex-wrap gap-2">
        {DURATION_OPTIONS.map((duration) => (
          <button
            key={duration}
            onClick={() => onDurationChange(duration)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDuration === duration
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {duration}m
          </button>
        ))}
      </div>
      
      <div className="mt-2">
        <label className="block text-xs text-gray-500 mb-1">
          Custom duration (minutes)
        </label>
        <input
          type="range"
          min="10"
          max="120"
          step="5"
          value={selectedDuration}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10m</span>
          <span className="font-medium text-primary-600">{selectedDuration}m</span>
          <span>2h</span>
        </div>
      </div>
    </div>
  )
}