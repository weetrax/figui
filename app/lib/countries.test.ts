import { describe, expect, it } from 'vitest'
import {
  COUNTRIES,
  countryFlag,
  countryName,
  countryNumericCode,
  isCountryCode,
} from './countries'

describe('countries', () => {
  it('expose la liste ISO triée par libellé français', () => {
    expect(COUNTRIES.length).toBeGreaterThan(240)
    expect(
      COUNTRIES[0].name.localeCompare(COUNTRIES[1].name, 'fr'),
    ).toBeLessThan(0)
    expect(COUNTRIES).toContainEqual({ code: 'PH', name: 'Philippines' })
  })

  it('valide les codes alpha-2', () => {
    expect(isCountryCode('VN')).toBe(true)
    expect(isCountryCode('XX')).toBe(false)
    expect(isCountryCode('Vietnam')).toBe(false)
  })

  it('dérive libellé, code numérique et drapeau', () => {
    expect(countryName('ID')).toBe('Indonésie')
    expect(countryNumericCode('PH')).toBe('608')
    expect(countryNumericCode('BO')).toBe('068')
    expect(countryFlag('fr')).toBe('🇫🇷')
  })
})
