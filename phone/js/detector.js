import {
  MARKER_SIZE,
  VALID_IDS,
  DETECTION_EVERY_N_FRAMES
} from "./config.js";
import {
  state,
  incrementFrameCounter,
  setReferenceMarkerId,
  setDistance
} from "./state.js";

let detector = null;
let posit = null;
let currentCanvasWidth = null;

/**
 * Initialisiert / reinitialisiert Detector und POSIT.
 */
export function initDetector(canvasWidth) {
  detector = new AR.Detector({
    dictionaryName: "ARUCO"
  });

  posit = new POS.Posit(MARKER_SIZE, canvasWidth);
  currentCanvasWidth = canvasWidth;
}

/**
 * Stellt sicher, dass der Detector zur aktuellen Canvasbreite passt.
 */
export function ensureDetector(canvasWidth) {
  if (!detector || !posit || currentCanvasWidth !== canvasWidth) {
    initDetector(canvasWidth);
  }
}

/**
 * Führt nur jedes N-te Frame eine Erkennung aus.
 */
export function shouldRunDetection() {
  incrementFrameCounter();
  return state.frameCounter % DETECTION_EVERY_N_FRAMES === 0;
}

/**
 * Erkennt Marker im aktuellen Bild.
 */
export function detectMarkers(ctx, canvas) {
  if (!detector) return [];

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const detectedMarkers = detector.detect(imageData);

  return dedupeMarkersByLargestArea(detectedMarkers);
}

/**
 * Schätzt Pose für einen Marker.
 */
export function estimateMarkerPose(marker, canvas) {
  if (!posit || !marker) return null;

  const positCorners = marker.corners.map(corner => ({
    x: corner.x - canvas.width / 2,
    y: canvas.height / 2 - corner.y
  }));

  const pose = posit.pose(positCorners);

  if (!pose || !pose.bestTranslation || !pose.bestRotation) {
    return null;
  }

  return {
    id: marker.id,
    translation: pose.bestTranslation,
    rotation: pose.bestRotation
  };
}

/**
 * Wählt den Referenzmarker.
 */
export function chooseReferenceMarker(markers) {
  if (!markers.length) {
    setReferenceMarkerId(null);
    return null;
  }

  if (state.referenceMarkerId !== null) {
    const sameMarker = markers.find(marker => marker.id === state.referenceMarkerId);
    if (sameMarker) {
      return sameMarker;
    }
  }

  const biggest = [...markers].sort((a, b) => getMarkerArea(b) - getMarkerArea(a))[0];
  setReferenceMarkerId(biggest.id);
  return biggest;
}

/**
 * Schätzt grobe Distanz aus Markergröße.
 */
export function estimateDistanceFromMarker(marker, focalLengthPx, minDistance, maxDistance) {
  if (!marker) {
    setDistance(null);
    return null;
  }

  const pixelSize = getMarkerPixelSize(marker);
  if (pixelSize <= 1) {
    setDistance(null);
    return null;
  }

  const distance = Math.max(
    minDistance,
    Math.min(maxDistance, (focalLengthPx * MARKER_SIZE) / pixelSize)
  );

  setDistance(distance);
  return distance;
}

function dedupeMarkersByLargestArea(markers) {
  const bestById = new Map();

  for (const marker of markers) {
    if (!VALID_IDS.has(marker.id)) continue;

    const area = getMarkerArea(marker);
    const existing = bestById.get(marker.id);

    if (!existing || area > existing.area) {
      bestById.set(marker.id, { marker, area });
    }
  }

  return Array.from(bestById.values()).map(entry => entry.marker);
}

export function getMarkerArea(marker) {
  const corners = marker.corners;
  let area = 0;

  for (let i = 0; i < corners.length; i++) {
    const j = (i + 1) % corners.length;
    area += corners[i].x * corners[j].y;
    area -= corners[j].x * corners[i].y;
  }

  return Math.abs(area / 2);
}

export function getMarkerCenter(marker) {
  let x = 0;
  let y = 0;

  for (const corner of marker.corners) {
    x += corner.x;
    y += corner.y;
  }

  return {
    x: x / marker.corners.length,
    y: y / marker.corners.length
  };
}

export function getMarkerPixelSize(marker) {
  const c = marker.corners;

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  const d1 = dist(c[0], c[1]);
  const d2 = dist(c[1], c[2]);
  const d3 = dist(c[2], c[3]);
  const d4 = dist(c[3], c[0]);

  return (d1 + d2 + d3 + d4) / 4;
}