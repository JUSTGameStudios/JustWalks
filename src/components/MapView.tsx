import { useEffect, useRef, useState } from 'react'
import { getMapProvider, calculateBounds } from '../lib/map'
import type { Route } from '../lib/storage'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  center?: [number, number]
  zoom?: number
  route?: Route | null
  onMapClick?: (latlng: [number, number]) => void
  showStartMarker?: boolean
  startLocation?: [number, number]
  mapProvider?: string
  className?: string
}

export default function MapView({
  center = [51.505, -0.09],
  zoom = 13,
  route,
  onMapClick,
  showStartMarker = true,
  startLocation,
  mapProvider = 'leaflet',
  className = 'h-96'
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const startMarkerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    
    try {
      const provider = getMapProvider(mapProvider)
      const map = provider.createMap(mapRef.current, center, zoom)
      mapInstanceRef.current = map
      
      if (onMapClick) {
        map.on?.('click', (e: any) => {
          const latlng: [number, number] = [e.latlng.lat, e.latlng.lng]
          onMapClick(latlng)
        })
      }
      
      // Wait for map to be fully loaded
      if (map.whenReady) {
        map.whenReady(() => {
          setMapReady(true)
          setIsLoading(false)
        })
      } else {
        setTimeout(() => {
          setMapReady(true)
          setIsLoading(false)
        }, 500)
      }
    } catch (error) {
      console.error('Failed to initialize map:', error)
      setError('Failed to load map')
      setIsLoading(false)
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove?.()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, mapProvider, onMapClick])
  
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return
    
    const provider = getMapProvider(mapProvider)
    
    // Clear existing route
    if (routeLayerRef.current) {
      try {
        routeLayerRef.current.remove?.()
      } catch (e) {
        console.warn('Error removing route layer:', e)
      }
      routeLayerRef.current = null
    }
    
    // Add new route
    if (route?.coordinates && route.coordinates.length > 0) {
      // Wait for next tick to ensure map is ready
      requestAnimationFrame(() => {
        if (!mapInstanceRef.current) return
        
        try {
          console.log('Adding route to map:', route.coordinates.length, 'points')
          routeLayerRef.current = provider.addRoute(
            mapInstanceRef.current, 
            route.coordinates,
            '#10b981'
          )
          
          // Delay fitBounds to ensure map is ready
          const bounds = calculateBounds(route.coordinates)
          if (bounds && mapInstanceRef.current.fitBounds) {
            setTimeout(() => {
              if (mapInstanceRef.current && mapInstanceRef.current.fitBounds) {
                try {
                  mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
                } catch (e) {
                  console.warn('Error fitting bounds:', e)
                }
              }
            }, 200)
          }
        } catch (error) {
          console.error('Failed to add route to map:', error)
        }
      })
    }
  }, [route, mapProvider, mapReady])
  
  useEffect(() => {
    if (!mapInstanceRef.current) return
    
    const provider = getMapProvider(mapProvider)
    
    if (startMarkerRef.current) {
      startMarkerRef.current.remove?.()
      startMarkerRef.current = null
    }
    
    if (showStartMarker && startLocation) {
      try {
        startMarkerRef.current = provider.addMarker(
          mapInstanceRef.current,
          startLocation,
          {
            icon: createHomeIcon()
          }
        )
      } catch (error) {
        console.error('Failed to add start marker:', error)
      }
    }
  }, [showStartMarker, startLocation, mapProvider])
  
  if (error) {
    return (
      <div className={`${className} bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-600">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm font-medium">Map failed to load</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`relative ${className} bg-gray-100 rounded-lg overflow-hidden border border-gray-300`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

function createHomeIcon() {
  if (typeof window !== 'undefined' && window.L) {
    return window.L.divIcon({
      className: 'custom-home-marker',
      html: `
        <div class="relative">
          <div class="bg-primary-500 rounded-full w-8 h-8 border-2 border-white shadow-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }
  return undefined
}