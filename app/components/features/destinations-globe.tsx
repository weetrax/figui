import {
  geoCentroid,
  geoContains,
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
} from 'd3-geo'
import { feature } from 'topojson-client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { useTheme } from '@/components/features/theme-provider'
import type { ResolvedTheme } from '@/components/features/theme-provider'
import { cn } from '@/lib/utils'
import type { Destination } from '@/types'

interface DestinationsGlobeProps {
  destinations: Array<Destination>
  onSelect?: (destination: Destination) => void
  /**
   * Inclinaison initiale en degrés (négatif : on voit davantage l'hémisphère
   * nord). Une valeur positive remonte l'équateur vers le haut du disque.
   */
  tilt?: number
  className?: string
}

type CountryFeature = Feature<Polygon | MultiPolygon, { name: string }>

interface Hover {
  destination: Destination
  x: number
  y: number
}

/** Degrés par seconde. */
const ROTATION_SPEED = 6
const DEFAULT_TILT = -18

interface GlobePalette {
  glow: string
  glowFade: string
  oceanLight: string
  oceanDark: string
  graticule: string
  land: string
  landStroke: string
  highlight: string
  highlightHover: string
  /** Composantes RGB du halo pulsant des balises. */
  pulseRgb: string
  markerFill: string
  rim: string
}

const PALETTES: Record<ResolvedTheme, GlobePalette> = {
  light: {
    glow: 'rgba(251, 146, 60, 0.18)',
    glowFade: 'rgba(251, 146, 60, 0)',
    oceanLight: '#f3f8fa',
    oceanDark: '#d6e7ee',
    graticule: 'rgba(23, 58, 64, 0.06)',
    land: '#efe6da',
    landStroke: '#ffffff',
    highlight: '#ea4b35',
    highlightHover: '#c2361f',
    pulseRgb: '234, 75, 53',
    markerFill: '#ffffff',
    rim: 'rgba(23, 58, 64, 0.12)',
  },
  dark: {
    glow: 'rgba(251, 146, 60, 0.16)',
    glowFade: 'rgba(251, 146, 60, 0)',
    oceanLight: '#1f3540',
    oceanDark: '#0e1a20',
    graticule: 'rgba(255, 255, 255, 0.05)',
    land: '#3b342d',
    landStroke: '#1b1714',
    highlight: '#f2654a',
    highlightHover: '#ff9277',
    pulseRgb: '242, 101, 74',
    markerFill: '#fff7f2',
    rim: 'rgba(255, 255, 255, 0.1)',
  },
}

/* Les géométries (~100 Ko) sont chargées à la demande, côté client. */
let countriesPromise: Promise<Array<CountryFeature>> | null = null

const loadCountries = (): Promise<Array<CountryFeature>> =>
  (countriesPromise ??= import('world-atlas/countries-110m.json').then(
    (module) => {
      const topology = module.default as unknown as Topology<{
        countries: GeometryCollection<{ name: string }>
      }>
      const collection = feature(
        topology,
        topology.objects.countries,
      ) as FeatureCollection<Polygon | MultiPolygon, { name: string }>
      return collection.features
    },
  ))

