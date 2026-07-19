import { useCallback, useState } from 'react'
import type { GeoPosition } from '@/types'
import { MIN_GPS_ACCURACY_METERS } from '@/utils/geo'
import { Geolocation } from '@capacitor/geolocation'

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestPermission = useCallback(async () => {
    const permission = await Geolocation.requestPermissions()
    if (permission.location !== 'granted') {
      throw new Error('Location permission denied. Enable it in browser settings.')
    }
  }, [])

  const getCurrentPosition = useCallback(async (): Promise<GeoPosition> => {
    setLoading(true)
    setError(null)
    try {
      await requestPermission()

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
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
        err instanceof Error
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
