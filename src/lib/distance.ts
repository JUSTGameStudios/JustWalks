export interface PaceSettings {
  unit: 'metric' | 'imperial'
  pace: number // minutes per km or minutes per mile
}

export const DEFAULT_PACE: PaceSettings = {
  unit: 'metric',
  pace: 12 // 12 min/km = ~5 km/h walking pace
}

export const PACE_PRESETS = {
  metric: [
    { label: 'Leisurely', pace: 15 }, // 4 km/h
    { label: 'Moderate', pace: 12 },  // 5 km/h
    { label: 'Brisk', pace: 10 },     // 6 km/h
    { label: 'Fast', pace: 8.5 }      // ~7 km/h
  ],
  imperial: [
    { label: 'Leisurely', pace: 24 }, // 2.5 mph
    { label: 'Moderate', pace: 19.3 }, // 3.1 mph
    { label: 'Brisk', pace: 16 },     // 3.75 mph
    { label: 'Fast', pace: 13.7 }     // 4.4 mph
  ]
}

export function timeToDistance(timeMinutes: number, pace: number): number {
  return timeMinutes / pace
}

export function distanceToTime(distance: number, pace: number): number {
  return distance * pace
}

export function convertDistance(distance: number, fromUnit: 'metric' | 'imperial', toUnit: 'metric' | 'imperial'): number {
  if (fromUnit === toUnit) return distance
  
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return distance * 0.621371 // km to miles
  } else {
    return distance * 1.609344 // miles to km
  }
}

export function convertPace(pace: number, fromUnit: 'metric' | 'imperial', toUnit: 'metric' | 'imperial'): number {
  if (fromUnit === toUnit) return pace
  
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return pace * 1.609344 // min/km to min/mile
  } else {
    return pace / 1.609344 // min/mile to min/km
  }
}

export function formatDistance(distance: number, unit: 'metric' | 'imperial'): string {
  const rounded = Math.round(distance * 100) / 100
  return unit === 'metric' ? `${rounded} km` : `${rounded} mi`
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  
  if (hours === 0) {
    return `${mins}m`
  } else {
    return `${hours}h ${mins}m`
  }
}

export function formatPace(pace: number, unit: 'metric' | 'imperial'): string {
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  const unitLabel = unit === 'metric' ? 'km' : 'mi'
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}/${unitLabel}`
}