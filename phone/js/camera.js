import { CAMERA_CONSTRAINTS } from "./config.js";
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
 * - Video proportional ins Canvas zeichnen
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
}

/**
 * Startet die Kamera.
 */
export async function startCamera() {
  try {
    setStatus("Kamera wird gestartet...");
    updateStatusUI();

    stopCamera();

    const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
    setStream(stream);

    const videoTrack = stream.getVideoTracks()[0] || null;
    setVideoTrack(videoTrack);

    videoElement.srcObject = stream;
    await videoElement.play();

    // Canvas erst jetzt an echtes Video-Seitenverhältnis anpassen
    syncCanvasToVideo();

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
 * Passt das Canvas an das echte Videoformat an.
 */
function syncCanvasToVideo() {
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  if (!videoWidth || !videoHeight) return;

  canvasElement.width = videoWidth;
  canvasElement.height = videoHeight;

  canvasElement.style.width = "100%";
  canvasElement.style.height = "auto";
}

/**
 * Startet die Render-Schleife.
 */
function startRenderLoop() {
  function render() {
    if (videoElement && canvasContext) {
      if (videoElement.readyState >= 2) {
        // Falls sich Videomaße ändern, Canvas nachziehen
        if (
          canvasElement.width !== videoElement.videoWidth ||
          canvasElement.height !== videoElement.videoHeight
        ) {
          syncCanvasToVideo();
        }

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