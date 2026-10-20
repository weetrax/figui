import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'figui-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/*
 * Script bloquant injecté dans <head> : applique le thème avant le premier
 * affichage pour éviter un flash de thème clair.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var d=t==='dark'||(t!=='light'&&matchMedia('${DARK_QUERY}').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light'}catch(e){}})()`

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const readStoredTheme = (): Theme => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

const systemTheme = (): ResolvedTheme =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'

const applyTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Valeurs neutres au rendu serveur, synchronisées au montage.
  const [theme, setThemeState] = useState<Theme>('system')
  const [system, setSystem] = useState<ResolvedTheme>('light')

  useEffect(() => {
    setThemeState(readStoredTheme())
    setSystem(systemTheme())

    const media = window.matchMedia(DARK_QUERY)
    const onMediaChange = () => setSystem(systemTheme())
    // Synchronise les autres onglets.
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setThemeState(readStoredTheme())
    }
    media.addEventListener('change', onMediaChange)
    window.addEventListener('storage', onStorage)
    return () => {
      media.removeEventListener('change', onMediaChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const resolvedTheme = theme === 'system' ? system : theme

  useEffect(() => applyTheme(resolvedTheme), [resolvedTheme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Stockage indisponible (navigation privée) : thème non persisté.
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context)
    throw new Error('useTheme doit être utilisé dans <ThemeProvider>')
  return context
}
