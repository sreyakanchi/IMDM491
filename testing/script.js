// ─── Cursor ─────────────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// ─── Scene Setup ────────────────────────────────────────────────────────────
const W = window.innerWidth, H = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0604, 0.055);

const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100);
camera.position.set(0, 3.5, 9);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.55;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ─── Lights ─────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x1a1008, 1.2);
scene.add(ambientLight);

// Candle-like warm point light inside box
const innerLight = new THREE.PointLight(0xd4820a, 2.5, 6);
innerLight.position.set(0, 1.2, 0);
innerLight.castShadow = true;
scene.add(innerLight);

// Eerie green-tinted rim light
const rimLight = new THREE.DirectionalLight(0x3a5c2a, 0.5);
rimLight.position.set(-4, 5, -4);
scene.add(rimLight);

// Moonlight blue from above
const moonLight = new THREE.DirectionalLight(0x1a2a40, 0.8);
moonLight.position.set(2, 8, 2);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(1024, 1024);
scene.add(moonLight);

// ─── Materials ──────────────────────────────────────────────────────────────
const woodMat = new THREE.MeshStandardMaterial({
  color: 0x3d2010,
  roughness: 0.85,
  metalness: 0.05,
});
const darkWoodMat = new THREE.MeshStandardMaterial({
  color: 0x1e0f06,
  roughness: 0.9,
  metalness: 0.02,
});
const brassMat = new THREE.MeshStandardMaterial({
  color: 0x7a5c20,
  roughness: 0.35,
  metalness: 0.9,
  emissive: 0x2a1a00,
  emissiveIntensity: 0.3,
});
const velvetMat = new THREE.MeshStandardMaterial({
  color: 0x1a0a0a,
  roughness: 1,
  metalness: 0,
});
const mirrorMat = new THREE.MeshStandardMaterial({
  color: 0x8899aa,
  roughness: 0.15,
  metalness: 0.95,
  envMapIntensity: 1,
});

// ─── Geometry Helpers ────────────────────────────────────────────────────────
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ─── Music Box Group ─────────────────────────────────────────────────────────
const boxGroup = new THREE.Group();
scene.add(boxGroup);

// Base
const base = box(4, 0.22, 3, darkWoodMat, 0, 0, 0);
boxGroup.add(base);

// Walls
const wallFront = box(4, 1.5, 0.12, woodMat, 0, 0.75 + 0.11, 1.5);
const wallBack  = box(4, 1.5, 0.12, woodMat, 0, 0.75 + 0.11, -1.5);
const wallLeft  = box(0.12, 1.5, 3, woodMat, -2, 0.75 + 0.11, 0);
const wallRight = box(0.12, 1.5, 3, woodMat,  2, 0.75 + 0.11, 0);
[wallFront, wallBack, wallLeft, wallRight].forEach(w => boxGroup.add(w));

// Floor inside
const innerFloor = box(3.76, 0.06, 2.76, velvetMat, 0, 0.14, 0);
boxGroup.add(innerFloor);

// Brass corner inlays
const corners = [[-1.9, 0.14, 1.4], [1.9, 0.14, 1.4], [-1.9, 0.14, -1.4], [1.9, 0.14, -1.4]];
corners.forEach(([x, y, z]) => {
  const b = box(0.15, 0.12, 0.15, brassMat, x, y, z);
  boxGroup.add(b);
});

// Brass trim strips on top edge of walls
const trimPositions = [
  [0,  1.62,  1.5, 4, 0.06, 0.12],
  [0,  1.62, -1.5, 4, 0.06, 0.12],
  [-2, 1.62,  0,   0.12, 0.06, 3],
  [ 2, 1.62,  0,   0.12, 0.06, 3],
];
trimPositions.forEach(([x, y, z, w, h, d]) => {
  const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brassMat);
  t.position.set(x, y, z);
  boxGroup.add(t);
});

// ─── Lid ─────────────────────────────────────────────────────────────────────
const lidGroup = new THREE.Group();
lidGroup.position.set(0, 1.65, -1.5); // hinge at back wall top
boxGroup.add(lidGroup);

const lidPanel = box(4, 0.1, 3, woodMat, 0, 0, 1.5);
lidGroup.add(lidPanel);

// Lid interior mirror-like panel (eerie)
const lidMirror = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), mirrorMat);
lidMirror.rotation.x = Math.PI / 2;
lidMirror.position.set(0, -0.06, 1.5);
lidGroup.add(lidMirror);

// Lid brass trim
const lidTrim = new THREE.Mesh(new THREE.BoxGeometry(4, 0.08, 3.04), brassMat);
lidTrim.position.set(0, 0.06, 1.5);
lidGroup.add(lidTrim);

// Lid handle
const handle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 24), brassMat);
handle.position.set(0, 0.12, 1.5);
handle.rotation.x = Math.PI / 2;
lidGroup.add(handle);

// ─── Ballerina ───────────────────────────────────────────────────────────────
const dancerGroup = new THREE.Group();
dancerGroup.position.set(0, 0.22, 0.2);
boxGroup.add(dancerGroup);

