import { setPose, setWebSocket, getWebSocket } from "./state.js";
import { getUI, setStatus, updateModeUI, updateValueUI } from "./ui.js";

/**
 * Lokale Markeranker:
 * ID2 = (0.0, 0.0)
 * ID3 = (0.8, 0.0)
 * ID0 = (0.0, 0.6)
 * ID1 = (0.8, 0.6)
 */
const MARKER_ANCHORS = {
  2: { x: 0.0, y: 0.0 },
  3: { x: 0.8, y: 0.0 },
  0: { x: 0.0, y: 0.6 },
  1: { x: 0.8, y: 0.6 }
};

// Wie stark normX/normY um den Referenzmarker herum wirken
const OFFSET_GAIN_X = 0.35;
const OFFSET_GAIN_Y = 0.25;

// letzte empfangene Nachricht
let lastMessageTs = 0;

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

      if (msg.type !== "tracking" || !msg.data) {
        return;
      }

      lastMessageTs = Date.now();

      const referenceId = Number(msg.data.referenceId);
      const anchor = MARKER_ANCHORS[referenceId];

      if (!anchor) {
        return;
      }

      const normX = Number(msg.data.normX) || 0;
      const normY = Number(msg.data.normY) || 0;
      const distance = Number(msg.data.distance) || 1.2;

      /**
       * WICHTIG:
       * Jetzt wird NICHT mehr von der Mitte des Rechtecks ausgegangen,
       * sondern vom Anker des Referenzmarkers.
       */
      const x = anchor.x + normX * OFFSET_GAIN_X;
      const y = anchor.y + normY * OFFSET_GAIN_Y;
      const z = distance;

      setPose({
        x,
        y,
        z,
        yaw: 0,
        pitch: 0,
        roll: 0
      });

      updateValueUI();
      setStatus(`Live Tracking – Ref ${referenceId}`);
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Live-Daten:", error);
    }
  };

  // optional: einfacher "stale data" checker
  setInterval(() => {
    if (getWebSocket() === ws && ws.readyState === WebSocket.OPEN) {
      if (lastMessageTs && Date.now() - lastMessageTs > 1500) {
        setStatus("Live verbunden – keine neuen Daten");
      }
    }
  }, 500);
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