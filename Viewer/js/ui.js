import { state, getPose, setMode } from "./state.js";

/**
 * Diese Datei kümmert sich nur um das UI:
 * - Werte links aktualisieren
 * - Buttons aktiv/deaktivieren
 * - Status setzen
 * - Testpanel im Live-Modus sperren
 */

let elements = null;

/**
 * Holt alle DOM-Elemente einmal zentral.
 */
export function initUI() {
  elements = {
    xValue: document.getElementById("xValue"),
    yValue: document.getElementById("yValue"),
    zValue: document.getElementById("zValue"),
    yawValue: document.getElementById("yawValue"),
    pitchValue: document.getElementById("pitchValue"),
    rollValue: document.getElementById("rollValue"),
    statusValue: document.getElementById("statusValue"),
    modeValue: document.getElementById("modeValue"),

    wsUrlInput: document.getElementById("wsUrlInput"),
    connectLiveBtn: document.getElementById("connectLiveBtn"),
    disconnectLiveBtn: document.getElementById("disconnectLiveBtn"),
    resetViewBtn: document.getElementById("resetViewBtn"),

    testPanel: document.getElementById("testPanel"),

    btnCenter: document.getElementById("btnCenter"),
    btnTopLeft: document.getElementById("btnTopLeft"),
    btnTopRight: document.getElementById("btnTopRight"),
    btnBottomLeft: document.getElementById("btnBottomLeft"),
    btnBottomRight: document.getElementById("btnBottomRight"),
    btnNear: document.getElementById("btnNear"),
    btnMedium: document.getElementById("btnMedium"),
    btnFar: document.getElementById("btnFar"),
    btnLeft: document.getElementById("btnLeft"),
    btnRight: document.getElementById("btnRight"),
    btnUp: document.getElementById("btnUp"),
    btnDown: document.getElementById("btnDown"),
    btnAutoStart: document.getElementById("btnAutoStart"),
    btnAutoStop: document.getElementById("btnAutoStop")
  };

  refreshUI();
}

/**
 * Gibt alle UI-Elemente zurück.
 */
export function getUI() {
  return elements;
}

/**
 * Setzt einen Status-Text.
 */
export function setStatus(text) {
  if (!elements) return;
  elements.statusValue.textContent = text;
}

/**
 * Setzt den Modus und aktualisiert direkt die Oberfläche.
 */
export function updateModeUI(mode) {
  setMode(mode);
  refreshUI();
}

/**
 * Aktualisiert alle Werte links.
 */
export function updateValueUI() {
  if (!elements) return;

  const pose = getPose();

  elements.xValue.textContent = Number(pose.x).toFixed(2);
  elements.yValue.textContent = Number(pose.y).toFixed(2);
  elements.zValue.textContent = Number(pose.z).toFixed(2);
  elements.yawValue.textContent = Number(pose.yaw).toFixed(2);
  elements.pitchValue.textContent = Number(pose.pitch).toFixed(2);
  elements.rollValue.textContent = Number(pose.roll).toFixed(2);
}

/**
 * Aktiviert / deaktiviert Test-Buttons abhängig vom Modus.
 */
export function refreshUI() {
  if (!elements) return;

  elements.modeValue.textContent = state.mode === "live" ? "Live" : "Test";

  const liveActive = state.mode === "live";

  const testButtons = [
    elements.btnCenter,
    elements.btnTopLeft,
    elements.btnTopRight,
    elements.btnBottomLeft,
    elements.btnBottomRight,
    elements.btnNear,
    elements.btnMedium,
    elements.btnFar,
    elements.btnLeft,
    elements.btnRight,
    elements.btnUp,
    elements.btnDown,
    elements.btnAutoStart,
    elements.btnAutoStop
  ];

  testButtons.forEach(button => {
    button.disabled = liveActive;
  });

  elements.connectLiveBtn.disabled = liveActive;
  elements.disconnectLiveBtn.disabled = !liveActive;
  elements.wsUrlInput.disabled = liveActive;

  elements.testPanel.open = !liveActive;

  updateValueUI();
}