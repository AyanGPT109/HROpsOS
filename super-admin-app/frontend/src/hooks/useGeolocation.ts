import { useCallback, useState } from 'react'
import type { GeoPosition } from '@/types'
import { MIN_GPS_ACCURACY_METERS } from '@/utils/geo'

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestPermission = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation is not supported by this browser.')
    }
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' })
        if (status.state === 'denied') {
          throw new Error('Location permission denied. Enable it in browser settings.')
        }
      } catch {
        // permissions API may not support geolocation query in all browsers
      }
    }
  }, [])

  const getCurrentPosition = useCallback(async (): Promise<GeoPosition> => {
    setLoading(true)
    setError(null)
    try {
      await requestPermission()

      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20_000,
          maximumAge: 0,
        })
      })

      const result: GeoPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      }

      if (result.accuracy > MIN_GPS_ACCURACY_METERS) {
        // Still return position; caller decides whether to reject
      }

      setPosition(result)
      return result
    } catch (err) {
      const message =
        err instanceof GeolocationPositionError
          ? geolocationErrorMessage(err)
          : err instanceof Error
            ? err.message
            : 'Unable to get location'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [requestPermission])

  return { position, error, loading, getCurrentPosition, requestPermission }
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location permission denied.'
    case err.POSITION_UNAVAILABLE:
      return 'Location information is unavailable.'
    case err.TIMEOUT:
      return 'Location request timed out.'
    default:
      return 'Unable to get location.'
  }
}
