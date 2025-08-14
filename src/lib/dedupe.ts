export interface RouteSegment {
  id: string
  coordinates: [number, number][]
}

export function generateSegmentHash(coords: [number, number][]): string {
  const simplified = coords.map(coord => 
    [Math.round(coord[0] * 10000), Math.round(coord[1] * 10000)]
  )
  return btoa(JSON.stringify(simplified)).slice(0, 16)
}

export function calculateSegmentOverlap(
  route1Segments: string[],
  route2Segments: string[]
): number {
  if (route1Segments.length === 0 || route2Segments.length === 0) {
    return 0
  }
  
  const set1 = new Set(route1Segments)
  const set2 = new Set(route2Segments)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

export function scoreRouteVariety(
  candidateSegments: string[],
  recentRoutes: string[][]
): number {
  if (recentRoutes.length === 0) {
    return 1.0
  }
  
  let totalOverlap = 0
  let weightSum = 0
  
  recentRoutes.forEach((routeSegments, index) => {
    const weight = Math.pow(0.7, index)
    const overlap = calculateSegmentOverlap(candidateSegments, routeSegments)
    totalOverlap += overlap * weight
    weightSum += weight
  })
  
  const avgOverlap = totalOverlap / weightSum
  return Math.max(0, 1 - avgOverlap)
}

export function segmentizeRoute(coordinates: [number, number][]): string[] {
  if (coordinates.length < 2) return []
  
  const segments: string[] = []
  const segmentLength = 10
  
  for (let i = 0; i < coordinates.length - segmentLength; i += segmentLength) {
    const segmentCoords = coordinates.slice(i, i + segmentLength + 1)
    segments.push(generateSegmentHash(segmentCoords))
  }
  
  return segments
}