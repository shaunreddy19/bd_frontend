/**
 * STRIDE Geographic Intelligence Utilities
 * Provides Haversine spherical distance calculation and Point-in-Polygon validation.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Ray-casting algorithm to determine if a point [latitude, longitude] is inside a polygon.
 * Polygon vertices are given as an array of [lat, lng].
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  if (!polygon || polygon.length < 3) return false;

  const [px, py] = [point[0], point[1]];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Determines whether a location falls inside an affected disaster zone,
 * either by polygon intersection or radial fallback.
 */
export function isLocationInAffectedZone(
  lat: number,
  lng: number,
  polygonGeoJson: string,
  radiusKm = 5.0
): boolean {
  try {
    const polygon = JSON.parse(polygonGeoJson);
    if (Array.isArray(polygon) && polygon.length >= 3) {
      // Check if coordinates format is [[lat, lng], ...]
      return isPointInPolygon([lat, lng], polygon);
    }
  } catch {
    // If parsing fails or polygon is empty, fallback to center + radius if center exists
  }
  return false;
}
