/**
 * Location tracking architecture interfaces.
 * Native background services are intentionally not implemented —
 * these contracts keep the frontend ready for future native bridges.
 */

import type { GeoPosition } from '@/types'

export type LocationTrackingEvent =
  | 'started'
  | 'stopped'
  | 'heartbeat'
  | 'exit'
  | 'return'
  | 'error'

export interface LocationTrackingConfig {
  intervalMs: number
  minAccuracyMeters: number
  fenceLat: number
  fenceLon: number
  radiusMeters: number
  onEvent: (event: LocationTrackingEvent, position?: GeoPosition, error?: Error) => void
}

export interface LocationTracker {
  start(config: LocationTrackingConfig): Promise<void>
  stop(): Promise<void>
  isRunning(): boolean
  getLastPosition(): GeoPosition | null
}

/** Default poll interval — 5 minutes (matches product requirement). */
export const DEFAULT_TRACKING_INTERVAL_MS = 5 * 60 * 1000

/**
 * Browser-based foreground tracker.
 * Periodic watches while the tab is active; exit/return detection ready.
 */
export class ForegroundLocationTracker implements LocationTracker {
  private watchId: number | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private lastPosition: GeoPosition | null = null
  private wasInside: boolean | null = null
  private config: LocationTrackingConfig | null = null

  async start(config: LocationTrackingConfig): Promise<void> {
    await this.stop()
    this.config = config

    if (!('geolocation' in navigator)) {
      config.onEvent('error', undefined, new Error('Geolocation is not supported'))
      return
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePosition(pos),
      (err) => config.onEvent('error', undefined, new Error(err.message)),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 },
    )

    this.intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.handlePosition(pos, true),
        (err) => config.onEvent('error', undefined, new Error(err.message)),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 },
      )
    }, config.intervalMs)

    config.onEvent('started')
  }

  async stop(): Promise<void> {
    if (this.watchId != null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    if (this.intervalId != null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    if (this.config) this.config.onEvent('stopped')
    this.config = null
    this.wasInside = null
  }

  isRunning(): boolean {
    return this.watchId != null
  }

  getLastPosition(): GeoPosition | null {
    return this.lastPosition
  }

  private handlePosition(pos: GeolocationPosition, heartbeat = false) {
    if (!this.config) return

    const position: GeoPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    }
    this.lastPosition = position

    const distance = this.distance(
      position.latitude,
      position.longitude,
      this.config.fenceLat,
      this.config.fenceLon,
    )
    const inside = distance <= this.config.radiusMeters

    if (this.wasInside === true && !inside) {
      this.config.onEvent('exit', position)
    } else if (this.wasInside === false && inside) {
      this.config.onEvent('return', position)
    } else if (heartbeat) {
      this.config.onEvent('heartbeat', position)
    }

    this.wasInside = inside
  }

  private distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6_371_000
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
}
