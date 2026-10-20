import { createServerFn } from '@tanstack/react-start'
import { countryName, countryNumericCode } from '@/lib/countries'
import { getCurrentUser } from '@/server/auth'
import { db } from '@/server/db'
import { canView } from '@/server/trips'
import type { Destination } from '@/types'

/** Pays des voyages visibles par le visiteur (publics + ses voyages privés). */
export const listDestinations = createServerFn({ method: 'GET' }).handler(
  (): Array<Destination> => {
    const user = getCurrentUser()
    const byCode = new Map<string, Destination>()

    for (const trip of db.trips) {
      if (!canView(trip, user)) continue
      for (const code of trip.countries) {
        const existing = byCode.get(code)
        if (existing) existing.tripCount++
        else
          byCode.set(code, {
            code,
            numericCode: countryNumericCode(code),
            name: countryName(code),
            tripCount: 1,
          })
      }
    }

    return [...byCode.values()].sort(
      (a, b) => b.tripCount - a.tripCount || a.name.localeCompare(b.name, 'fr'),
    )
  },
)
