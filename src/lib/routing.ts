import { timeToDistance, PaceSettings } from './distance'
import { scoreRouteVariety, segmentizeRoute } from './dedupe'
import { generateMockRoute, generateMockIsochrone } from './mockRouter'
import type { Route } from './storage'

export interface RouteRequest {
  start: [number, number]
  targetDuration: number
  pace: PaceSettings
  recentRoutes?: string[][]
}

export interface RouteCandidate {
  coordinates: [number, number][]
  distance: number
  duration: number
  varietyScore: number
  segments: string[]
}

export interface RoutingAPI {
  getRoute: (start: [number, number], waypoint: [number, number]) => Promise<any>
  getIsochrone: (start: [number, number], timeSeconds: number) => Promise<any>
}

export class MockRoutingAPI implements RoutingAPI {
  async getRoute(start: [number, number], waypoint: [number, number]) {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
    return generateMockRoute(start, waypoint)
  }
  
  async getIsochrone(start: [number, number], timeSeconds: number) {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
    return generateMockIsochrone(start, timeSeconds)
  }
}

export class NetlifyRoutingAPI implements RoutingAPI {
  async getRoute(start: [number, number], waypoint: [number, number]) {
    const response = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: [start[1], start[0]],
        waypoints: [[waypoint[1], waypoint[0]]],
        profile: 'foot-walking'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Route API error: ${response.status}`)
    }
    
    return response.json()
  }
  
  async getIsochrone(start: [number, number], timeSeconds: number) {
    const response = await fetch('/api/isochrone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: [start[1], start[0]],
        timeSeconds,
        profile: 'foot-walking'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Isochrone API error: ${response.status}`)
    }
    
    return response.json()
  }
}

export async function generateLoopRoute(
  request: RouteRequest,
  apiProvider: RoutingAPI = new NetlifyRoutingAPI()
): Promise<Route | null> {
  try {
    return await generateIsochroneGuidedRoute(request, apiProvider)
  } catch (error) {
    console.warn('Isochrone routing failed, trying radius heuristic:', error)
    try {
      return await generateRadiusHeuristicRoute(request, apiProvider)
    } catch (fallbackError) {
      console.warn('Radius routing failed, using mock:', fallbackError)
      return await generateRadiusHeuristicRoute(request, new MockRoutingAPI())
    }
  }
}

async function generateIsochroneGuidedRoute(
  request: RouteRequest,
  api: RoutingAPI
): Promise<Route | null> {
  const { start, targetDuration, pace, recentRoutes = [] } = request
  const outboundTimeSeconds = (targetDuration * 60) / 2
  
  const isochroneResponse = await api.getIsochrone(start, outboundTimeSeconds)
  const polygon = isochroneResponse.features[0]?.geometry.coordinates[0]
  
  if (!polygon || polygon.length < 4) {
    throw new Error('Invalid isochrone response')
  }
  
  const candidates = await generateCandidatesFromIsochrone(
    start,
    polygon,
    targetDuration,
    pace,
    recentRoutes,
    api
  )
  
  return selectBestCandidate(candidates, start, targetDuration)
}

async function generateRadiusHeuristicRoute(
  request: RouteRequest,
  api: RoutingAPI
): Promise<Route | null> {
  const { start, targetDuration, pace, recentRoutes = [] } = request
  const targetDistance = timeToDistance(targetDuration, pace.pace)
  const estimatedRadius = targetDistance / Math.PI
  
  const candidates = await generateCandidatesFromRadius(
    start,
    estimatedRadius,
    targetDuration,
    pace,
    recentRoutes,
    api
  )
  
  return selectBestCandidate(candidates, start, targetDuration)
}

