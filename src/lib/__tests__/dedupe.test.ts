import { describe, it, expect } from 'vitest'
import {
  generateSegmentHash,
  calculateSegmentOverlap,
  scoreRouteVariety,
  segmentizeRoute
} from '../dedupe'

describe('dedupe utilities', () => {
  describe('generateSegmentHash', () => {
    it('should generate consistent hashes for same coordinates', () => {
      const coords: [number, number][] = [[51.5074, -0.1278], [51.5075, -0.1279]]
      const hash1 = generateSegmentHash(coords)
      const hash2 = generateSegmentHash(coords)
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different coordinates', () => {
      const coords1: [number, number][] = [[51.5074, -0.1278], [51.5075, -0.1279]]
      const coords2: [number, number][] = [[51.5100, -0.1300], [51.5101, -0.1301]]
      const hash1 = generateSegmentHash(coords1)
      const hash2 = generateSegmentHash(coords2)
      expect(hash1).not.toBe(hash2)
    })

    it('should handle rounding correctly', () => {
      const coords1: [number, number][] = [[51.50740001, -0.12780001]]
      const coords2: [number, number][] = [[51.50740002, -0.12780002]]
      const hash1 = generateSegmentHash(coords1)
      const hash2 = generateSegmentHash(coords2)
      expect(hash1).toBe(hash2) // Should be same after rounding to 4 decimal places
    })
  })

  describe('calculateSegmentOverlap', () => {
    it('should return 0 for no overlap', () => {
      const segments1 = ['hash1', 'hash2', 'hash3']
      const segments2 = ['hash4', 'hash5', 'hash6']
      expect(calculateSegmentOverlap(segments1, segments2)).toBe(0)
    })

    it('should return 1 for complete overlap', () => {
      const segments = ['hash1', 'hash2', 'hash3']
      expect(calculateSegmentOverlap(segments, segments)).toBe(1)
    })

    it('should calculate partial overlap correctly', () => {
      const segments1 = ['hash1', 'hash2', 'hash3']
      const segments2 = ['hash2', 'hash3', 'hash4']
      // Intersection: {hash2, hash3} = 2 elements
      // Union: {hash1, hash2, hash3, hash4} = 4 elements
      // Overlap = 2/4 = 0.5
      expect(calculateSegmentOverlap(segments1, segments2)).toBe(0.5)
    })

    it('should return 0 for empty arrays', () => {
      expect(calculateSegmentOverlap([], ['hash1'])).toBe(0)
      expect(calculateSegmentOverlap(['hash1'], [])).toBe(0)
      expect(calculateSegmentOverlap([], [])).toBe(0)
    })
  })

  describe('scoreRouteVariety', () => {
    it('should return 1 for no recent routes', () => {
      const candidateSegments = ['hash1', 'hash2', 'hash3']
      expect(scoreRouteVariety(candidateSegments, [])).toBe(1.0)
    })

    it('should return lower score for high overlap', () => {
      const candidateSegments = ['hash1', 'hash2', 'hash3']
      const recentRoutes = [
        ['hash1', 'hash2', 'hash3'], // 100% overlap
      ]
      const score = scoreRouteVariety(candidateSegments, recentRoutes)
      expect(score).toBeLessThan(0.5)
    })

    it('should weight recent routes more heavily', () => {
      const candidateSegments = ['hash1', 'hash2', 'hash3']
      const recentRoutes = [
        ['hash1', 'hash2', 'hash3'], // Most recent (weight = 1)
        ['hash4', 'hash5', 'hash6'], // Less recent (weight = 0.7)
      ]
      const score1 = scoreRouteVariety(candidateSegments, recentRoutes)
      
      // Reverse order - older route first
      const recentRoutes2 = [
        ['hash4', 'hash5', 'hash6'], // Most recent
        ['hash1', 'hash2', 'hash3'], // Less recent
      ]
      const score2 = scoreRouteVariety(candidateSegments, recentRoutes2)
      
      expect(score1).toBeLessThan(score2) // First case should have lower score
    })

    it('should return high score for completely different route', () => {
      const candidateSegments = ['hash1', 'hash2', 'hash3']
      const recentRoutes = [
        ['hash4', 'hash5', 'hash6'],
        ['hash7', 'hash8', 'hash9'],
      ]
      const score = scoreRouteVariety(candidateSegments, recentRoutes)
      expect(score).toBeGreaterThan(0.9)
    })
  })

  describe('segmentizeRoute', () => {
    it('should return empty array for insufficient coordinates', () => {
      expect(segmentizeRoute([])).toEqual([])
      expect(segmentizeRoute([[51.5074, -0.1278]])).toEqual([])
    })

    it('should create segments from route coordinates', () => {
      const coordinates: [number, number][] = []
      for (let i = 0; i < 25; i++) {
        coordinates.push([51.5074 + i * 0.001, -0.1278 + i * 0.001])
      }
      
      const segments = segmentizeRoute(coordinates)
      expect(segments.length).toBeGreaterThan(0)
      expect(segments.every(s => typeof s === 'string')).toBe(true)
    })

    it('should create overlapping segments', () => {
      const coordinates: [number, number][] = []
      for (let i = 0; i < 50; i++) {
        coordinates.push([51.5074 + i * 0.001, -0.1278 + i * 0.001])
      }
      
      const segments = segmentizeRoute(coordinates)
      // With segment length 10 and step 10, we expect multiple segments
      expect(segments.length).toBeGreaterThan(1)
    })
  })
})