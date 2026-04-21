import { setDistance } from "./state.js";

let lastMarkerId = null;
let smoothedCorners = null;
let smoothedDistance = null;

const SMOOTHING = 0.6;

export function smoothMarker(marker) {
  if (!marker) {
    resetTracking();
    return null;
  }

  if (marker.id !== lastMarkerId) {
    lastMarkerId = marker.id;
    smoothedCorners = marker.corners.map(c => ({ x: c.x, y: c.y }));
    return {
      ...marker,
      corners: smoothedCorners
    };
  }

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

export function smoothDistance(distance) {
  if (distance === null) {
    smoothedDistance = null;
    setDistance(null);
    return null;
  }

  if (smoothedDistance === null) {
    smoothedDistance = distance;
    setDistance(distance);
    return distance;
  }

  smoothedDistance =
    SMOOTHING * smoothedDistance +
    (1 - SMOOTHING) * distance;

  setDistance(smoothedDistance);
  return smoothedDistance;
}

export function resetTracking() {
  lastMarkerId = null;
  smoothedCorners = null;
  smoothedDistance = null;
  setDistance(null);
}