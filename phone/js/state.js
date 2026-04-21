/**
 * Zentraler Zustand der Phone-Seite.
 * Hier speichern wir:
 * - Stream
 * - Video-Track
 * - Status
 * - Referenzmarker
 * - Distanz
 * - Frame-Zähler
 */

export const state = {
  stream: null,
  videoTrack: null,
  status: "Bereit",
  referenceMarkerId: null,
  distance: null,
  frameCounter: 0,
  animationFrameId: null,

  positioning: {
    centerX: null,
    centerY: null,
    normX: null,
    normY: null,
    distance: null
  }
};

/**
 * Setzt den aktuellen Stream.
 */
export function setStream(stream) {
  state.stream = stream;
}

/**
 * Gibt den aktuellen Stream zurück.
 */
export function getStream() {
  return state.stream;
}

/**
 * Setzt den Video-Track.
 */
export function setVideoTrack(track) {
  state.videoTrack = track;
}

/**
 * Gibt den aktuellen Video-Track zurück.
 */
export function getVideoTrack() {
  return state.videoTrack;
}

/**
 * Setzt einen Status-Text.
 */
export function setStatus(status) {
  state.status = status;
}

/**
 * Setzt die aktuelle Referenz-ID.
 */
export function setReferenceMarkerId(id) {
  state.referenceMarkerId = id;
}

/**
 * Setzt die Distanzanzeige.
 */
export function setDistance(distance) {
  state.distance = distance;
}

/**
 * Erhöht den Frame-Zähler.
 */
export function incrementFrameCounter() {
  state.frameCounter += 1;
}

/**
 * Setzt den Frame-Zähler zurück.
 */
export function resetFrameCounter() {
  state.frameCounter = 0;
}

/**
 * Setzt die aktuelle requestAnimationFrame-ID.
 */
export function setAnimationFrameId(id) {
  state.animationFrameId = id;
}

/**
 * Gibt die aktuelle requestAnimationFrame-ID zurück.
 */
export function getAnimationFrameId() {
  return state.animationFrameId;
}

/**
 * Setzt Referenzmarker + Distanz zurück.
 */
export function resetTrackingInfo() {
  state.referenceMarkerId = null;
  state.distance = null;
  state.positioning = {
    centerX: null,
    centerY: null,
    normX: null,
    normY: null,
    distance: null
  };
}


export function setPositioning(positioning) {
  state.positioning = {
    ...state.positioning,
    ...positioning
  };
}

export function resetPositioning() {
  state.positioning = {
    centerX: null,
    centerY: null,
    normX: null,
    normY: null,
    distance: null
  };
}