async function generateCandidatesFromIsochrone(
  start: [number, number],
  polygon: [number, number][],
  _targetDuration: number,
  _pace: PaceSettings,
  recentRoutes: string[][],
  api: RoutingAPI
): Promise<RouteCandidate[]> {
  const candidates: RouteCandidate[] = []
  const sampleCount = Math.min(12, Math.max(6, polygon.length / 4))
  
  const sampledPoints = samplePolygonPoints(polygon, sampleCount)
  
  for (const waypoint of sampledPoints) {
    try {
      const routeResponse = await api.getRoute(start, waypoint)
      const routeFeature = routeResponse.features[0]
      
      if (!routeFeature) continue
      
      const coordinates: [number, number][] = routeFeature.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]]
      )
      
      const distance = routeFeature.properties.distance / 1000
      const duration = routeFeature.properties.duration / 60
      const segments = segmentizeRoute(coordinates)
      const varietyScore = scoreRouteVariety(segments, recentRoutes)
      
      candidates.push({
        coordinates,
        distance,
        duration,
        varietyScore,
        segments
      })
      
    } catch (error) {
      console.warn('Failed to generate route for waypoint:', waypoint, error)
    }
  }
  
  return candidates
}

async function generateCandidatesFromRadius(
  start: [number, number],
  radiusKm: number,
  _targetDuration: number,
  _pace: PaceSettings,
  recentRoutes: string[][],
  api: RoutingAPI
): Promise<RouteCandidate[]> {
  const candidates: RouteCandidate[] = []
  const waypointCount = 12
  
  for (let i = 0; i < waypointCount; i++) {
    const angle = (i / waypointCount) * 2 * Math.PI
    const radiusVariation = 0.7 + Math.random() * 0.6
    const actualRadius = radiusKm * radiusVariation
    
    const radiusInDegrees = actualRadius / 111
    const waypointLng = start[1] + Math.cos(angle) * radiusInDegrees
    const waypointLat = start[0] + Math.sin(angle) * radiusInDegrees
    
    const waypoint: [number, number] = [waypointLat, waypointLng]
    
    try {
      const routeResponse = await api.getRoute(start, waypoint)
      const routeFeature = routeResponse.features[0]
      
      if (!routeFeature) continue
      
      const coordinates: [number, number][] = routeFeature.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]]
      )
      
      const distance = routeFeature.properties.distance / 1000
      const duration = routeFeature.properties.duration / 60
      const segments = segmentizeRoute(coordinates)
      const varietyScore = scoreRouteVariety(segments, recentRoutes)
      
      candidates.push({
        coordinates,
        distance,
        duration,
        varietyScore,
        segments
      })
      
    } catch (error) {
      console.warn('Failed to generate route for waypoint:', waypoint, error)
    }
  }
  
  return candidates
}

function samplePolygonPoints(polygon: [number, number][], count: number): [number, number][] {
  const points: [number, number][] = []
  const step = Math.max(1, Math.floor(polygon.length / count))
  
  for (let i = 0; i < polygon.length; i += step) {
    if (points.length < count) {
      points.push([polygon[i][1], polygon[i][0]])
    }
  }
  
  for (let i = 0; i < count - points.length; i++) {
    const randomIndex = Math.floor(Math.random() * polygon.length)
    const jitteredPoint: [number, number] = [
      polygon[randomIndex][1] + (Math.random() - 0.5) * 0.001,
      polygon[randomIndex][0] + (Math.random() - 0.5) * 0.001
    ]
    points.push(jitteredPoint)
  }
  
  return points
}

function selectBestCandidate(
  candidates: RouteCandidate[],
  start: [number, number],
  targetDuration: number
): Route | null {
  if (candidates.length === 0) return null
  
  candidates.forEach(candidate => {
    const durationError = Math.abs(candidate.duration - targetDuration) / targetDuration
    const varietyBonus = candidate.varietyScore * 0.3
    candidate.varietyScore = Math.max(0, 1 - durationError + varietyBonus)
  })
  
  candidates.sort((a, b) => b.varietyScore - a.varietyScore)
  
  const best = candidates[0]
  
  return {
    id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    distance: best.distance,
    duration: best.duration,
    coordinates: best.coordinates,
    startPoint: start,
    createdAt: new Date(),
    isFavorite: false,
    segments: best.segments
  }
}

export function getRoutingProvider(provider: string): RoutingAPI {
  if (provider === 'demo' || (typeof window !== 'undefined' && (window as any).__USE_MOCK_ROUTER__)) {
    return new MockRoutingAPI()
  }
  return new NetlifyRoutingAPI()
}