export const DestinationsGlobe: React.FC<DestinationsGlobeProps> = ({
  destinations,
  onSelect,
  tilt = DEFAULT_TILT,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [countries, setCountries] = useState<Array<CountryFeature> | null>(null)
  const [hover, setHover] = useState<Hover | null>(null)
  const { resolvedTheme } = useTheme()
  // Lu à chaque image : changer de thème ne relance pas l'animation.
  const paletteRef = useRef(PALETTES[resolvedTheme])
  paletteRef.current = PALETTES[resolvedTheme]

  const byCode = useMemo(
    () =>
      new Map(
        destinations
          .filter(
            (d): d is Destination & { numericCode: string } =>
              d.numericCode !== undefined,
          )
          .map((d) => [d.numericCode, d]),
      ),
    [destinations],
  )

  // État d'animation mutable, hors cycle de rendu React.
  const state = useRef({
    rotation: [0, tilt] as [number, number],
    size: 0,
    dragging: null as null | {
      x: number
      y: number
      rotation: [number, number]
    },
    hoveredCode: null as string | null,
    visible: true,
  })

  useEffect(() => {
    let cancelled = false
    void loadCountries().then((features) => {
      if (!cancelled) setCountries(features)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Oriente le globe vers la première destination au chargement.
  useEffect(() => {
    if (!countries) return
    const first = countries.find(
      (c) => c.id !== undefined && byCode.has(String(c.id)),
    )
    if (first) {
      const [lon] = geoCentroid(first)
      state.current.rotation = [-lon + 25, tilt]
    }
  }, [countries, byCode, tilt])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !countries) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const highlighted = countries.filter(
      (c) => c.id !== undefined && byCode.has(String(c.id)),
    )
    const markers = highlighted.map((c) => ({
      code: String(c.id),
      centroid: geoCentroid(c),
    }))
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const projection = geoOrthographic().clipAngle(90).precision(0.4)
    const path = geoPath(projection, ctx)
    const graticule = geoGraticule10()
    const sphere = { type: 'Sphere' as const }

    const resize = () => {
      const size = container.clientWidth
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = size * dpr
      canvas.height = size * dpr
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      state.current.size = size
    }

    const draw = (time: number) => {
      const { size, rotation, hoveredCode } = state.current
      const colors = paletteRef.current
      const radius = size / 2 - size * 0.06
      const center = size / 2
      projection.scale(radius).translate([center, center]).rotate(rotation)

      ctx.clearRect(0, 0, size, size)

      // Halo
      const glow = ctx.createRadialGradient(
        center,
        center,
        radius * 0.9,
        center,
        center,
        radius * 1.12,
      )
      glow.addColorStop(0, colors.glow)
      glow.addColorStop(1, colors.glowFade)
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, size, size)

      // Océan
      const ocean = ctx.createRadialGradient(
        center - radius * 0.35,
        center - radius * 0.35,
        radius * 0.1,
        center,
        center,
        radius,
      )
      ocean.addColorStop(0, colors.oceanLight)
      ocean.addColorStop(1, colors.oceanDark)
      ctx.beginPath()
      path(sphere)
      ctx.fillStyle = ocean
      ctx.fill()

      ctx.beginPath()
      path(graticule)
      ctx.strokeStyle = colors.graticule
      ctx.lineWidth = 1
      ctx.stroke()

      // Terres
      ctx.beginPath()
      for (const country of countries) path(country)
      ctx.fillStyle = colors.land
      ctx.fill()
      ctx.strokeStyle = colors.landStroke
      ctx.lineWidth = 0.6
      ctx.stroke()

      // Pays avec des voyages
      for (const country of highlighted) {
        ctx.beginPath()
        path(country)
        ctx.fillStyle =
          String(country.id) === hoveredCode
            ? colors.highlightHover
            : colors.highlight
        ctx.fill()
      }

      // Balises pulsantes sur la face visible
      const center2d: [number, number] = [-rotation[0], -rotation[1]]
      const pulse = (time / 1600) % 1
      for (const marker of markers) {
        if (geoDistance(marker.centroid, center2d) > Math.PI / 2 - 0.1) continue
        const point = projection(marker.centroid)
        if (!point) continue
        const [x, y] = point
        ctx.beginPath()
        ctx.arc(x, y, 4 + pulse * 14, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${colors.pulseRgb}, ${0.35 * (1 - pulse)})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = colors.markerFill
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = colors.highlightHover
        ctx.stroke()
      }

      // Liseré
      ctx.beginPath()
      path(sphere)
      ctx.strokeStyle = colors.rim
      ctx.lineWidth = 1
      ctx.stroke()
    }

    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000
      last = now
      const s = state.current
      if (!reduceMotion && !s.dragging && !s.hoveredCode) {
        s.rotation = [s.rotation[0] + ROTATION_SPEED * dt, s.rotation[1]]
      }
      if (s.visible) draw(now)
      frame = requestAnimationFrame(tick)
    }

    const findDestination = (x: number, y: number) => {
      const coords = projection.invert?.([x, y])
      if (!coords) return null
      const center2d: [number, number] = [
        -state.current.rotation[0],
        -state.current.rotation[1],
      ]
      if (geoDistance(coords, center2d) > Math.PI / 2) return null
      const country = highlighted.find((c) => geoContains(c, coords))
      return country ? (byCode.get(String(country.id)) ?? null) : null
    }

    const localPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId)
      state.current.dragging = {
        x: event.clientX,
        y: event.clientY,
        rotation: state.current.rotation,
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const s = state.current
      if (s.dragging) {
        const k = 180 / (s.size * 0.9)
        const dx = event.clientX - s.dragging.x
        const dy = event.clientY - s.dragging.y
        s.rotation = [
          s.dragging.rotation[0] + dx * k,
          Math.max(-60, Math.min(60, s.dragging.rotation[1] - dy * k)),
        ]
        return
      }
      const { x, y } = localPoint(event)
      const destination = findDestination(x, y)
      s.hoveredCode = destination?.numericCode ?? null
      canvas.style.cursor = destination ? 'pointer' : 'grab'
      setHover(destination ? { destination, x, y } : null)
    }

    const onPointerUp = (event: PointerEvent) => {
      const drag = state.current.dragging
      state.current.dragging = null
      if (!drag) return
      const moved =
        Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y)
      if (moved < 5) {
        const { x, y } = localPoint(event)
        const destination = findDestination(x, y)
        if (destination) onSelect?.(destination)
      }
    }

    const onPointerLeave = () => {
      state.current.hoveredCode = null
      setHover(null)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      state.current.visible = entry.isIntersecting
    })
    intersectionObserver.observe(canvas)

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)

    resize()
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [countries, byCode, onSelect])

  const label = destinations.length
    ? `Globe des destinations : ${destinations.map((d) => d.name).join(', ')}`
    : 'Globe terrestre'

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-square w-full select-none', className)}
    >
      {!countries && (
        <div className="absolute inset-[6%] animate-pulse rounded-full bg-linear-to-br from-sky-50 to-sky-100 dark:from-slate-800 dark:to-slate-900" />
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="relative touch-none"
        style={{ cursor: 'grab' }}
      />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg border bg-popover px-3 py-2 text-sm whitespace-nowrap shadow-lg"
          style={{ left: hover.x, top: hover.y }}
        >
          <p className="font-semibold">{hover.destination.name}</p>
          <p className="text-xs text-muted-foreground">
            {hover.destination.tripCount} voyage
            {hover.destination.tripCount > 1 ? 's' : ''} · cliquer pour voir
          </p>
        </div>
      )}
    </div>
  )
}
