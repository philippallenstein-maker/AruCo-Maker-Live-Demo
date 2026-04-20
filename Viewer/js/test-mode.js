import { setPose, state, setAutoTestRunning } from "./state.js";
import { getUI, setStatus } from "./ui.js";

/**
 * Diese Datei enthält ausschließlich die Testlogik:
 * - feste Testpositionen
 * - Auto-Test
 *
 * Wichtig:
 * Alles arbeitet im lokalen Marker-Koordinatensystem:
 * - ID2 = (0,0,0)
 * - ID3 = (0.8,0,0)
 * - ID0 = (0,0.6,0)
 * - ID1 = (0.8,0.6,0)
 */

let autoT = 0;

/**
 * Registriert alle Test-Buttons.
 */
export function initTestMode() {
  const ui = getUI();

  ui.btnCenter.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ x: 0.4, y: 0.3, z: 1.2, yaw: 0, pitch: 0, roll: 0 });
    setStatus("Test: Mitte");
  });

  ui.btnTopLeft.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ x: 0.0, y: 0.6, z: 1.2 });
    setStatus("Test: Oben links (ID0)");
  });

  ui.btnTopRight.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ x: 0.8, y: 0.6, z: 1.2 });
    setStatus("Test: Oben rechts (ID1)");
  });

  ui.btnBottomLeft.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ x: 0.0, y: 0.0, z: 1.2 });
    setStatus("Test: Unten links (ID2)");
  });

  ui.btnBottomRight.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ x: 0.8, y: 0.0, z: 1.2 });
    setStatus("Test: Unten rechts (ID3)");
  });

  ui.btnNear.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ z: 0.5 });
    setStatus("Test: Nah");
  });

  ui.btnMedium.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ z: 1.2 });
    setStatus("Test: Mittel");
  });

  ui.btnFar.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ z: 2.2 });
    setStatus("Test: Weit");
  });

  ui.btnLeft.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ x: 0.0 });
    setStatus("Test: Links");
  });

  ui.btnRight.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ x: 0.8 });
    setStatus("Test: Rechts");
  });

  ui.btnUp.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ y: 0.8 });
    setStatus("Test: Hoch");
  });

  ui.btnDown.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setPose({ y: 0.0 });
    setStatus("Test: Runter");
  });

  ui.btnAutoStart.addEventListener("click", () => {
    if (state.mode !== "test") return;
    setAutoTestRunning(true);
    setStatus("Auto-Test läuft");
  });

  ui.btnAutoStop.addEventListener("click", () => {
    setAutoTestRunning(false);
    if (state.mode === "test") {
      setStatus("Testmodus");
    }
  });
}

/**
 * Wird in der Haupt-Animationsschleife aufgerufen.
 */
export function updateAutoTest() {
  if (!state.autoTestRunning || state.mode !== "test") return;

  autoT += 0.01;

  setPose({
    x: 0.4 + Math.cos(autoT) * 0.35,
    y: 0.3 + Math.sin(autoT * 0.7) * 0.20,
    z: 1.4 + Math.sin(autoT * 1.2) * 0.9,
    yaw: Math.sin(autoT * 0.8) * 0.4,
    pitch: 0,
    roll: 0
  });
}