import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const mounts = document.querySelectorAll("[data-vision-3d]");

const axisLength = 4.2;
const axisColor = 0x0b587b;
const dotColor = 0x177392;
const publicationColor = 0xf59f00;
const projectColor = 0x6c63ff;
const highlightRingColor = 0xffd166;

const researchItems = [
  {
    kind: "publication",
    title: "Quality-Preserving Imperceptible Adversarial Attack on Skeleton-based Human Action Recognition",
    href: "#pub-quality-preserving-imperceptible-adversarial-attack-on-skeleton-based-human-action-recognition",
    position: [1.55, 1.15, 3.38],
  },
  {
    kind: "publication",
    title: "ART: Adaptive Relational Transformer for Pedestrian Trajectory Prediction with Temporal-Aware Relations",
    href: "#pub-art-adaptive-relational-transformer-for-pedestrian-trajectory-prediction-with-temporal-aware-relations",
    position: [3.55, 1.25, 2.18],
  },
  {
    kind: "publication",
    title: "Physics-Based Motion Tracking of Contact-Rich Interacting Characters",
    href: "#pub-physics-based-motion-tracking-of-contact-rich-interacting-characters",
    position: [2.35, 2.55, 1.15],
  },
  {
    kind: "publication",
    title: "Motion In-Betweening for Densely Interacting Characters",
    href: "#pub-motion-in-betweening-for-densely-interacting-characters",
    position: [2.55, 2.25, 1.55],
  },
  {
    kind: "publication",
    title: "Large-Scale Multi-Character Interaction Synthesis",
    href: "#pub-large-scale-multi-character-interaction-synthesis",
    position: [3.05, 1.65, 1.05],
  },
  {
    kind: "publication",
    title: "On the Design Fundamentals of Diffusion Models",
    href: "#pub-on-the-design-fundamentals-of-diffusion-models",
    position: [0.92, 0.82, 0.78],
  },
  {
    kind: "publication",
    title: "Real-time and Controllable Reactive Motion Synthesis via Intention Guidance",
    href: "#pub-real-time-and-controllable-reactive-motion-synthesis-via-intention-guidance",
    position: [2.2, 1.62, 3.18],
  },
  {
    kind: "publication",
    title: "Hard No-Box Adversarial Attack on Skeleton-Based Human Action Recognition with Skeleton-Motion-Informed Gradient",
    href: "#pub-hard-no-box-adversarial-attack-on-skeleton-based-human-action-recognition-with-skeleton-motion-informed-gradient",
    position: [1.25, 1.18, 3.62],
  },
  {
    kind: "publication",
    title: "Unifying Human Motion Synthesis and Style Transfer with Denoising Diffusion Probabilistic Models",
    href: "#pub-unifying-human-motion-synthesis-and-style-transfer-with-denoising-diffusion-probabilistic-models",
    position: [1.02, 1.02, 1.15],
  },
  {
    kind: "publication",
    title: "3D Reconstruction of Sculptures from Single Images via Unsupervised Domain Adaptation on Implicit Models",
    href: "#pub-3d-reconstruction-of-sculptures-from-single-images-via-unsupervised-domain-adaptation-on-implicit-models",
    position: [0.72, 0.9, 2.12],
  },
  {
    kind: "publication",
    title: "Denoising Diffusion Probabilistic Models for Styled Walking Synthesis",
    href: "#pub-denoising-diffusion-probabilistic-models-for-styled-walking-synthesis",
    position: [0.82, 0.85, 1.05],
  },
  {
    kind: "project",
    title: "GROWD Fellowship",
    href: "#project-growd",
    position: [3.78, 1.45, 3.7],
  },
  {
    kind: "project",
    title: "SMU-DU Human-Robot Interaction Project",
    href: "#project-smu-du",
    position: [2.68, 2.72, 2.58],
  },
  {
    kind: "project",
    title: "Final Year Project: Styled Walking Synthesis",
    href: "#project-final-year-styled-walking",
    position: [0.92, 0.95, 1.38],
  },
];

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

function makeAxis(direction, length, label, ticks, axisKey, tickRegistry) {
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

    if (tickRegistry) {
      tickRegistry.push({
        axisKey,
        distance,
        dot,
        label: tickLabel,
        baseLabelScale: tickLabel.scale.clone(),
      });
    }
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

function makeResearchMarker(item) {
  const material = new THREE.MeshBasicMaterial({
    color: item.kind === "project" ? projectColor : publicationColor,
    transparent: true,
    opacity: 0.92,
  });
  const marker = item.kind === "project"
    ? new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), material)
    : new THREE.Mesh(new THREE.SphereGeometry(0.105, 28, 16), material);
  marker.position.set(item.position[0], item.position[1], item.position[2]);
  marker.userData = {
    href: item.href,
    title: item.title,
    kind: item.kind,
    interactive: true,
  };
  return marker;
}

function disposeObject(object) {
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
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const child = group.children.pop();
    child.traverse(disposeObject);
  }
}

function makeHighlightRing(position, radius = 0.17) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.68, radius, 36),
    new THREE.MeshBasicMaterial({
      color: highlightRingColor,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
      depthTest: false,
    })
  );
  ring.position.copy(position);
  ring.renderOrder = 12;
  return ring;
}

function makeHighlightFrame(position, scale) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 92;
  const context = canvas.getContext("2d");
  context.strokeStyle = "#ffd166";
  context.lineWidth = 8;
  context.beginPath();
  context.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 28);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const frame = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.98,
      depthTest: false,
    })
  );
  frame.position.copy(position);
  frame.scale.set(scale.x * 1.18, scale.y * 1.72, 1);
  frame.renderOrder = 11;
  return frame;
}

