// Session-zero pipeline check: one spinning ring, nothing else.
// If you can see this on the iPhone over https, the pipeline works.
// Real scaffold (world.js, scene.js, fixed timestep) lands in M0.
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#071e3d');

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  10
);
camera.position.set(0, 0, 1.2);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.18, 0.035, 16, 48),
  new THREE.MeshBasicMaterial({ color: '#0c54a6', wireframe: true })
);
scene.add(ring);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const status = document.getElementById('status');
let frames = 0;
let last = performance.now();

renderer.setAnimationLoop((t) => {
  ring.rotation.x = t * 0.0005;
  ring.rotation.y = t * 0.0008;
  renderer.render(scene, camera);

  frames++;
  if (t - last > 1000) {
    status.textContent = `the boid 水族馆 — pipeline OK\nWebGL ✓  ${frames} fps`;
    frames = 0;
    last = t;
  }
});
