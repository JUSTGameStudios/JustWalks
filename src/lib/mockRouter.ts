import { calculateDistance } from './map'

export interface MockRouteResponse {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'LineString'
      coordinates: [number, number][]
    }
    properties: {
      distance: number
      duration: number
      segments: Array<{
        distance: number
        duration: number
        instruction: string
      }>
    }
  }>
}

export interface MockIsochroneResponse {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Polygon'
      coordinates: [number, number][][]
    }
    properties: {
      value: number
    }
  }>
}

export function generateMockRoute(
  start: [number, number],
  waypoint?: [number, number]
): MockRouteResponse {
  const startLng = start[1]
  const startLat = start[0]
  
  let waypointLng, waypointLat
  
  if (waypoint) {
    waypointLng = waypoint[1]
    waypointLat = waypoint[0]
  } else {
    const angle = Math.random() * 2 * Math.PI
    const radius = 0.005 + Math.random() * 0.01
    waypointLng = startLng + Math.cos(angle) * radius
    waypointLat = startLat + Math.sin(angle) * radius
  }
  
  const coordinates: [number, number][] = []
  
  const points1 = generatePathPoints([startLng, startLat], [waypointLng, waypointLat])
  const points2 = generatePathPoints([waypointLng, waypointLat], [startLng, startLat])
  
  coordinates.push(...points1)
  coordinates.push(...points2.slice(1))
  
  const totalDistance = calculateRouteDistance(coordinates)
  const estimatedDuration = totalDistance * 12 * 60
  
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates
      },
      properties: {
        distance: totalDistance * 1000,
        duration: estimatedDuration,
        segments: generateMockSegments(coordinates)
      }
    }]
  }
}

export function generateMockIsochrone(
  start: [number, number],
  timeSeconds: number
): MockIsochroneResponse {
  const [startLat, startLng] = start
  const radiusKm = (timeSeconds / 60) * 5 / 60
  const radiusDeg = radiusKm / 111
  
  const points: [number, number][] = []
  const numPoints = 16
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    const variation = 0.7 + Math.random() * 0.6
    const actualRadius = radiusDeg * variation
    
    const lng = startLng + Math.cos(angle) * actualRadius
    const lat = startLat + Math.sin(angle) * actualRadius
    points.push([lng, lat])
  }
  
  points.push(points[0])
  
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [points]
      },
      properties: {
        value: timeSeconds
      }
    }]
  }
}

function generatePathPoints(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const [startLng, startLat] = start
  const [endLng, endLat] = end
  
  const points: [number, number][] = []
  const numSegments = 8 + Math.floor(Math.random() * 8)
  
  points.push([startLng, startLat])
  
  for (let i = 1; i < numSegments; i++) {
    const t = i / numSegments
    
    let lng = startLng + (endLng - startLng) * t
    let lat = startLat + (endLat - startLat) * t
    
    const noiseScale = 0.002
    lng += (Math.random() - 0.5) * noiseScale
    lat += (Math.random() - 0.5) * noiseScale
    
    if (Math.random() < 0.3) {
      const turnAngle = (Math.random() - 0.5) * Math.PI / 3
      const turnDistance = 0.001 + Math.random() * 0.002
      lng += Math.cos(turnAngle) * turnDistance
      lat += Math.sin(turnAngle) * turnDistance
    }
    
    points.push([lng, lat])
  }
  
  points.push([endLng, endLat])
  return points
}

function calculateRouteDistance(coordinates: [number, number][]): number {
  let totalDistance = 0
  
  for (let i = 1; i < coordinates.length; i++) {
    const [prevLng, prevLat] = coordinates[i - 1]
    const [currLng, currLat] = coordinates[i]
    totalDistance += calculateDistance([prevLat, prevLng], [currLat, currLng])
  }
  
  return totalDistance
}

function generateMockSegments(coordinates: [number, number][]) {
  const segments = []
  const instructions = [
    'Head north',
    'Turn right',
    'Continue straight',
    'Turn left',
    'Take the path',
    'Follow the trail',
    'Turn around',
    'Head back'
  ]
  
  const segmentSize = Math.max(2, Math.floor(coordinates.length / 6))
  
  for (let i = 0; i < coordinates.length - 1; i += segmentSize) {
    const segmentCoords = coordinates.slice(i, i + segmentSize + 1)
    const distance = calculateRouteDistance(segmentCoords) * 1000
    const duration = distance * 12 / 1000 * 60
    
    segments.push({
      distance,
      duration,
      instruction: instructions[Math.floor(Math.random() * instructions.length)]
    })
  }
  
  return segments
}