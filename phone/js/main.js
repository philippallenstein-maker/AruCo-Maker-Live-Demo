import { state, setStatus } from "./state.js";
import { initCamera, startCamera, stopCamera, setOnFrameCallback, getCanvasContext, getCanvasElement } from "./camera.js";
import {
  initDetector,
  shouldRunDetection,
  detectMarkers,
  chooseReferenceMarker,
  estimateMarkerPose,
  estimateDistanceFromMarker
} from "./detector.js";
import {
  drawMarkers,
  drawAxes,
  drawInfo
} from "./overlay.js";
import {
  FOCAL_LENGTH_PX
} from "./config.js";

/**
 * Einstiegspunkt der Phone-Seite.
 * Diese Datei verbindet:
 * - DOM
 * - Kamera
 * - Detektor
 * - Overlay
 */

let elements = null;
let lastMarkers = [];
let lastReferenceMarker = null;
let lastReferencePose = null;

init();

/**
 * Startet die komplette Phone-Seite.
 */
function init() {
  elements = {
    startCameraBtn: document.getElementById("startCameraBtn"),
    stopCameraBtn: document.getElementById("stopCameraBtn"),
    statusValue: document.getElementById("statusValue"),
    referenceIdValue: document.getElementById("referenceIdValue"),
    distanceValue: document.getElementById("distanceValue"),
    video: document.getElementById("video"),
    canvas: document.getElementById("canvas")
  };

  initCamera({
    video: elements.video,
    canvas: elements.canvas
  });

  // Detector erst initialisieren, wenn das Canvas existiert
  initDetector(elements.canvas.width);

  // Callback für jeden Frame registrieren
  setOnFrameCallback(handleFrame);

  bindEvents();
  updateStatusUI();
  updateTrackingUI();
}

/**
 * Verknüpft Buttons mit Aktionen.
 */
function bindEvents() {
  elements.startCameraBtn.addEventListener("click", async () => {
    await startCamera();
    updateStatusUI();
    updateTrackingUI();
  });

  elements.stopCameraBtn.addEventListener("click", () => {
    stopCamera();
    lastMarkers = [];
    lastReferenceMarker = null;
    lastReferencePose = null;
    updateStatusUI();
    updateTrackingUI();
  });
}

/**
 * Wird nach jedem gerenderten Kameraframe aufgerufen.
 */
function handleFrame() {
  const ctx = getCanvasContext();
  const canvas = getCanvasElement();

  if (!ctx || !canvas) return;

  // Nicht in jedem Frame neu erkennen
  if (shouldRunDetection()) {
    const markers = detectMarkers(ctx, canvas);
    const referenceMarker = chooseReferenceMarker(markers);

    let referencePose = null;
    let distance = null;

    if (referenceMarker) {
      referencePose = estimateMarkerPose(referenceMarker, canvas);
      distance = estimateDistanceFromMarker(referenceMarker, FOCAL_LENGTH_PX, 0.2, 5.0);
    }

    lastMarkers = markers;
    lastReferenceMarker = referenceMarker;
    lastReferencePose = referencePose;

    if (referenceMarker) {
      setStatus(`Kamera läuft – ${markers.length} Marker – Referenz ${referenceMarker.id}`);
    } else {
      setStatus("Kamera läuft – kein Marker erkannt");
    }

    updateStatusUI();
    updateTrackingUI();
  }

  // Overlay immer auf Basis des letzten erkannten Zustands zeichnen
  drawMarkers(ctx, lastMarkers, state.referenceMarkerId);

  if (lastReferencePose) {
    drawAxes(ctx, canvas, lastReferencePose);
  }

  drawInfo(ctx, lastReferenceMarker, state.distance);
}

/**
 * Aktualisiert die Statusanzeige.
 */
export function updateStatusUI() {
  if (!elements) return;
  elements.statusValue.textContent = state.status;
}

/**
 * Aktualisiert Referenzmarker und Distanzanzeige.
 */
export function updateTrackingUI() {
  if (!elements) return;

  elements.referenceIdValue.textContent =
    state.referenceMarkerId !== null ? state.referenceMarkerId : "-";

  elements.distanceValue.textContent =
    state.distance !== null ? Number(state.distance).toFixed(2) : "-";
}