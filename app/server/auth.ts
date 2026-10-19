import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import { db } from '@/server/db'
import type { User } from '@/types'

/*
 * Authentification de démonstration : le cookie contient l'identifiant de
 * l'utilisateur. À remplacer par un fournisseur réel (Better Auth, Clerk...)
 * avant toute mise en production — le cookie n'est pas signé.
 */

const SESSION_COOKIE = 'figui_session'

export const getCurrentUser = (): User | null => {
  const userId = getCookie(SESSION_COOKIE)
  if (!userId) return null
  return db.users.find((user) => user.id === userId) ?? null
}

export const requireUser = (): User => {
  const user = getCurrentUser()
  if (!user)
    throw new Error('Vous devez être connecté pour effectuer cette action.')
  return user
}

export const startSession = (user: User): void => {
  setCookie(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
}

export const endSession = (): void => {
  deleteCookie(SESSION_COOKIE, { path: '/' })
}