const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a0d0d, roughness: 0.8 });

// Body
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.5, 8), bodyMat);
body.position.y = 0.5;
dancerGroup.add(body);

// Head
const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), bodyMat);
head.position.y = 0.92;
dancerGroup.add(head);

// Skirt (cone)
const skirt = new THREE.Mesh(
  new THREE.ConeGeometry(0.32, 0.45, 12),
  new THREE.MeshStandardMaterial({ color: 0x0d0505, roughness: 0.9, side: THREE.DoubleSide })
);
skirt.position.y = 0.32;
dancerGroup.add(skirt);

// Arms
const armMat = new THREE.MeshStandardMaterial({ color: 0x1a0d0d, roughness: 0.9 });
[-1, 1].forEach(side => {
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.38, 6), armMat);
  arm.position.set(side * 0.18, 0.72, 0);
  arm.rotation.z = side * -0.6;
  dancerGroup.add(arm);
});

// Raised leg
const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.32, 6), armMat);
leg.position.set(0.15, 0.12, 0.1);
leg.rotation.z = -0.4;
leg.rotation.x = 0.3;
dancerGroup.add(leg);

// Platform disc
const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(0.28, 0.3, 0.06, 24),
  new THREE.MeshStandardMaterial({ color: 0x7a5c20, roughness: 0.3, metalness: 0.9 })
);
platform.position.y = 0.05;
dancerGroup.add(platform);

// Spindle
const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), brassMat);
spindle.position.y = 0.17;
dancerGroup.add(spindle);

// ─── Music Cylinder (comb mechanism) ─────────────────────────────────────────
const cylinderMechGroup = new THREE.Group();
cylinderMechGroup.position.set(-0.9, 0.3, -0.5);
boxGroup.add(cylinderMechGroup);

const drumMat = new THREE.MeshStandardMaterial({ color: 0x8a7030, roughness: 0.4, metalness: 0.8 });
const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.8, 32), drumMat);
drum.rotation.z = Math.PI / 2;
cylinderMechGroup.add(drum);

// Pins on drum
for (let i = 0; i < 30; i++) {
  const angle = (i / 30) * Math.PI * 2;
  const along = (Math.random() - 0.5) * 0.7;
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), brassMat);
  pin.position.set(along, Math.sin(angle) * 0.225, Math.cos(angle) * 0.225);
  cylinderMechGroup.add(pin);
}

// Comb tines
for (let i = 0; i < 14; i++) {
  const tine = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.02, 0.35 + i * 0.018),
    new THREE.MeshStandardMaterial({ color: 0xc0aa60, roughness: 0.2, metalness: 1.0 })
  );
  tine.position.set((i - 6.5) * 0.042, 0.28, 0.15);
  boxGroup.add(tine);
}

// ─── Winding Key ─────────────────────────────────────────────────────────────
const keyGroup = new THREE.Group();
keyGroup.position.set(2, 0.5, 0.4);
keyGroup.rotation.z = Math.PI / 2;
boxGroup.add(keyGroup);

const keyStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8), brassMat);
keyGroup.add(keyStem);

const keyLoop = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 20), brassMat);
keyLoop.position.y = 0.35;
keyGroup.add(keyLoop);

// ─── Particles / Spores ──────────────────────────────────────────────────────
const particleCount = 280;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const particleSpeeds = new Float32Array(particleCount);
const particleOffsets = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 14;
  positions[i * 3 + 1] = Math.random() * 8 - 1;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  particleSpeeds[i]  = 0.003 + Math.random() * 0.008;
  particleOffsets[i] = Math.random() * Math.PI * 2;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMat = new THREE.PointsMaterial({
  color: 0x88aa44,
  size: 0.035,
  transparent: true,
  opacity: 0.55,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ─── Ground / Root System ─────────────────────────────────────────────────────
const groundMat = new THREE.MeshStandardMaterial({ color: 0x0d0804, roughness: 1, metalness: 0 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

function addRoot(x, z, rot, len) {
  const rootMat = new THREE.MeshStandardMaterial({ color: 0x1a0e05, roughness: 1 });
  const root = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.01, len, 5), rootMat);
  root.position.set(x, -0.06, z);
  root.rotation.x = 1.3;
  root.rotation.z = rot;
  root.castShadow = true;
  scene.add(root);
}
for (let i = 0; i < 18; i++) {
  const angle = (i / 18) * Math.PI * 2;
  const d = 2.2 + Math.random() * 1.5;
  addRoot(Math.cos(angle) * d, Math.sin(angle) * d, angle, 0.6 + Math.random() * 0.8);
}

// ─── Background Trees (silhouettes) ──────────────────────────────────────────
const treeMat = new THREE.MeshStandardMaterial({ color: 0x070503, roughness: 1 });
for (let i = 0; i < 22; i++) {
  const angle = (i / 22) * Math.PI * 2;
  const dist = 10 + Math.random() * 6;
  const h = 4 + Math.random() * 6;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, h, 6), treeMat);
  trunk.position.set(Math.cos(angle) * dist, h / 2 - 0.12, Math.sin(angle) * dist);
  scene.add(trunk);

  for (let b = 0; b < 4; b++) {
    const bLen = 0.8 + Math.random() * 1.4;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, bLen, 5), treeMat);
    const by = h * 0.4 + b * (h * 0.15) + Math.random() * 0.4;
    const ba = Math.random() * Math.PI * 2;
    branch.position.set(
      Math.cos(angle) * dist + Math.cos(ba) * bLen * 0.5,
      by,
      Math.sin(angle) * dist + Math.sin(ba) * bLen * 0.5
    );
    branch.rotation.z = Math.PI / 2 - 0.4;
    branch.rotation.y = ba;
    scene.add(branch);
  }
}

