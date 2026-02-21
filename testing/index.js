import * as THREE from "three";

const w = window.innerWidth;
const h = window.innerHeight;

//renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);


const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();

const geo = new THREE.IcosahedronGeometry(1.0, 2);
const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true
});

//container for geometry and material 
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
});
const wireMesh = new THREE.Mesh(geo, wireMat);
scene.add(wireMesh);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0000000);
scene.add(hemiLight);
//
function animate(t = 0) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}
animate();


