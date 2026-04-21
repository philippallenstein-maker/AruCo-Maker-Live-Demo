import { getMarkerCenter } from "./detector.js";

/**
 * Positioning-Modul:
 * - berechnet normierte Bildlage des Referenzmarkers
 * - normX: links/rechts relativ zur Bildmitte
 * - normY: oben/unten relativ zur Bildmitte
 *
 * Wertebereich ungefähr:
 * -1 ... 0 ... +1
 *
 * normX:
 * - negativ = Marker links im Bild
 * - positiv = Marker rechts im Bild
 *
 * normY:
 * - negativ = Marker oben im Bild
 * - positiv = Marker unten im Bild
 */

export function calculateMarkerPosition(referenceMarker, canvas, distance) {
  if (!referenceMarker || !canvas) {
    return null;
  }

  const center = getMarkerCenter(referenceMarker);

  const normX = (center.x - canvas.width / 2) / (canvas.width / 2);
  const normY = (center.y - canvas.height / 2) / (canvas.height / 2);

  return {
    centerX: center.x,
    centerY: center.y,
    normX,
    normY,
    distance: distance ?? null
  };
}