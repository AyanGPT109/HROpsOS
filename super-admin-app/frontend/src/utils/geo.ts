/** Earth radius in meters for Haversine calculations. */
const EARTH_RADIUS_METERS = 6_371_000

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Haversine distance between two WGS84 coordinates, in meters.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_METERS * c
}

export function isInsideGeofence(params: {
  latitude: number
  longitude: number
  fenceLat: number
  fenceLon: number
  radiusMeters: number
}): boolean {
  const distance = haversineDistanceMeters(
    params.latitude,
    params.longitude,
    params.fenceLat,
    params.fenceLon,
  )
  return distance <= params.radiusMeters
}

export function distanceFromFenceMeters(params: {
  latitude: number
  longitude: number
  fenceLat: number
  fenceLon: number
}): number {
  return haversineDistanceMeters(
    params.latitude,
    params.longitude,
    params.fenceLat,
    params.fenceLon,
  )
}

/** Default minimum GPS accuracy required for check-in/out (meters). */
export const MIN_GPS_ACCURACY_METERS = 50

export function isGpsAccuracyAcceptable(
  accuracy: number,
  maxMeters = MIN_GPS_ACCURACY_METERS,
): boolean {
  return Number.isFinite(accuracy) && accuracy > 0 && accuracy <= maxMeters
}
