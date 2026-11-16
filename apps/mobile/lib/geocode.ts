/**
 * Geocoding via OpenStreetMap Nominatim (no API key).
 *
 * Usage policy: max ~1 request/second and an identifying User-Agent. We only call
 * it on explicit user actions (dropping a pin, opening the pickup step), never in
 * loops. For production scale, point NOMINATIM_URL at a self-hosted instance or a
 * commercial geocoder.
 */
import type { LatLng } from '@/components/maps/LeafletMap';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'User-Agent': 'LuggageShare-App/1.0', Accept: 'application/json' };

/** Known airport cities so the map opens instantly without a network round trip. */
const CITY_CENTERS: Record<string, LatLng> = {
  riyadh: { lat: 24.7136, lng: 46.6753 },
  jeddah: { lat: 21.4858, lng: 39.1925 },
  dammam: { lat: 26.4207, lng: 50.0888 },
  mecca: { lat: 21.3891, lng: 39.8579 },
  makkah: { lat: 21.3891, lng: 39.8579 },
  medina: { lat: 24.5247, lng: 39.5692 },
  madinah: { lat: 24.5247, lng: 39.5692 },
  abha: { lat: 18.2465, lng: 42.5117 },
  tabuk: { lat: 28.3835, lng: 36.5662 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  'abu dhabi': { lat: 24.4539, lng: 54.3773 },
  doha: { lat: 25.2854, lng: 51.531 },
  kuwait: { lat: 29.3759, lng: 47.9774 },
  manama: { lat: 26.2285, lng: 50.586 },
  bahrain: { lat: 26.2285, lng: 50.586 },
  muscat: { lat: 23.588, lng: 58.3829 },
  cairo: { lat: 30.0444, lng: 31.2357 },
  amman: { lat: 31.9454, lng: 35.9284 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  london: { lat: 51.5072, lng: -0.1276 },
};

export const DEFAULT_CENTER: LatLng = CITY_CENTERS.riyadh;

export async function cityCenter(city?: string | null): Promise<LatLng | null> {
  if (!city) return null;
  const known = CITY_CENTERS[city.trim().toLowerCase()];
  if (known) return known;
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/search?format=json&limit=1&q=${encodeURIComponent(city)}`,
      { headers: HEADERS }
    );
    const [hit] = await res.json();
    return hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
  } catch {
    return null;
  }
}

/** Short human-readable address for a point, in the user's language. */
export async function reverseGeocode(point: LatLng, language: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&zoom=18&lat=${point.lat}&lon=${point.lng}`,
      { headers: { ...HEADERS, 'Accept-Language': language } }
    );
    const json = await res.json();
    const a = json?.address ?? {};
    const parts = [
      a.amenity || a.aeroway || a.building || a.shop || a.tourism,
      a.road,
      a.neighbourhood || a.suburb,
      a.city || a.town || a.village,
    ].filter(Boolean);
    return parts.length
      ? Array.from(new Set(parts)).slice(0, 3).join(', ')
      : (json?.display_name ?? null);
  } catch {
    return null;
  }
}

/** Universal link that opens the user's maps app at a point. */
export function mapsLink(point: LatLng): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
}