// ─── Will-o-wisp Lights ──────────────────────────────────────────────────────
const wisps = [];
const wispColors = [0x2a5c1a, 0x1a3a2a, 0x4a3a10, 0x1a2a10];
for (let i = 0; i < 5; i++) {
  const wisp = new THREE.PointLight(wispColors[i % wispColors.length], 0.8, 5);
  const angle = (i / 5) * Math.PI * 2;
  wisp.position.set(Math.cos(angle) * 5, 1.5, Math.sin(angle) * 5);
  wisp._angle = angle;
  wisp._radius = 4 + Math.random() * 3;
  wisp._speed = 0.0015 + Math.random() * 0.001;
  wisp._heightOffset = Math.random() * Math.PI * 2;
  scene.add(wisp);
  wisps.push(wisp);
}

// ─── State ────────────────────────────────────────────────────────────────────
let lidOpen = false;
let lidAngle = 0;
let targetLidAngle = 0;
let windPower = 0;
let dancerAngle = 0;
let drumAngle = 0;
let keyWindAngle = 0;

const toggleBtn = document.getElementById('toggleBtn');
const windBtn = document.getElementById('windBtn');

toggleBtn.addEventListener('click', () => {
  lidOpen = !lidOpen;
  targetLidAngle = lidOpen ? -Math.PI * 0.75 : 0;
  toggleBtn.textContent = lidOpen ? 'Close Lid' : 'Open Lid';
});

windBtn.addEventListener('click', () => {
  windPower = Math.min(windPower + 0.4, 1.5);
});

// Mouse parallax
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── Animation Loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let t = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  t += delta;

  // Wind down
  windPower = Math.max(0, windPower - delta * 0.04);

  // Lid animation
  lidAngle += (targetLidAngle - lidAngle) * 0.04;
  lidGroup.rotation.x = lidAngle;

  // Dancer spins with wind power
  const spinSpeed = windPower * 2.5;
  dancerAngle += spinSpeed * delta;
  dancerGroup.rotation.y = dancerAngle;
  dancerGroup.position.y = 0.22 + Math.sin(t * 2.2) * 0.01 * windPower;

  // Drum and key rotate
  drumAngle += spinSpeed * 0.5 * delta;
  drum.rotation.y = drumAngle;

  keyWindAngle += spinSpeed * 0.8 * delta;
  keyGroup.rotation.y = keyWindAngle;

  // Flicker inner light
  innerLight.intensity = (lidOpen ? 1 : 0.3) * (2.0 + Math.sin(t * 7.3) * 0.4 + Math.sin(t * 13.1) * 0.2);
  innerLight.color.setHSL(0.08 + Math.sin(t * 0.5) * 0.02, 0.9, 0.45);

  // Will-o-wisps drift
  wisps.forEach((wisp, i) => {
    wisp._angle += wisp._speed;
    wisp.position.x = Math.cos(wisp._angle) * wisp._radius;
    wisp.position.z = Math.sin(wisp._angle) * wisp._radius;
    wisp.position.y = 1.2 + Math.sin(t * 0.7 + wisp._heightOffset) * 0.8;
    wisp.intensity = 0.5 + Math.sin(t * 2.1 + i) * 0.4;
  });

  // Particles drift upward
  const pos = particleGeo.attributes.position;
  for (let i = 0; i < particleCount; i++) {
    pos.array[i * 3 + 1] += particleSpeeds[i];
    pos.array[i * 3]     += Math.sin(t * 0.3 + particleOffsets[i]) * 0.003;
    if (pos.array[i * 3 + 1] > 7) {
      pos.array[i * 3 + 1] = -1;
      pos.array[i * 3]     = (Math.random() - 0.5) * 14;
      pos.array[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
  }
  pos.needsUpdate = true;

  // Camera gentle parallax
  camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.4 + 3.5 - camera.position.y) * 0.02;
  camera.lookAt(0, 0.7, 0);

  // Subtle box rock when winding
  boxGroup.rotation.z = Math.sin(t * 14) * windPower * 0.008;

  renderer.render(scene, camera);
}

animate();

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const W = window.innerWidth, H = window.innerHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
});