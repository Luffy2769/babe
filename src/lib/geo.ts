export type Coords = { lat: number; lon: number }

/** Mean Earth radius (IUGG), km. */
const R = 6371.0088

const rad = (deg: number) => (deg * Math.PI) / 180

/**
 * Great-circle distance between two points, in km.
 *
 * Computed rather than hard-coded so the number on screen can never drift out
 * of sync with the coordinates in PEOPLE — change a city and the distance,
 * the teaser copy and the map all follow.
 */
export function haversineKm(a: Coords, b: Coords): number {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
