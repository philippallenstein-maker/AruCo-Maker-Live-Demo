import { initUI, getUI, setStatus, updateValueUI } from "./ui.js";
import { initScene, startSceneLoop, resetViewCamera } from "./scene.js";
import { initTestMode, updateAutoTest } from "./test-mode.js";
import { initLiveMode } from "./live-mode.js";

/**
 * Einstiegspunkt des Viewers.
 * Diese Datei verbindet alles miteinander.
 */

init();

/**
 * Startet den kompletten Viewer.
 */
function init() {
  initUI();

  const ui = getUI();
  const sceneContainer = document.getElementById("scene3d");

  initScene(sceneContainer);
  initTestMode();
  initLiveMode();
  startSceneLoop();
  startAppLoop();

  ui.resetViewBtn.addEventListener("click", () => {
    resetViewCamera();
    setStatus("Ansicht zurückgesetzt");
  });

  setStatus("Testmodus bereit");
  updateValueUI();
}

/**
 * Kleine zusätzliche App-Schleife:
 * aktuell nur für den Auto-Test und UI-Aktualisierung.
 */
function startAppLoop() {
  function loop() {
    requestAnimationFrame(loop);

    updateAutoTest();
    updateValueUI();
  }

  loop();
}