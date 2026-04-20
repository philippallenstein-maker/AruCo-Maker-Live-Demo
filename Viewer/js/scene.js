import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  ROOM,
  WALL,
  VIEW_CAMERA,
  MARKER_LOCAL,
  MARKER_SIZE,
  FLOOR_Y_LOCAL,
  FLOOR_Y_GLOBAL,
  localToGlobal,
  poseLocalToGlobal,
  localYToGlobalY
} from "./config.js";
import { getPose } from "./state.js";

/**
 * Diese Datei baut die komplette 3D-Szene auf.
 *
 * Wichtige Logik:
 * - Lokal ist ID2 = (0,0,0)
 * - Marker werden lokal definiert
 * - für die Darstellung werden sie global verschoben
 *
 * Die Szene selbst kennt keine Live-Logik und keine Testlogik.
 * Sie kennt nur:
 * - aktuelle Pose lesen
 * - Raum zeichnen
 * - Marker zeichnen
 * - Kameraobjekt platzieren
 */

let scene;
let camera;
let renderer;
let controls;

let sceneContainer;

let phoneGroup;
let distanceLine = null;

/**
 * Initialisiert die komplette Szene.
 */
export function initScene(containerElement) {
  sceneContainer = containerElement;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);

  camera = new THREE.PerspectiveCamera(
    50,
    sceneContainer.clientWidth / sceneContainer.clientHeight,
    0.1,
    100
  );

  camera.position.set(
    VIEW_CAMERA.position.x,
    VIEW_CAMERA.position.y,
    VIEW_CAMERA.position.z
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  sceneContainer.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(
    VIEW_CAMERA.target.x,
    VIEW_CAMERA.target.y,
    VIEW_CAMERA.target.z
  );
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.02;
  controls.minDistance = 2.5;
  controls.maxDistance = 12;

  addLights();
  addRoom();
  addWall();
  addFloor();
  addMarkers();
  addOriginAxes();
  addPhoneObject();

  updatePhonePose();

  window.addEventListener("resize", handleResize);
}

/**
 * Setzt die Viewer-Kamera auf die Startansicht zurück.
 */
export function resetViewCamera() {
  camera.position.set(
    VIEW_CAMERA.position.x,
    VIEW_CAMERA.position.y,
    VIEW_CAMERA.position.z
  );

  controls.target.set(
    VIEW_CAMERA.target.x,
    VIEW_CAMERA.target.y,
    VIEW_CAMERA.target.z
  );

  controls.update();
}

/**
 * Startet die Render-Schleife.
 */
export function startSceneLoop() {
  function animate() {
    requestAnimationFrame(animate);

    controls.update();
    updatePhonePose();
    renderer.render(scene, camera);
  }

  animate();
}

/**
 * Aktualisiert die Darstellung des Kameraobjekts anhand der State-Pose.
 */
export function updatePhonePose() {
  const localPose = getPose();
  const globalPose = poseLocalToGlobal(localPose);

  const clampedX = THREE.MathUtils.clamp(globalPose.x, 0.0, ROOM.width);
  const clampedY = THREE.MathUtils.clamp(globalPose.y, FLOOR_Y_GLOBAL, ROOM.height);
  const clampedZ = THREE.MathUtils.clamp(globalPose.z, 0.0, ROOM.depth);

  phoneGroup.position.set(clampedX, clampedY, clampedZ);

  phoneGroup.rotation.order = "YXZ";
  phoneGroup.rotation.y = globalPose.yaw;
  phoneGroup.rotation.x = globalPose.pitch;
  phoneGroup.rotation.z = globalPose.roll;

  updateDistanceLine(clampedX, clampedY, clampedZ);
}

/**
 * Fügt Grundbeleuchtung hinzu.
 */
function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 4);
  scene.add(directionalLight);
}

/**
 * Baut den Raum als Drahtbox.
 */
function addRoom() {
  const roomGeometry = new THREE.BoxGeometry(
  ROOM.width,
  ROOM.height - FLOOR_Y_GLOBAL,
  ROOM.depth
);
  const roomEdges = new THREE.EdgesGeometry(roomGeometry);

  const roomLine = new THREE.LineSegments(
    roomEdges,
    new THREE.LineBasicMaterial({ color: 0x444444 })
  );

  /**
   * Wichtig:
   * Der Raum startet global nicht bei y=0, sondern bei FLOOR_Y.
   * Daher wird seine Mitte entsprechend nach oben verschoben.
   */
  const roomCenterY = FLOOR_Y_GLOBAL + (ROOM.height - FLOOR_Y_GLOBAL) / 2;

  roomLine.position.set(
    ROOM.width / 2,
    roomCenterY,
    ROOM.depth / 2
  );

  scene.add(roomLine);
}

