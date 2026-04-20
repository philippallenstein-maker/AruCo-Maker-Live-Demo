import { CAMERA_CONSTRAINTS, WORK_CANVAS } from "./config.js";
import {
  setStream,
  getStream,
  setVideoTrack,
  setStatus,
  setAnimationFrameId,
  getAnimationFrameId,
  resetFrameCounter,
  resetTrackingInfo
} from "./state.js";
import { updateStatusUI, updateTrackingUI } from "./main.js";

/**
 * Kamera-Modul:
 * - Kamera starten
 * - Kamera stoppen
 * - Video in Canvas zeichnen
 */

let videoElement = null;
let canvasElement = null;
let canvasContext = null;

/**
 * Initialisiert das Modul mit DOM-Elementen.
 */
export function initCamera({ video, canvas }) {
  videoElement = video;
  canvasElement = canvas;
  canvasContext = canvas.getContext("2d");

  // interne Rendergröße (hoch = scharf)
canvasElement.width = WORK_CANVAS.width;
canvasElement.height = WORK_CANVAS.height;

// CSS-Größe (wird angepasst)
canvasElement.style.width = "100%";
canvasElement.style.height = "auto";
}

/**
 * Startet die Kamera.
 */
export async function startCamera() {
  try {
    setStatus("Kamera wird gestartet...");
    updateStatusUI();

    // Falls schon ein Stream läuft, erst stoppen
    stopCamera();

    const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);

    setStream(stream);

    const videoTrack = stream.getVideoTracks()[0] || null;
    setVideoTrack(videoTrack);

    videoElement.srcObject = stream;
    await videoElement.play();

    resetFrameCounter();
    resetTrackingInfo();

    setStatus("Kamera läuft");
    updateStatusUI();
    updateTrackingUI();

    startRenderLoop();
  } catch (error) {
    console.error("Fehler beim Starten der Kamera:", error);
    setStatus("Kamerafehler");
    updateStatusUI();
  }
}

/**
 * Stoppt die Kamera sauber.
 */
export function stopCamera() {
  const stream = getStream();
  const animationFrameId = getAnimationFrameId();

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    setAnimationFrameId(null);
  }

  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }

  setStream(null);
  setVideoTrack(null);

  if (videoElement) {
    videoElement.srcObject = null;
  }

  if (canvasContext && canvasElement) {
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  resetFrameCounter();
  resetTrackingInfo();

  setStatus("Kamera gestoppt");
  updateStatusUI();
  updateTrackingUI();
}

/**
 * Startet die Render-Schleife.
 * Im ersten Schritt zeichnen wir nur das Video ins Canvas.
 */
function startRenderLoop() {
  function render() {
    if (videoElement && canvasContext) {
      if (videoElement.readyState >= 2) {
        canvasContext.drawImage(
          videoElement,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
      }
    }

    const id = requestAnimationFrame(render);
    setAnimationFrameId(id);
  }

  render();
}