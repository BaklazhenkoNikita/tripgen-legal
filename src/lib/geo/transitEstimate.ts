export interface LatLng {
  lat: number;
  lng: number;
}

export type TransitMode = 'walk' | 'metro' | 'taxi' | 'transit';

export interface TransitEstimate {
  mode: TransitMode;
  durationMinutes: number;
  distanceMeters: number;
  label: string;
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateTransit(from: LatLng, to: LatLng): TransitEstimate {
  const dist = haversineDistance(from.lat, from.lng, to.lat, to.lng);

  if (dist < 800) {
    const mins = Math.max(1, Math.round(dist / 80));
    return {
      mode: 'walk',
      durationMinutes: mins,
      distanceMeters: Math.round(dist),
      label: `${mins} min walk`,
    };
  }

  if (dist < 4_000) {
    const mins = Math.round(dist / 500 + 5);
    return {
      mode: 'metro',
      durationMinutes: mins,
      distanceMeters: Math.round(dist),
      label: `Metro · ${mins} min`,
    };
  }

  if (dist < 15_000) {
    const mins = Math.round(dist / 400 + 5);
    return {
      mode: 'taxi',
      durationMinutes: mins,
      distanceMeters: Math.round(dist),
      label: `Taxi · ${mins} min`,
    };
  }

  const mins = Math.round(dist / 600 + 10);
  return {
    mode: 'transit',
    durationMinutes: mins,
    distanceMeters: Math.round(dist),
    label: `Transit · ${mins} min`,
  };
}

export function formatSegmentLabel(estimate: TransitEstimate): string {
  const { durationMinutes, distanceMeters } = estimate;
  const dist =
    distanceMeters < 1000
      ? `${Math.round(distanceMeters)} m`
      : `${(distanceMeters / 1000).toFixed(1)} km`;
  return `${dist} · ${durationMinutes} min`;
}
