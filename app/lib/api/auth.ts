import { createServerFn } from '@tanstack/react-start'
import { loginSchema } from '@/lib/schemas'
import { endSession, getCurrentUser, startSession } from '@/server/auth'
import { db, generateId } from '@/server/db'
import type { User } from '@/types'

export const getSessionUser = createServerFn({ method: 'GET' }).handler(
  (): User | null => getCurrentUser(),
)

/** Connexion de démo : retrouve le compte par email ou le crée. */
export const login = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(({ data }): User => {
    const email = data.email.toLowerCase()
    let user = db.users.find((u) => u.email === email)
    if (!user) {
      user = { id: generateId('u'), name: data.name, email }
      db.users.push(user)
    }
    startSession(user)
    return user
  })

export const logout = createServerFn({ method: 'POST' }).handler(() => {
  endSession()
})
