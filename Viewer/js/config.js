/**
 * Zentrale Konfiguration für den Viewer.
 * Hier stehen ALLE festen Maße und Koordinatendefinitionen.
 */

/**
 * Lokales Marker-Koordinatensystem:
 *
 * ID2 = Ursprung = (0.0, 0.0, 0.0)
 * ID3 = (0.8, 0.0, 0.0)
 * ID0 = (0.0, 0.6, 0.0)
 * ID1 = (0.8, 0.6, 0.0)
 *
 * Damit gilt:
 * - X läuft nach rechts
 * - Y läuft nach oben
 * - Z läuft in den Raum hinein
 */
export const MARKER_LOCAL = {
  2: { x: 0.0, y: 0.0, z: 0.0 },
  3: { x: 0.8, y: 0.0, z: 0.0 },
  0: { x: 0.0, y: 0.6, z: 0.0 },
  1: { x: 0.8, y: 0.6, z: 0.0 }
};

export const MARKER_SIZE = 0.10;
export const MARKER_RECT_WIDTH = 0.80;
export const MARKER_RECT_HEIGHT = 0.60;

/**
 * Reale Höhe:
 * ID2 hängt auf 1.20 m über dem Boden.
 *
 * Weil ID2 unser lokaler Ursprung ist, liegt der Boden lokal bei:
 * Y = -1.20
 */
export const ID2_HEIGHT_ABOVE_FLOOR = 1.20;
export const FLOOR_Y = -1.20;

/**
 * Raumgröße für die Darstellung.
 * Das ist die globale Viewer-Welt.
 */
export const ROOM = {
  width: 3.0,
  height: 2.8,
  depth: 4.0
};

/**
 * Markergruppe mittig auf der Wand.
 *
 * Wir setzen NICHT das Koordinatensystem in die Wandmitte,
 * sondern nur die Darstellung der Markergruppe wird global verschoben.
 *
 * Lokales KS bleibt weiter bei ID2.
 */
export const MARKER_GROUP_OFFSET = {
  x: 1.1,
  y: 1.2,
  z: 0.0
};

/**
 * Wandposition in der globalen Szene.
 * Die Wand liegt bei global z = 0.
 */
export const WALL = {
  z: 0
};

/**
 * Startansicht der Three.js-Kamera.
 */
export const VIEW_CAMERA = {
  position: { x: 4.8, y: 3.0, z: 5.8 },
  target: { x: 1.2, y: 0.8, z: 1.2 }
};

/**
 * Startpose des Kameraobjekts im lokalen Marker-Koordinatensystem.
 * Also:
 * - X relativ zu ID2
 * - Y relativ zu ID2
 * - Z Abstand in den Raum
 */
export const INITIAL_POSE = {
  x: 0.4,
  y: 0.3,
  z: 1.2,
  yaw: 0,
  pitch: 0,
  roll: 0
};

/**
 * Hilfsfunktion:
 * Rechnet lokale Markerkoordinaten in globale Szenenkoordinaten um.
 *
 * Global = Markergruppen-Offset + lokal
 */
export function localToGlobal(localPoint) {
  return {
    x: MARKER_GROUP_OFFSET.x + localPoint.x,
    y: MARKER_GROUP_OFFSET.y + localPoint.y,
    z: MARKER_GROUP_OFFSET.z + localPoint.z
  };
}

/**
 * Hilfsfunktion:
 * Rechnet eine lokale Kamerapose in globale Szenenkoordinaten um.
 */
export function poseLocalToGlobal(localPose) {
  return {
    x: MARKER_GROUP_OFFSET.x + localPose.x,
    y: MARKER_GROUP_OFFSET.y + localPose.y,
    z: MARKER_GROUP_OFFSET.z + localPose.z,
    yaw: localPose.yaw,
    pitch: localPose.pitch,
    roll: localPose.roll
  };
}