/**
 * Baut den Boden.
 * Der Boden liegt global bei Y = FLOOR_Y.
 */
function addFloor() {
  const floorGeometry = new THREE.PlaneGeometry(ROOM.width, ROOM.depth);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a5b20,
    side: THREE.DoubleSide
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(ROOM.width / 2, FLOOR_Y_GLOBAL, ROOM.depth / 2);

  scene.add(floor);
}

/**
 * Baut die Rückwand.
 * Die Wand liegt global bei Z = WALL.z
 */
function addWall() {
  const wallHeight = ROOM.height - FLOOR_Y_GLOBAL;

  const wallGeometry = new THREE.PlaneGeometry(ROOM.width, wallHeight);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xd0d0d0,
    side: THREE.DoubleSide
  });

  const wall = new THREE.Mesh(wallGeometry, wallMaterial);

  const wallCenterY = FLOOR_Y_GLOBAL + wallHeight / 2;

  wall.position.set(
    ROOM.width / 2,
    wallCenterY,
    WALL.z
  );

  scene.add(wall);
}

/**
 * Baut die Marker an der Wand.
 *
 * Marker sind lokal definiert:
 * - ID2 = Ursprung
 * - dann per localToGlobal(...) auf die Wand gesetzt
 */
function addMarkers() {
  for (const [id, localPos] of Object.entries(MARKER_LOCAL)) {
    const globalPos = localToGlobal(localPos);
    const marker = createMarker(`ID ${id}`);

    marker.position.set(globalPos.x, globalPos.y, globalPos.z + 0.01);
    scene.add(marker);
  }
}

/**
 * Fügt die Achsenhilfe direkt am lokalen Ursprung ID2 ein.
 */
function addOriginAxes() {
  const originGlobal = localToGlobal({ x: 0, y: 0, z: 0 });

  const axesHelper = new THREE.AxesHelper(0.6);
  axesHelper.position.set(originGlobal.x, originGlobal.y, originGlobal.z + 0.08);
  scene.add(axesHelper);
}

/**
 * Baut das Kamera-/iPhone-Objekt.
 */
function addPhoneObject() {
  phoneGroup = new THREE.Group();

  const phoneBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.09, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x1f6feb })
  );
  phoneGroup.add(phoneBody);

  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 0, 0),
    0.35,
    0x1f6feb,
    0.10,
    0.05
  );
  phoneGroup.add(arrow);

  scene.add(phoneGroup);
}

/**
 * Zeichnet eine Distanzlinie von der Kameraposition zur Wand.
 */
function updateDistanceLine(x, y, z) {
  if (distanceLine) {
    scene.remove(distanceLine);
    distanceLine.geometry.dispose();
    distanceLine.material.dispose();
  }

  const points = [
    new THREE.Vector3(x, y, WALL.z),
    new THREE.Vector3(x, y, z)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x1f6feb });

  distanceLine = new THREE.Line(geometry, material);
  scene.add(distanceLine);
}

/**
 * Erstellt einen einzelnen Marker als schwarzes Quadrat mit Label.
 */
function createMarker(label) {
  const group = new THREE.Group();

  const outer = new THREE.Mesh(
    new THREE.PlaneGeometry(MARKER_SIZE, MARKER_SIZE),
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      side: THREE.DoubleSide
    })
  );
  group.add(outer);

  const inner = new THREE.Mesh(
    new THREE.PlaneGeometry(MARKER_SIZE * 0.45, MARKER_SIZE * 0.45),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    })
  );
  inner.position.z = 0.001;
  group.add(inner);

  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 256;
  labelCanvas.height = 64;

  const lctx = labelCanvas.getContext("2d");
  lctx.fillStyle = "black";
  lctx.font = "28px Arial";
  lctx.fillText(label, 10, 40);

  const texture = new THREE.CanvasTexture(labelCanvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.28, 0.07, 1);
  sprite.position.set(0, 0.11, 0.01);

  group.add(sprite);

  return group;
}

/**
 * Reagiert auf Größenänderungen.
 */
function handleResize() {
  const width = sceneContainer.clientWidth;
  const height = sceneContainer.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}