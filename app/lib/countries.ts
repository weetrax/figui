import isoCountries from 'i18n-iso-countries'
import fr from 'i18n-iso-countries/langs/fr.json'

/*
 * Référentiel pays : les voyages stockent des codes ISO 3166-1 alpha-2
 * (`"PH"`), les libellés français en sont dérivés. Le code numérique
 * (`"608"`) sert à faire le lien avec les géométries du globe (world-atlas).
 */

isoCountries.registerLocale(fr)

export interface Country {
  /** Code ISO 3166-1 alpha-2. */
  code: string
  name: string
}

const NAMES = isoCountries.getNames('fr', { select: 'official' })

export const COUNTRIES: Array<Country> = Object.entries(NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

export const isCountryCode = (code: string): boolean => code in NAMES

export const countryName = (code: string): string => NAMES[code] ?? code

/** Code ISO numérique sur 3 chiffres, identifiant des pays dans world-atlas. */
export const countryNumericCode = (code: string): string | undefined =>
  isoCountries.alpha2ToNumeric(code)

/** Drapeau emoji construit à partir des indicateurs régionaux Unicode. */
export const countryFlag = (code: string): string =>
  String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  )
