import { WS_URL } from "./config.js";
import { state, setStatus } from "./state.js";

/**
 * WebSocket-Modul für die Phone-Seite.
 * Aufgabe:
 * - Verbindung zum Server herstellen
 * - Daten senden
 * - Verbindung sauber trennen
 */

let socket = null;

/**
 * Baut die WebSocket-Verbindung auf.
 */
export function connectWebSocket() {
  if (!WS_URL) {
    console.warn("Keine WS_URL gesetzt.");
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("Phone WebSocket verbunden");
    setStatus("Kamera läuft – WebSocket verbunden");
  };

  socket.onerror = (error) => {
    console.error("Phone WebSocket Fehler:", error);
    setStatus("WebSocket-Fehler");
  };

  socket.onclose = () => {
    console.log("Phone WebSocket getrennt");
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
}

/**
 * Sendet aktuelle Tracking-Daten an den Viewer.
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