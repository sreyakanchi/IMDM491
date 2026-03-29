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

// ─── Orbit Controls ──────────────────────────────────────────────────────────
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.7, 0);      // orbit around the music box centre
controls.enableDamping  = true;
controls.dampingFactor  = 0.06;
controls.minDistance    = 4;
controls.maxDistance    = 22;
controls.minPolarAngle  = Math.PI * 0.1;   // can't go above the scene
controls.maxPolarAngle  = Math.PI * 0.75;  // can't clip below the ground
controls.autoRotate     = false;           // user controls rotation
controls.update();

// ─── Lights ─────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x1a1008, 100.2);
scene.add(ambientLight);

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

// ─── Animation Loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let t = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  t += delta;

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

  // OrbitControls — must call every frame for damping to work
  controls.update();

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