import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { PaceSettings, DEFAULT_PACE } from './distance'

export interface Route {
  id: string
  name?: string
  distance: number
  duration: number
  coordinates: [number, number][]
  startPoint: [number, number]
  createdAt: Date
  isFavorite: boolean
  segments: string[]
}

export interface WalkHistory {
  id: string
  routeId: string
  walkDate: Date
  actualDuration?: number
  notes?: string
}

export interface AppSettings {
  homeLocation?: [number, number]
  pace: PaceSettings
  mapProvider: 'leaflet' | 'mapbox'
  routingProvider: 'ors' | 'demo'
}

interface JustWalksDB extends DBSchema {
  routes: {
    key: string
    value: Route
  }
  history: {
    key: string
    value: WalkHistory
  }
  settings: {
    key: string
    value: any
  }
}

let db: IDBPDatabase<JustWalksDB> | null = null

async function getDB(): Promise<IDBPDatabase<JustWalksDB>> {
  if (!db) {
    db = await openDB<JustWalksDB>('JustWalksDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('routes')) {
          db.createObjectStore('routes', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      },
    })
  }
  return db
}

export async function saveRoute(route: Route): Promise<void> {
  const db = await getDB()
  await db.put('routes', route)
}

export async function getRoutes(): Promise<Route[]> {
  const db = await getDB()
  return db.getAll('routes')
}

export async function getFavoriteRoutes(): Promise<Route[]> {
  const routes = await getRoutes()
  return routes.filter(route => route.isFavorite)
}

export async function deleteRoute(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('routes', id)
}

export async function saveWalkHistory(walk: WalkHistory): Promise<void> {
  const db = await getDB()
  await db.put('history', walk)
}

export async function getWalkHistory(): Promise<WalkHistory[]> {
  const db = await getDB()
  const history = await db.getAll('history')
  return history.sort((a, b) => b.walkDate.getTime() - a.walkDate.getTime())
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  
  const settings: Partial<AppSettings> = {}
  
  try {
    settings.homeLocation = await db.get('settings', 'homeLocation')
    settings.pace = await db.get('settings', 'pace') || DEFAULT_PACE
    settings.mapProvider = await db.get('settings', 'mapProvider') || 'leaflet'
    settings.routingProvider = await db.get('settings', 'routingProvider') || 'ors'
  } catch (error) {
    console.warn('Error loading settings:', error)
  }
  
  return {
    pace: DEFAULT_PACE,
    mapProvider: 'leaflet',
    routingProvider: 'ors',
    ...settings
  }
}

export async function saveSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const db = await getDB()
  await db.put('settings', value, key)
}

export async function generateRouteId(): Promise<string> {
  return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function generateWalkId(): Promise<string> {
  return `walk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}