/**
 * Zentrale Konfiguration für die Phone-Seite.
 * Hier stehen nur feste Werte und keine eigentliche Logik.
 */

/**
 * Reale Markergröße in Metern.
 */
export const MARKER_SIZE = 0.10;

/**
 * Nur diese Marker-IDs sind für unser Setup relevant.
 */
export const VALID_IDS = new Set([0, 1, 2, 3]);

/**
 * Overlay-Achsenlänge in Metern.
 * Nur für die gezeichneten X/Y/Z-Linien am Marker.
 */
export const AXIS_LENGTH_METERS = 0.06;

/**
 * Arbeitsauflösung für das Canvas.
 * Wir arbeiten bewusst nicht zu hoch, damit es stabil läuft.
 */
export const WORK_CANVAS = {
  width: 1920,
  height: 1080
};

/**
 * Kamerawünsche für getUserMedia().
 * Noch simpel gehalten.
 */
export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  audio: false
};

/**
 * Nur jedes N-te Frame wird wirklich erkannt.
 * Das reduziert Last und Ruckeln.
 */
export const DETECTION_EVERY_N_FRAMES = 2;

/**
 * Näherungswert für Distanz aus Markergröße in Pixeln.
 * Später feinjustierbar.
 */
export const FOCAL_LENGTH_PX = 1400;

/**
 * WebSocket-URL.
 * Später für die getrennte Sendelogik.
 * Im ersten Schritt lassen wir das noch ungenutzt.
 */
export const WS_URL = "";