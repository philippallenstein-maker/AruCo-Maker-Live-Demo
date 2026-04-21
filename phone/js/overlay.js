import {
  AXIS_LENGTH_METERS,
  FOCAL_LENGTH_PX
} from "./config.js";
import {
  getMarkerCenter
} from "./detector.js";
import { state } from "./state.js";

/**
 * Overlay-Modul:
 * - Markerrahmen
 * - ID-Text
 * - Referenzmarker hervorheben
 * - Achsen am Referenzmarker
 * - Infotext oben links
 */

/**
 * Zeichnet alle Marker.
 */
export function drawMarkers(ctx, markers, referenceMarkerId) {
  for (const marker of markers) {
    const corners = marker.corners;
    const isRef = marker.id === referenceMarkerId;

    ctx.strokeStyle = isRef ? "#00ffff" : "#00ff00";
    ctx.lineWidth = isRef ? 5 : 3;

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);

    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }

    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = isRef ? "#00ffff" : "#00ff00";
    ctx.beginPath();
    ctx.arc(corners[0].x, corners[0].y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff0000";
    ctx.font = "20px Arial";
    ctx.fillText(
      isRef ? `REF ID: ${marker.id}` : `ID: ${marker.id}`,
      corners[0].x,
      corners[0].y - 10
    );
  }
}

/**
 * Zeichnet Achsen am Referenzmarker.
 */
export function drawAxes(ctx, canvas, markerPose) {
  if (!markerPose) return;

  const origin = projectPoint(canvas, markerPose.rotation, markerPose.translation, {
    x: 0,
    y: 0,
    z: 0
  });

  const xAxis = projectPoint(canvas, markerPose.rotation, markerPose.translation, {
    x: AXIS_LENGTH_METERS,
    y: 0,
    z: 0
  });

  const yAxis = projectPoint(canvas, markerPose.rotation, markerPose.translation, {
    x: 0,
    y: AXIS_LENGTH_METERS,
    z: 0
  });

  /**
   * Wichtig:
   * Z-Achse umgedreht, damit sie optisch "aus dem Marker heraus"
   * statt zur Kamera hin wirkt.
   */
  const zAxis = projectPoint(canvas, markerPose.rotation, markerPose.translation, {
    x: 0,
    y: 0,
    z: AXIS_LENGTH_METERS
  });

  // X = rot
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(xAxis.x, xAxis.y);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Y = grün
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(yAxis.x, yAxis.y);
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Z = blau
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(zAxis.x, zAxis.y);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 4;
  ctx.stroke();
}

/**
 * Zeichnet die Info links oben.
 */
export function drawInfo(ctx, referenceMarker, distance) {
  ctx.fillStyle = "yellow";
  ctx.font = "20px Arial";

  ctx.fillText(
    `Ref ID: ${referenceMarker ? referenceMarker.id : "-"}`,
    10,
    30
  );

  ctx.fillText(
    `Distanz: ${distance !== null ? distance.toFixed(2) : "-"} m`,
    10,
    60
  );

  if (referenceMarker) {
    const center = getMarkerCenter(referenceMarker);

    ctx.fillText(`Center X: ${center.x.toFixed(0)} px`, 10, 90);
    ctx.fillText(`Center Y: ${center.y.toFixed(0)} px`, 10, 120);
  }

  if (state.positioning) {
    ctx.fillText(
      `Norm X: ${state.positioning.normX !== null ? state.positioning.normX.toFixed(2) : "-"}`,
      10,
      150
    );

    ctx.fillText(
      `Norm Y: ${state.positioning.normY !== null ? state.positioning.normY.toFixed(2) : "-"}`,
      10,
      180
    );
  }

  ctx.fillText(`Focal: ${FOCAL_LENGTH_PX}px`, 10, 210);
  ctx.fillText(`Status: ${state.status}`, 10, 240);
}

/**
 * Projiziert einen 3D-Punkt ins Bild.
 */
function projectPoint(canvas, rotation, translation, point3D) {
  const X =
    rotation[0][0] * point3D.x +
    rotation[0][1] * point3D.y +
    rotation[0][2] * point3D.z +
    translation[0];

  const Y =
    rotation[1][0] * point3D.x +
    rotation[1][1] * point3D.y +
    rotation[1][2] * point3D.z +
    translation[1];

  const Z =
    rotation[2][0] * point3D.x +
    rotation[2][1] * point3D.y +
    rotation[2][2] * point3D.z +
    translation[2];

  const focal = canvas.width;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  return {
    x: cx + (focal * X / Z),
    y: cy - (focal * Y / Z)
  };
}