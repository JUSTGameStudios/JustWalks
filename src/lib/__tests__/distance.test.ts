import { describe, it, expect } from 'vitest'
import {
  timeToDistance,
  distanceToTime,
  convertDistance,
  convertPace,
  formatDistance,
  formatTime,
  formatPace,
  DEFAULT_PACE
} from '../distance'

describe('distance utilities', () => {
  describe('timeToDistance', () => {
    it('should convert time to distance correctly', () => {
      expect(timeToDistance(60, 12)).toBe(5) // 60 minutes at 12 min/km = 5 km
      expect(timeToDistance(30, 10)).toBe(3) // 30 minutes at 10 min/km = 3 km
    })
  })

  describe('distanceToTime', () => {
    it('should convert distance to time correctly', () => {
      expect(distanceToTime(5, 12)).toBe(60) // 5 km at 12 min/km = 60 minutes
      expect(distanceToTime(3, 10)).toBe(30) // 3 km at 10 min/km = 30 minutes
    })
  })

  describe('convertDistance', () => {
    it('should convert metric to imperial', () => {
      const result = convertDistance(5, 'metric', 'imperial')
      expect(result).toBeCloseTo(3.107, 2) // 5 km ≈ 3.11 miles
    })

    it('should convert imperial to metric', () => {
      const result = convertDistance(3, 'imperial', 'metric')
      expect(result).toBeCloseTo(4.828, 2) // 3 miles ≈ 4.83 km
    })

    it('should return same value for same units', () => {
      expect(convertDistance(5, 'metric', 'metric')).toBe(5)
      expect(convertDistance(3, 'imperial', 'imperial')).toBe(3)
    })
  })

  describe('convertPace', () => {
    it('should convert metric to imperial pace', () => {
      const result = convertPace(12, 'metric', 'imperial')
      expect(result).toBeCloseTo(19.31, 1) // 12 min/km ≈ 19.31 min/mile
    })

    it('should convert imperial to metric pace', () => {
      const result = convertPace(19.31, 'imperial', 'metric')
      expect(result).toBeCloseTo(12, 1) // 19.31 min/mile ≈ 12 min/km
    })

    it('should return same value for same units', () => {
      expect(convertPace(12, 'metric', 'metric')).toBe(12)
      expect(convertPace(19, 'imperial', 'imperial')).toBe(19)
    })
  })

  describe('formatDistance', () => {
    it('should format metric distances', () => {
      expect(formatDistance(5.123, 'metric')).toBe('5.12 km')
      expect(formatDistance(3, 'metric')).toBe('3 km')
    })

    it('should format imperial distances', () => {
      expect(formatDistance(3.107, 'imperial')).toBe('3.11 mi')
      expect(formatDistance(2, 'imperial')).toBe('2 mi')
    })
  })

  describe('formatTime', () => {
    it('should format minutes only', () => {
      expect(formatTime(45)).toBe('45m')
      expect(formatTime(30)).toBe('30m')
    })

    it('should format hours and minutes', () => {
      expect(formatTime(90)).toBe('1h 30m')
      expect(formatTime(125)).toBe('2h 5m')
      expect(formatTime(60)).toBe('1h 0m')
    })
  })

  describe('formatPace', () => {
    it('should format metric pace', () => {
      expect(formatPace(12, 'metric')).toBe('12:00/km')
      expect(formatPace(10.5, 'metric')).toBe('10:30/km')
    })

    it('should format imperial pace', () => {
      expect(formatPace(19.31, 'imperial')).toBe('19:19/mi')
      expect(formatPace(16, 'imperial')).toBe('16:00/mi')
    })
  })

  describe('DEFAULT_PACE', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_PACE.unit).toBe('metric')
      expect(DEFAULT_PACE.pace).toBe(12)
    })
  })
})