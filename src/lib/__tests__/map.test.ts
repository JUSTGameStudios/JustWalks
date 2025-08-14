import { describe, it, expect } from 'vitest'
import {
  calculateBounds,
  calculateCenter,
  calculateDistance
} from '../map'

describe('map utilities', () => {
  describe('calculateBounds', () => {
    it('should return null for empty coordinates', () => {
      expect(calculateBounds([])).toBe(null)
    })

    it('should calculate bounds for single coordinate', () => {
      const coords: [number, number][] = [[51.5074, -0.1278]]
      const bounds = calculateBounds(coords)
      expect(bounds).toEqual([[51.5074, -0.1278], [51.5074, -0.1278]])
    })

    it('should calculate bounds for multiple coordinates', () => {
      const coords: [number, number][] = [
        [51.5074, -0.1278], // London
        [51.5085, -0.1257], // Slightly north and east
        [51.5063, -0.1299]  // Slightly south and west
      ]
      const bounds = calculateBounds(coords)
      
      expect(bounds).toBeDefined()
      expect(bounds![0][0]).toBe(51.5063) // min lat
      expect(bounds![0][1]).toBe(-0.1299) // min lng
      expect(bounds![1][0]).toBe(51.5085) // max lat
      expect(bounds![1][1]).toBe(-0.1257) // max lng
    })
  })

  describe('calculateCenter', () => {
    it('should return null for empty coordinates', () => {
      expect(calculateCenter([])).toBe(null)
    })

    it('should return same coordinate for single point', () => {
      const coords: [number, number][] = [[51.5074, -0.1278]]
      const center = calculateCenter(coords)
      expect(center).toEqual([51.5074, -0.1278])
    })

    it('should calculate center for multiple coordinates', () => {
      const coords: [number, number][] = [
        [51.5063, -0.1299], // SW
        [51.5085, -0.1257]  // NE
      ]
      const center = calculateCenter(coords)
      
      expect(center).toBeDefined()
      expect(center![0]).toBeCloseTo(51.5074, 4) // (51.5063 + 51.5085) / 2
      expect(center![1]).toBeCloseTo(-0.1278, 4) // (-0.1299 + -0.1257) / 2
    })
  })

  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      const coord = [51.5074, -0.1278] as [number, number]
      expect(calculateDistance(coord, coord)).toBe(0)
    })

    it('should calculate distance between London landmarks', () => {
      const towerBridge: [number, number] = [51.5055, -0.0754]
      const londonBridge: [number, number] = [51.5079, -0.0877]
      
      const distance = calculateDistance(towerBridge, londonBridge)
      
      // Distance between Tower Bridge and London Bridge is approximately 1 km
      expect(distance).toBeGreaterThan(0.8)
      expect(distance).toBeLessThan(1.2)
    })

    it('should calculate longer distances correctly', () => {
      const london: [number, number] = [51.5074, -0.1278]
      const paris: [number, number] = [48.8566, 2.3522]
      
      const distance = calculateDistance(london, paris)
      
      // Distance between London and Paris is approximately 344 km
      expect(distance).toBeGreaterThan(300)
      expect(distance).toBeLessThan(400)
    })

    it('should handle negative coordinates', () => {
      const coord1: [number, number] = [-34.6037, -58.3816] // Buenos Aires
      const coord2: [number, number] = [-33.4489, -70.6693] // Santiago
      
      const distance = calculateDistance(coord1, coord2)
      
      // Distance should be positive
      expect(distance).toBeGreaterThan(0)
      // Distance between Buenos Aires and Santiago is approximately 1150 km
      expect(distance).toBeGreaterThan(1000)
      expect(distance).toBeLessThan(1300)
    })
  })
})