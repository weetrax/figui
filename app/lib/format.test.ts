import { describe, expect, it } from 'vitest'
import {
  computeTripStatus,
  countDays,
  formatDayMonth,
  formatTime,
  slugify,
  sortSteps,
  sumStepsBudget,
} from './format'

describe('format', () => {
  it('compte les jours de façon inclusive', () => {
    expect(countDays('2026-11-14', '2027-03-31')).toBe(138)
    expect(countDays('2026-11-14', '2026-11-14')).toBe(1)
  })

  it('calcule le statut du voyage', () => {
    const trip = { startDate: '2026-11-14', endDate: '2026-11-20' }
    expect(computeTripStatus(trip, '2026-10-01')).toBe('A venir')
    expect(computeTripStatus(trip, '2026-11-14')).toBe('En cours')
    expect(computeTripStatus(trip, '2026-11-21')).toBe('Terminé')
  })

  it('génère des slugs sans accents', () => {
    expect(slugify('Été à Hô Chi Minh !')).toBe('ete-a-ho-chi-minh')
  })

  it('formate heure et jour sans décalage de fuseau', () => {
    expect(formatTime('2026-11-14T17:00')).toBe('17:00')
    expect(formatDayMonth('2026-11-14T23:30')).toEqual({
      day: '14',
      month: 'nov',
    })
  })

  it('additionne et trie les étapes', () => {
    expect(
      sumStepsBudget([{ estimatedBudget: 12 }, {}, { estimatedBudget: 10 }]),
    ).toBe(22)
    const sorted = sortSteps([
      { datetime: '2026-11-15T09:15' },
      { datetime: '2026-11-14T17:00' },
    ])
    expect(sorted[0].datetime).toBe('2026-11-14T17:00')
  })
})
