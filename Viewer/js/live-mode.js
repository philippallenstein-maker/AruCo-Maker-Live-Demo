import { setPose, setWebSocket, getWebSocket } from "./state.js";
import { getUI, setStatus, updateModeUI, updateValueUI } from "./ui.js";

/**
 * Diese Datei ist nur für den Live-Modus zuständig:
 * - WSS verbinden
 * - Nachrichten empfangen
 * - Pose setzen
 */

export function initLiveMode() {
  const ui = getUI();

  ui.connectLiveBtn.addEventListener("click", connectLive);
  ui.disconnectLiveBtn.addEventListener("click", disconnectLive);
}

/**
 * Startet den Live-Modus.
 */
function connectLive() {
  const ui = getUI();
  const wsUrl = ui.wsUrlInput.value.trim();

  if (!wsUrl) {
    alert("Bitte eine WSS-URL eingeben.");
    return;
  }

  const existingSocket = getWebSocket();
  if (existingSocket) {
    existingSocket.close();
    setWebSocket(null);
  }

  const ws = new WebSocket(wsUrl);
  setWebSocket(ws);

  ws.onopen = () => {
    updateModeUI("live");
    setStatus("Live verbunden");
  };

  ws.onerror = (error) => {
    console.error("Viewer WebSocket Fehler:", error);
    setStatus("Live-Fehler");
  };

  ws.onclose = () => {
    updateModeUI("test");
    setStatus("Live getrennt");
    setWebSocket(null);
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === "pose" && msg.data) {
        setPose({
          x: Number(msg.data.x) || 0,
          y: Number(msg.data.y) || 0,
          z: Number(msg.data.z) || 0,
          yaw: Number(msg.data.yaw) || 0,
          pitch: Number(msg.data.pitch) || 0,
          roll: Number(msg.data.roll) || 0
        });

        updateValueUI();
      }
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Live-Daten:", error);
    }
  };
}

/**
 * Trennt den Live-Modus.
 */
function disconnectLive() {
  const ws = getWebSocket();

  if (ws) {
    ws.close();
    setWebSocket(null);
  }

  updateModeUI("test");
  setStatus("Testmodus");
}