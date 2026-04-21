import { WS_URL } from "./config.js";
import { state, setStatus, setWsConnected } from "./state.js";
import { updateStatusUI } from "./main.js";

let socket = null;

/**
 * Baut die WebSocket-Verbindung auf.
 */
export function connectWebSocket() {
  if (!WS_URL) {
    console.warn("Keine WS_URL gesetzt.");
    setStatus("Keine WS-URL gesetzt");
    setWsConnected(false);
    updateStatusUI();
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("Phone WebSocket bereits verbunden");
    return;
  }

  console.log("Phone versucht WebSocket-Verbindung zu:", WS_URL);

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("Phone WebSocket verbunden");
    setWsConnected(true);
    setStatus("Kamera läuft – WebSocket verbunden");
    updateStatusUI();
  };

  socket.onerror = (error) => {
    console.error("Phone WebSocket Fehler:", error);
    setWsConnected(false);
    setStatus("WebSocket-Fehler");
    updateStatusUI();
  };

  socket.onclose = () => {
    console.log("Phone WebSocket getrennt");
    setWsConnected(false);
    updateStatusUI();
  };
}

/**
 * Trennt die WebSocket-Verbindung.
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }

  setWsConnected(false);
  updateStatusUI();
}

/**
 * Sendet Tracking-Daten an den Viewer.
 */
export function sendTrackingData() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const payload = {
    type: "pose",
    data: {
      referenceId: state.referenceMarkerId,
      distance: state.distance,
      normX: state.positioning?.normX ?? null,
      normY: state.positioning?.normY ?? null,
      centerX: state.positioning?.centerX ?? null,
      centerY: state.positioning?.centerY ?? null
    }
  };

  socket.send(JSON.stringify(payload));
}