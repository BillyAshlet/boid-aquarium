import * as THREE from 'three';
import { TANK } from './world.js';

// Presentation: canonical landscape → viewport. The CSS rotation comes
// from input.js (R = −(hold + framebuffer), see the frame model there);
// this module just applies whatever R says and owns the geometry:
// dimension swap, camera framing, and viewport→canonical coordinates.
// Desktop never rotates. Physics and presentation share the same hold
// state, so they cannot disagree by construction.
export function createScene(wrapper, getRotation = () => 0) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrapper.appendChild(renderer.domElement);

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

  let rotationDeg = 0;
  let appliedKey = '';

  function computeRotation() {
    if (navigator.maxTouchPoints === 0) return 0; // desktop never rotates
    return getRotation();
  }

  // Cheap enough to call every frame: bails unless rotation state or
  // viewport actually changed.
  function apply() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    rotationDeg = computeRotation();
    const key = `${rotationDeg}:${vw}x${vh}`;
    if (key === appliedKey) return;
    appliedKey = key;

    const swap = rotationDeg === 90 || rotationDeg === 270;
    const w = swap ? vh : vw;
    const h = swap ? vw : vh;

    // transform-origin is top-left (index.html); transforms compose
    // right-to-left, so the translate positions the box, the rotation
    // lands it exactly on the viewport — fullscreen, no letterbox.
    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
    if (rotationDeg === 90) {
      wrapper.style.transform = 'rotate(90deg) translateY(-100%)';
    } else if (rotationDeg === 270) {
      wrapper.style.transform = 'rotate(-90deg) translateX(-100%)';
    } else if (rotationDeg === 180) {
      wrapper.style.transform = 'rotate(180deg) translate(-100%, -100%)';
    } else {
      wrapper.style.transform = 'none';
    }

    renderer.setSize(w, h);
    camera.aspect = w / h;
    // Fixed camera: pull straight back until the tank (plus margin)
    // fits both canonical axes.
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

  // iOS reports stale innerWidth/Height mid-rotation; re-measure after
  // things settle.
  let settleTimer = 0;
  function onResize() {
    apply();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(apply, 300);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  apply();

  // CSS transforms rotate pixels, not coordinates: touch positions
  // arrive in viewport space. ALL canvas-space touch math (M3 touch
  // zones, raycasts) must pass through here — never use clientX/Y raw.
  function viewportToCanonical(sx, sy) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    switch (rotationDeg) {
      case 90:
        return { x: sy, y: vw - sx };
      case 270:
        return { x: vh - sy, y: sx };
      case 180:
        return { x: vw - sx, y: vh - sy };
      default:
        return { x: sx, y: sy };
    }
  }

  return {
    renderer,
    scene,
    camera,
    viewportToCanonical,
    rotationDeg: () => rotationDeg,
    updateOrientation: apply,
  };
}
