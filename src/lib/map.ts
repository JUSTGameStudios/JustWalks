import L from 'leaflet'

export interface MapProvider {
  name: string
  createMap: (container: HTMLElement, center: [number, number], zoom: number) => any
  addRoute: (map: any, coordinates: [number, number][], color?: string) => any
  addMarker: (map: any, position: [number, number], options?: any) => any
  setView: (map: any, center: [number, number], zoom: number) => void
}

export const LeafletProvider: MapProvider = {
  name: 'leaflet',
  
  createMap(container: HTMLElement, center: [number, number], zoom: number) {
    const map = L.map(container).setView(center, zoom)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
    
    return map
  },
  
  addRoute(map: L.Map, coordinates: [number, number][], color: string = '#10b981') {
    return L.polyline(coordinates, {
      color,
      weight: 4,
      opacity: 0.8
    }).addTo(map)
  },
  
  addMarker(map: L.Map, position: [number, number], options: any = {}) {
    const icon = options.icon || L.divIcon({
      className: 'custom-marker',
      html: `<div class="bg-primary-500 rounded-full w-4 h-4 border-2 border-white shadow-lg"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })
    
    return L.marker(position, { icon, ...options }).addTo(map)
  },
  
  setView(map: L.Map, center: [number, number], zoom: number) {
    map.setView(center, zoom)
  }
}

export function getMapProvider(providerName: string): MapProvider {
  switch (providerName) {
    case 'mapbox':
      if (import.meta.env.VITE_MAPBOX_TOKEN) {
        return createMapboxProvider()
      }
      return LeafletProvider
    case 'leaflet':
    default:
      return LeafletProvider
  }
}

function createMapboxProvider(): MapProvider {
  return {
    name: 'mapbox',
    
    createMap(container: HTMLElement, center: [number, number], zoom: number) {
      return LeafletProvider.createMap(container, center, zoom)
    },
    
    addRoute: LeafletProvider.addRoute,
    addMarker: LeafletProvider.addMarker,
    setView: LeafletProvider.setView
  }
}

export function calculateBounds(coordinates: [number, number][]): [[number, number], [number, number]] | null {
  if (coordinates.length === 0) return null
  
  let minLat = coordinates[0][0]
  let maxLat = coordinates[0][0]
  let minLng = coordinates[0][1]
  let maxLng = coordinates[0][1]
  
  coordinates.forEach(([lat, lng]) => {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  })
  
  return [[minLat, minLng], [maxLat, maxLng]]
}

export function calculateCenter(coordinates: [number, number][]): [number, number] | null {
  if (coordinates.length === 0) return null
  
  const bounds = calculateBounds(coordinates)
  if (!bounds) return null
  
  const [[minLat, minLng], [maxLat, maxLng]] = bounds
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
}

export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1
  const [lat2, lon2] = coord2
  
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c
}