function initVisionScene(mount) {
  if (mount.visionDispose) {
    mount.visionDispose();
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(7.8, 6.4, 8.8);

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
  controls.minDistance = 5.6;
  controls.maxDistance = 12.4;
  controls.target.set(1.7, 1.55, 1.35);
  camera.position.copy(
    new THREE.Vector3(5.9, 4.85, 7.45)
      .normalize()
      .multiplyScalar(controls.maxDistance)
      .add(controls.target)
  );
  controls.update();

  const root = new THREE.Group();
  scene.add(root);
  const interactiveObjects = [];
  const axisTicks = [];
  let highlightedAxisTicks = [];
  const hoverGuide = new THREE.Group();

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

  root.add(makeAxis(new THREE.Vector3(1, 0, 0), axisLength, "Scale", ["Individual", "Interaction", "Crowd"], "x", axisTicks));
  root.add(makeAxis(new THREE.Vector3(0, 1, 0), axisLength, "Realism", ["Kinematics", "Physics", "Embodiment"], "y", axisTicks));
  root.add(makeAxis(new THREE.Vector3(0, 0, 1), axisLength, "Reasoning", ["Generation", "Understanding", "Intervention"], "z", axisTicks));

  researchItems.forEach((item) => {
    const marker = makeResearchMarker(item);
    root.add(marker);
    interactiveObjects.push(marker);
  });

  root.add(hoverGuide);

  const trustworthyLabel = makeTextSprite("Trustworthy", { fontSize: 40, fontWeight: 800, scale: 0.38 });
  trustworthyLabel.position.set(-0.18, 2.15, 2.95);
  root.add(trustworthyLabel);

  const controllableLabel = makeTextSprite("Controllable", { fontSize: 40, fontWeight: 800, scale: 0.38 });
  controllableLabel.position.set(3.2, 3.2, -0.02);
  root.add(controllableLabel);

  const interpretableLabel = makeTextSprite("Interpretable", { fontSize: 40, fontWeight: 800, scale: 0.38 });
  interpretableLabel.position.set(3.0, 0.16, 3.05);
  root.add(interpretableLabel);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pointerStart = new THREE.Vector2();
  let activePointerId = null;
  let hoveredMarker = null;

  function setPointerFromEvent(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function getIntersectedItem(event) {
    setPointerFromEvent(event);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(interactiveObjects, false)[0];
  }

  function openMarkerTarget(marker) {
    if (!marker || !marker.userData.href) {
      return;
    }

    if (window.location.hash === marker.userData.href) {
      window.dispatchEvent(new Event("hashchange"));
    } else {
      window.location.hash = marker.userData.href;
    }
  }

  function resetAxisHighlights() {
    highlightedAxisTicks.forEach((tick) => {
      tick.dot.scale.setScalar(1);
      tick.label.scale.copy(tick.baseLabelScale);
    });
    highlightedAxisTicks = [];
  }

  function getNearestAxisTick(axisKey, value) {
    return axisTicks
      .filter((tick) => tick.axisKey === axisKey)
      .reduce((nearest, tick) => {
        if (!nearest) {
          return tick;
        }

        return Math.abs(tick.distance - value) < Math.abs(nearest.distance - value) ? tick : nearest;
      }, null);
  }

  function updateHoverGuide(marker) {
    if (hoveredMarker === marker) {
      return;
    }

    if (hoveredMarker) {
      hoveredMarker.scale.setScalar(1);
    }

    hoveredMarker = marker;
    clearGroup(hoverGuide);
    resetAxisHighlights();

    if (!marker) {
      return;
    }

    marker.scale.setScalar(1.45);

    const point = marker.position.clone();
    highlightedAxisTicks = [
      getNearestAxisTick("x", point.x),
      getNearestAxisTick("y", point.y),
      getNearestAxisTick("z", point.z),
    ].filter(Boolean);

    highlightedAxisTicks.forEach((tick) => {
      tick.dot.scale.setScalar(1.42);
      tick.label.scale.copy(tick.baseLabelScale).multiplyScalar(1.22);
      hoverGuide.add(makeHighlightRing(tick.dot.position, 0.19));
      hoverGuide.add(makeHighlightFrame(tick.label.position, tick.baseLabelScale));
    });
  }

  function resize() {
    const width = mount.clientWidth || 620;
    const height = mount.clientHeight || 520;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  window.addEventListener("resize", resize);

  renderer.domElement.addEventListener("pointerdown", (event) => {
    activePointerId = event.pointerId;
    pointerStart.set(event.clientX, event.clientY);
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    const hit = getIntersectedItem(event);
    renderer.domElement.style.cursor = hit ? "pointer" : "grab";
    mount.setAttribute("title", hit ? hit.object.userData.title : "Drag to rotate · Scroll to zoom");
    updateHoverGuide(hit ? hit.object : null);
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    activePointerId = null;
    const dragDistance = pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
    if (dragDistance > 5) {
      return;
    }

    const hit = getIntersectedItem(event);
    if (hit) {
      openMarkerTarget(hit.object);
    }
  });

  renderer.domElement.addEventListener("pointerleave", () => {
    renderer.domElement.style.cursor = "grab";
    mount.removeAttribute("title");
    updateHoverGuide(null);
  });

  let frameId = null;

  function animate() {
    controls.update();
    hoverGuide.children.forEach((child) => {
      child.lookAt(camera.position);
    });
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
