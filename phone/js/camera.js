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

/**
 * Kamera-Modul:
 * - Kamera starten
 * - Kamera stoppen
 * - Video proportional ins Canvas zeichnen
 * - optional pro Frame Callback ausführen
 *
 * WICHTIG:
 * Diese Datei importiert NICHTS aus main.js.
 */

let videoElement = null;
let canvasElement = null;
let canvasContext = null;
let canvasWrapper = null;

let onFrameCallback = null;

export function initCamera({ video, canvas }) {
  videoElement = video;
  canvasElement = canvas;
  canvasContext = canvas.getContext("2d");
  canvasWrapper = canvas.parentElement;
}

export function setOnFrameCallback(callback) {
  onFrameCallback = callback;
}

export function getCanvasContext() {
  return canvasContext;
}

export function getCanvasElement() {
  return canvasElement;
}

export async function startCamera() {
  try {
    setStatus("Kamera wird gestartet...");

    stopCamera();

    const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
    setStream(stream);

    const videoTrack = stream.getVideoTracks()[0] || null;
    setVideoTrack(videoTrack);

    videoElement.srcObject = stream;
    await videoElement.play();

    syncCanvasToVideo();

    resetFrameCounter();
    resetTrackingInfo();

    setStatus("Kamera läuft");

    startRenderLoop();
    return true;
  } catch (error) {
    console.error("Fehler beim Starten der Kamera:", error);
    setStatus("Kamerafehler");
    return false;
  }
}

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
}

function syncCanvasToVideo() {
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  if (!videoWidth || !videoHeight) return;

  canvasElement.width = videoWidth;
  canvasElement.height = videoHeight;

  if (canvasWrapper) {
    canvasWrapper.style.aspectRatio = `${videoWidth} / ${videoHeight}`;
  }

  canvasElement.style.width = "100%";
  canvasElement.style.height = "100%";
}

function startRenderLoop() {
  function render() {
    if (videoElement && canvasContext && videoElement.readyState >= 2) {
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

      if (typeof onFrameCallback === "function") {
        onFrameCallback();
      }
    }

    const id = requestAnimationFrame(render);
    setAnimationFrameId(id);
  }

  render();
}