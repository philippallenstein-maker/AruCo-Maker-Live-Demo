/**
 * Tracking-Modul:
 * - Glättet Marker (Corners)
 * - Glättet Distanz
 * - Hält Zustand zwischen Frames
 */

let lastMarkerId = null;
let smoothedCorners = null;
let smoothedDistance = null;

/**
 * Stärke der Glättung:
 * 0.0 = keine Glättung
 * 1.0 = extrem träge
 */
const SMOOTHING = 0.5;

/**
 * Glättet Marker-Ecken
 */
export function smoothMarker(marker) {
  if (!marker) {
    resetTracking();
    return null;
  }

  // Wenn Marker wechselt → Reset
  if (marker.id !== lastMarkerId) {
    lastMarkerId = marker.id;
    smoothedCorners = marker.corners.map(c => ({ x: c.x, y: c.y }));
    return marker;
  }

  // Glätten
  for (let i = 0; i < marker.corners.length; i++) {
    smoothedCorners[i].x =
      SMOOTHING * smoothedCorners[i].x +
      (1 - SMOOTHING) * marker.corners[i].x;

    smoothedCorners[i].y =
      SMOOTHING * smoothedCorners[i].y +
      (1 - SMOOTHING) * marker.corners[i].y;
  }

  return {
    ...marker,
    corners: smoothedCorners
  };
}

/**
 * Glättet Distanz
 */
export function smoothDistance(distance) {
  if (distance === null) {
    smoothedDistance = null;
    return null;
  }

  if (smoothedDistance === null) {
    smoothedDistance = distance;
    return distance;
  }

  smoothedDistance =
    SMOOTHING * smoothedDistance +
    (1 - SMOOTHING) * distance;

  return smoothedDistance;
}

/**
 * Reset bei Markerverlust
 */
export function resetTracking() {
  lastMarkerId = null;
  smoothedCorners = null;
  smoothedDistance = null;
}