import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TANK, onTankChange } from './world.js';

// Presentation: canonical landscape → viewport. The CSS rotation comes
// from input.js (R = −(hold + framebuffer), see the frame model there);
// this module just applies whatever R says and owns the geometry:
// dimension swap, camera framing, and viewport→canonical coordinates.
//
// Camera policy (revised M1): "fixed camera, world tilts" is a MOBILE
// GAME rule — camera motion must never fight tilt gravity. Desktop is
// the world, and you can walk around a world: OrbitControls (drag
// orbit / right-drag pan / wheel zoom), 0 = home, 1/3/7 = front/side/
// top view snaps. Mobile keeps the fixed auto-framing camera untouched.
export function createScene(wrapper, getRotation = () => 0) {
  const isDesktop = navigator.maxTouchPoints === 0;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrapper.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#071e3d');

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);

  scene.add(new THREE.AmbientLight('#8fb4d8', 0.6));
  const sun = new THREE.DirectionalLight('#ffffff', 1.2);
  sun.position.set(0.5, 1, 0.8);
  scene.add(sun);

  // Tank shell: visible glass edges + barely-there back panes. The
  // player must be able to see what the water bounces off. Rebuilt
  // whenever TANK dims change.
  let shell = null;
  function buildShell() {
    if (shell) {
      scene.remove(shell.edges, shell.panes);
      shell.box.dispose();
      shell.edgesGeo.dispose();
    }
    const box = new THREE.BoxGeometry(TANK.width, TANK.height, TANK.depth);
    const edgesGeo = new THREE.EdgesGeometry(box);
    const edges = new THREE.LineSegments(
      edgesGeo,
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
    shell = { box, edgesGeo, edges, panes };
  }
  buildShell();

  // Distance that fits a (halfW × halfH) face plus margin, then backed
  // off by the tank's half-extent along the viewing axis.
  function fitDistance(halfW, halfH, halfAlong) {
    const margin = 1.25;
    const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const dH = (halfH * margin) / Math.tan(halfFov);
    const dW = (halfW * margin) / (Math.tan(halfFov) * camera.aspect);
    return Math.max(dH, dW) + halfAlong;
  }

  // --- Desktop navigation ---
  let controls = null;
  let userMoved = false; // once true, resizes stop stomping the camera

  function setView(position) {
    if (controls) {
      // Burn leftover drag momentum on the OLD pose first: an undamped
      // update applies-and-zeroes the internal delta. Doing this after
      // placing the camera would fling it off the new pose instead
      // (field-tested: home landed 1.4 units away).
      controls.enableDamping = false;
      controls.update();
    }
    camera.position.copy(position);
    camera.lookAt(0, 0, 0);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
      controls.enableDamping = true;
    }
  }

  function home() {
    userMoved = false;
    setView(
      new THREE.Vector3(
        0,
        0,
        fitDistance(TANK.width / 2, TANK.height / 2, TANK.depth / 2)
      )
    );
  }

  if (isDesktop) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.1;
    controls.maxDistance = 30;
    controls.addEventListener('start', () => {
      userMoved = true;
    });

    window.addEventListener('keydown', (e) => {
      // Never hijack typing in the panel's text fields.
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      switch (e.code) {
        case 'Digit0':
        case 'Numpad0':
          home();
          break;
        case 'Digit1':
        case 'Numpad1': // front
          userMoved = true;
          setView(
            new THREE.Vector3(
              0,
              0,
              fitDistance(TANK.width / 2, TANK.height / 2, TANK.depth / 2)
            )
          );
          break;
        case 'Digit3':
        case 'Numpad3': // right side
          userMoved = true;
          setView(
            new THREE.Vector3(
              fitDistance(TANK.depth / 2, TANK.height / 2, TANK.width / 2),
              0,
              0
            )
          );
          break;
        case 'Digit7':
        case 'Numpad7': // top (tiny z offset keeps OrbitControls off the pole)
          userMoved = true;
          setView(
            new THREE.Vector3(
              0,
              fitDistance(TANK.width / 2, TANK.depth / 2, TANK.height / 2),
              0.001
            )
          );
          break;
      }
    });
  }

  let rotationDeg = 0;
  let appliedKey = '';

  function computeRotation() {
    if (isDesktop) return 0; // desktop never rotates
    return getRotation();
  }

  // Cheap enough to call every frame: bails unless rotation state or
  // viewport actually changed.
  function apply() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Hidden tabs and mid-rotation iOS can report a 0×0 viewport; a 0
    // aspect would NaN the camera. Skip — the settle timer / next
    // resize retries once the viewport is real.
    if (vw === 0 || vh === 0) return;
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
    camera.updateProjectionMatrix();
    // Auto-framing home pose — but never stomp a camera the user has
    // deliberately moved (desktop navigation owns it after first drag).
    if (!userMoved) home();
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

  // Tank dims changed: new shell, and the old camera pose is framing a
  // tank that no longer exists — go home.
  onTankChange(() => {
    buildShell();
    home();
  });

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
    // Damped controls need a per-frame tick; no-op on mobile.
    updateCamera: () => controls?.update(),
    home,
  };
}
