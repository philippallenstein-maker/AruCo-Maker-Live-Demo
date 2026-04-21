import { WS_URL } from "./config.js";
import { setStatus, state } from "./state.js";

let socket = null;
let onConnectionChange = null;

export function setWebSocketStatusCallback(callback) {
  onConnectionChange = callback;
}

export function connectWebSocket() {
  if (!WS_URL) {
    console.warn("Keine WS_URL gesetzt.");
    setStatus("Keine WS-URL gesetzt");
    notify(false);
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("WebSocket bereits verbunden");
    notify(true);
    return;
  }

  console.log("Verbinde WebSocket zu:", WS_URL);

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("Phone WebSocket verbunden");
    setStatus("Kamera läuft – WebSocket verbunden");
    notify(true);
  };

  socket.onerror = (error) => {
    console.error("Phone WebSocket Fehler:", error);
    setStatus("WebSocket-Fehler");
    notify(false);
  };

  socket.onclose = () => {
    console.log("Phone WebSocket getrennt");
    notify(false);
  };
}

export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }

  notify(false);
}

export function sendTrackingData() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const payload = {
    type: "tracking",
    data: {
      referenceId: state.referenceMarkerId,
      distance: state.distance,
      normX: state.positioning?.normX ?? null,
      normY: state.positioning?.normY ?? null,
      centerX: state.positioning?.centerX ?? null,
      centerY: state.positioning?.centerY ?? null,
      ts: Date.now()
    }
  };

  socket.send(JSON.stringify(payload));
}

function notify(isConnected) {
  if (typeof onConnectionChange === "function") {
    onConnectionChange(isConnected);
  }
}