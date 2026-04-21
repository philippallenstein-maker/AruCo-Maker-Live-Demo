import { state, setStatus } from "./state.js";
import {
  initCamera,
  startCamera,
  stopCamera,
  setOnFrameCallback,
  getCanvasContext,
  getCanvasElement
} from "./camera.js";
import {
  ensureDetector,
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
import {
  smoothMarker,
  smoothDistance,
  resetTracking
} from "./tracking.js";

let elements = null;
let lastMarkers = [];
let lastReferenceMarker = null;
let lastReferencePose = null;

init();

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

  setOnFrameCallback(handleFrame);

  bindEvents();
  updateStatusUI();
  updateTrackingUI();
}

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
    resetTracking();
    updateStatusUI();
    updateTrackingUI();
  });
}

function handleFrame() {
  const ctx = getCanvasContext();
  const canvas = getCanvasElement();

  if (!ctx || !canvas) return;

  // Debug-Anzeige
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Loop aktiv", 10, canvas.height - 20);

  try {
    ensureDetector(canvas.width);

    if (shouldRunDetection()) {
      const markers = detectMarkers(ctx, canvas);

      let referenceMarker = chooseReferenceMarker(markers);
      referenceMarker = smoothMarker(referenceMarker);

      let referencePose = null;
      let rawDistance = null;

      if (referenceMarker) {
        referencePose = estimateMarkerPose(referenceMarker, canvas);

        rawDistance = estimateDistanceFromMarker(
          referenceMarker,
          FOCAL_LENGTH_PX,
          0.2,
          5.0
        );

        smoothDistance(rawDistance);
      } else {
        resetTracking();
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
  } catch (error) {
    console.error("Fehler in handleFrame():", error);
    setStatus("Erkennungsfehler");
    updateStatusUI();
  }

  drawMarkers(ctx, lastMarkers, state.referenceMarkerId);

  if (lastReferencePose) {
    drawAxes(ctx, canvas, lastReferencePose);
  }

  drawInfo(ctx, lastReferenceMarker, state.distance);
}

export function updateStatusUI() {
  if (!elements) return;
  elements.statusValue.textContent = state.status;
}

export function updateTrackingUI() {
  if (!elements) return;

  elements.referenceIdValue.textContent =
    state.referenceMarkerId !== null ? state.referenceMarkerId : "-";

  elements.distanceValue.textContent =
    state.distance !== null ? Number(state.distance).toFixed(2) : "-";
}