import { state } from "./state.js";
import { initCamera, startCamera, stopCamera } from "./camera.js";

/**
 * Einstiegspunkt der Phone-Seite.
 * Diese Datei verbindet:
 * - DOM
 * - Kamera
 * - UI
 */

let elements = null;

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
  });

  elements.stopCameraBtn.addEventListener("click", () => {
    stopCamera();
  });
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