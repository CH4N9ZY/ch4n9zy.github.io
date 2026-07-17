import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const mounts = document.querySelectorAll("[data-vision-3d]");

const axisLength = 4.2;
const axisColor = 0x0b587b;
const dotColor = 0x177392;

function isDarkTheme() {
  const explicitTheme = document.documentElement.getAttribute("data-theme");
  if (explicitTheme === "dark") return true;
  if (explicitTheme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function makeTextSprite(text, options = {}) {
  const {
    fontSize = 42,
    fontWeight = 700,
    textColor = isDarkTheme() ? "#f4f4f4" : "#222222",
    backgroundColor = "rgba(255,255,255,0)",
    paddingX = 22,
    paddingY = 12,
    scale = 0.42,
  } = options;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `${fontWeight} ${fontSize}px Georgia, serif`;
  const textWidth = context.measureText(text).width;
  canvas.width = Math.ceil(textWidth + paddingX * 2);
  canvas.height = Math.ceil(fontSize + paddingY * 2);

  context.font = `${fontWeight} ${fontSize}px Georgia, serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = textColor;
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set((canvas.width / canvas.height) * scale, scale, 1);
  return sprite;
}

function makeAxis(direction, length, label, ticks) {
  const group = new THREE.Group();
  const dir = direction.clone().normalize();
  const origin = new THREE.Vector3(0, 0, 0);
  const end = dir.clone().multiplyScalar(length);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([origin, end]);
  const line = new THREE.Line(
    lineGeometry,
    new THREE.LineBasicMaterial({ color: axisColor, linewidth: 2 })
  );
  group.add(line);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.28, 32),
    new THREE.MeshBasicMaterial({ color: axisColor })
  );
  cone.position.copy(dir.clone().multiplyScalar(length + 0.11));
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  group.add(cone);

  const labelSprite = makeTextSprite(label, { fontSize: 54, fontWeight: 700, scale: 0.5 });
  labelSprite.position.copy(dir.clone().multiplyScalar(length + 0.58));
  group.add(labelSprite);

  ticks.forEach((tick, index) => {
    const distance = 1.15 + index * 1.15;
    const tickPosition = dir.clone().multiplyScalar(distance);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 32, 16),
      new THREE.MeshBasicMaterial({ color: dotColor })
    );
    dot.position.copy(tickPosition);
    group.add(dot);

    const tickLabel = makeTextSprite(tick, { fontSize: 34, fontWeight: 500, scale: 0.3 });
    const offset = new THREE.Vector3(0, 0.22, 0);
    if (Math.abs(dir.y) > 0.8) offset.set(-0.48, 0, 0.08);
    if (Math.abs(dir.z) > 0.8) offset.set(-0.2, 0.2, 0.22);
    tickLabel.position.copy(tickPosition.clone().add(offset));
    group.add(tickLabel);
  });

  return group;
}

function makePlane(width, height, color, opacity) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      color,
      opacity,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
}

function initVisionScene(mount) {
  if (mount.visionDispose) {
    mount.visionDispose();
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(5.5, 4.4, 6.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.innerHTML = "";
  mount.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 5.2;
  controls.maxDistance = 10;
  controls.target.set(1.7, 1.55, 1.35);

  const root = new THREE.Group();
  scene.add(root);

  const trustworthyPlane = makePlane(3.7, 3.2, 0xfff1a9, isDarkTheme() ? 0.16 : 0.34);
  trustworthyPlane.position.set(0, 1.72, 1.75);
  trustworthyPlane.rotation.y = Math.PI / 2;
  root.add(trustworthyPlane);

  const controllablePlane = makePlane(4.2, 3.6, 0x8fbee2, isDarkTheme() ? 0.18 : 0.32);
  controllablePlane.position.set(2.1, 1.82, 0);
  root.add(controllablePlane);

  const interpretablePlane = makePlane(4.2, 3.7, 0xe780e5, isDarkTheme() ? 0.18 : 0.28);
  interpretablePlane.position.set(2.1, 0, 1.85);
  interpretablePlane.rotation.x = Math.PI / 2;
  root.add(interpretablePlane);

  root.add(makeAxis(new THREE.Vector3(1, 0, 0), axisLength, "Scale", ["Individual", "Interaction", "Crowd"]));
  root.add(makeAxis(new THREE.Vector3(0, 1, 0), axisLength, "Realism", ["Kinematics", "Physics", "Embodiment"]));
  root.add(makeAxis(new THREE.Vector3(0, 0, 1), axisLength, "Reasoning", ["Generation", "Understanding", "Intervention"]));

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x043361 })
  );
  root.add(core);

  const coreLabel = makeTextSprite("Human Motion Intelligence", {
    fontSize: 30,
    fontWeight: 700,
    textColor: isDarkTheme() ? "#f4f4f4" : "#043361",
    backgroundColor: isDarkTheme() ? "rgba(36,38,49,0.82)" : "rgba(255,255,255,0.82)",
    scale: 0.34,
  });
  coreLabel.position.set(1.38, 0.42, 0.2);
  root.add(coreLabel);

  const trustworthyLabel = makeTextSprite("Trustworthy", { fontSize: 40, fontWeight: 800, scale: 0.38 });
  trustworthyLabel.position.set(-0.18, 2.15, 2.95);
  root.add(trustworthyLabel);

  const controllableLabel = makeTextSprite("Controllable", { fontSize: 40, fontWeight: 800, scale: 0.38 });
  controllableLabel.position.set(3.2, 3.2, -0.02);
  root.add(controllableLabel);

  const interpretableLabel = makeTextSprite("Interpretable", { fontSize: 40, fontWeight: 800, scale: 0.38 });
  interpretableLabel.position.set(3.0, 0.16, 3.05);
  root.add(interpretableLabel);

  function resize() {
    const width = mount.clientWidth || 620;
    const height = mount.clientHeight || 430;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  window.addEventListener("resize", resize);

  let frameId = null;

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  }

  animate();

  mount.visionDispose = function disposeVisionScene() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
    }
    window.removeEventListener("resize", resize);
    resizeObserver.disconnect();
    controls.dispose();
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material.map) {
            material.map.dispose();
          }
          material.dispose();
        });
      }
    });
    renderer.dispose();
  };
}

mounts.forEach(initVisionScene);

const themeObserver = new MutationObserver((mutations) => {
  if (mutations.some((mutation) => mutation.attributeName === "data-theme")) {
    mounts.forEach(initVisionScene);
  }
});

themeObserver.observe(document.documentElement, { attributes: true });
