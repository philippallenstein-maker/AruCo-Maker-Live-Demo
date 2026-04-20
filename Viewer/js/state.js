import { INITIAL_POSE } from "./config.js";

/**
 * Zentraler Zustand des Viewers.
 */

export const state = {
  mode: "test", // "test" | "live"
  autoTestRunning: false,
  ws: null,

  pose: {
    x: INITIAL_POSE.x,
    y: INITIAL_POSE.y,
    z: INITIAL_POSE.z,
    yaw: INITIAL_POSE.yaw,
    pitch: INITIAL_POSE.pitch,
    roll: INITIAL_POSE.roll
  }
};

/**
 * Modus setzen.
 */
export function setMode(mode) {
  state.mode = mode;
}

/**
 * Aktuelle Pose setzen.
 */
export function setPose(newPose) {
  state.pose = {
    ...state.pose,
    ...newPose
  };
}

/**
 * Aktuelle Pose lesen.
 */
export function getPose() {
  return state.pose;
}

/**
 * WebSocket im State speichern.
 */
export function setWebSocket(ws) {
  state.ws = ws;
}

/**
 * Aktuellen WebSocket lesen.
 */
export function getWebSocket() {
  return state.ws;
}

/**
 * Auto-Test an/aus.
 */
export function setAutoTestRunning(value) {
  state.autoTestRunning = value;
}