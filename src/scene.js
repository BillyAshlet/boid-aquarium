import * as THREE from 'three';
import { TANK } from './world.js';

export function createScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#071e3d');

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10);

  scene.add(new THREE.AmbientLight('#8fb4d8', 0.6));
  const sun = new THREE.DirectionalLight('#ffffff', 1.2);
  sun.position.set(0.5, 1, 0.8);
  scene.add(sun);

  // Tank shell: visible glass edges + barely-there back panes. The
  // player must be able to see what the water bounces off.
  const box = new THREE.BoxGeometry(TANK.width, TANK.height, TANK.depth);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(box),
    new THREE.LineBasicMaterial({ color: '#2e6db4' })
  );
  const panes = new THREE.Mesh(
    box,
    new THREE.MeshBasicMaterial({
      color: '#0c54a6',
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide, // far walls only; the front stays clear glass
      depthWrite: false,
    })
  );
  scene.add(panes, edges);

  // Fixed camera: pull straight back until the tank (plus margin) fits
  // both screen axes, portrait or landscape.
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    const margin = 1.25;
    const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const distForHeight = ((TANK.height / 2) * margin) / Math.tan(halfFov);
    const distForWidth =
      ((TANK.width / 2) * margin) / (Math.tan(halfFov) * camera.aspect);
    camera.position.set(
      0,
      0,
      Math.max(distForHeight, distForWidth) + TANK.depth / 2
    );
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  return { renderer, scene, camera };
}
