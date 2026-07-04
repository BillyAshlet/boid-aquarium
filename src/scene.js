import * as THREE from 'three';
import { TANK } from './world.js';

// Presentation: canonical landscape → viewport. The only orientation
// signal we trust is the viewport's own aspect — it cannot lie, it IS
// the box we draw into. Touch device + portrait viewport → rotate the
// whole #app wrapper 90° CW and swap dimensions, so the landscape game
// fills the screen (no letterbox) and reads correctly in the canonical
// hold (device top edge left). Desktop never rotates.
export function createScene(wrapper) {
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

  let rotated = false;

  function resize() {
    const isTouch = navigator.maxTouchPoints > 0;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    rotated = isTouch && vh > vw;
    const w = rotated ? vh : vw;
    const h = rotated ? vw : vh;

    if (rotated) {
      // A w×h wrapper rotated 90° CW about its top-left, after being
      // shifted up by its own height, lands exactly on the vh×vw
      // viewport — fullscreen, dimension-swapped.
      wrapper.style.width = `${w}px`;
      wrapper.style.height = `${h}px`;
      wrapper.style.transform = 'rotate(90deg) translateY(-100%)';
    } else {
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
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
    resize();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(resize, 300);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  resize();

  // CSS transforms rotate pixels, not coordinates: touch positions
  // arrive in viewport space. ALL canvas-space touch math (M3 touch
  // zones, raycasts) must pass through here — never use clientX/Y raw.
  function viewportToCanonical(sx, sy) {
    if (!rotated) return { x: sx, y: sy };
    return { x: sy, y: window.innerWidth - sx };
  }

  return {
    renderer,
    scene,
    camera,
    viewportToCanonical,
    isRotated: () => rotated,
  };
}
