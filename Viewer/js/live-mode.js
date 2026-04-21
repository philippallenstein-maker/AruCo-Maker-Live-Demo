import { setPose, setWebSocket, getWebSocket } from "./state.js";
import { getUI, setStatus, updateModeUI, updateValueUI } from "./ui.js";

/**
 * Live-Modus:
 * - verbindet den Viewer per WSS
 * - empfängt Tracking-Daten vom Phone
 * - mappt sie testweise auf die Viewer-Pose
 */

export function initLiveMode() {
  const ui = getUI();

  ui.connectLiveBtn.addEventListener("click", connectLive);
  ui.disconnectLiveBtn.addEventListener("click", disconnectLive);
}

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
    console.log("Viewer WebSocket verbunden");
  };

  ws.onerror = (error) => {
    console.error("Viewer WebSocket Fehler:", error);
    setStatus("Live-Fehler");
  };

  ws.onclose = () => {
    updateModeUI("test");
    setStatus("Live getrennt");
    setWebSocket(null);
    console.log("Viewer WebSocket getrennt");
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("Viewer Nachricht:", msg);

      if (msg.type === "tracking" && msg.data) {
        const normX = Number(msg.data.normX) || 0;
        const normY = Number(msg.data.normY) || 0;
        const distance = Number(msg.data.distance) || 1.2;

        /**
         * Erstmal bewusst simples Test-Mapping:
         * - X aus normX
         * - Y aus normY
         * - Z aus Distanz
         *
         * Lokales Marker-KS:
         * - Mitte ungefähr bei x=0.4, y=0.3
         */
        setPose({
          x: 0.4 + normX * 0.4,
          y: 0.3 - normY * 0.3,
          z: distance,
          yaw: 0,
          pitch: 0,
          roll: 0
        });

        updateValueUI();
        setStatus(`Live Tracking – Ref ${msg.data.referenceId ?? "-"}`);
      }
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Live-Daten:", error);
    }
  };
}

function disconnectLive() {
  const ws = getWebSocket();

  if (ws) {
    ws.close();
    setWebSocket(null);
  }

  updateModeUI("test");
  setStatus("Testmodus");
}