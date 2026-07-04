import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { GRAVITY } from './world.js';
import { screenAngle } from './input.js';

// The window into the machine: Tweakpane panel, always-on FPS counter,
// and visualizers. Every invisible force in this game eventually gets a
// drawable form here.
export function createDebug({ world, scene, input, presentation }) {
  // Mounted inside #app (via panel-holder) so it rotates with the game.
  const pane = new Pane({
    title: 'the boid 水族馆',
    container: document.getElementById('panel-holder'),
  });

  // Gravity arrow at tank center: direction = where "down" currently is,
  // length = strength relative to standard gravity.
  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 0),
    0.35,
    '#ffb347',
    0.06,
    0.03
  );
  scene.add(arrow);

  const monitors = { gravity: '', screen: '' };

  const inputFolder = pane.addFolder({ title: 'input 感应' });
  inputFolder.addBinding(input, 'flipSign', { label: 'flip sign' });
  // Frame stepper: manual override for the auto-rotate ±180° ambiguity
  // and the diagnosis tool for devices whose orientation APIs lie.
  inputFolder.addBinding(input, 'frameOffset', {
    label: 'frame',
    options: { auto: 'auto', '0°': 0, '90°': 90, '180°': 180, '270°': 270 },
  });
  // Sweet spot lives in the low range — field-tested: 0.1 sluggish,
  // 0.2 jittery, so the whole slider is that neighborhood.
  inputFolder.addBinding(input, 'smoothing', {
    min: 0.01,
    max: 0.3,
    step: 0.005,
  });
  inputFolder.addBinding(monitors, 'gravity', {
    readonly: true,
    label: 'gravity',
  });
  inputFolder.addBinding(monitors, 'screen', {
    readonly: true,
    label: 'screen',
  });

  const view = { gravityArrow: true };
  const viewFolder = pane.addFolder({ title: 'visualizers 可视化' });
  viewFolder.addBinding(view, 'gravityArrow', { label: 'gravity arrow' });

  // FPS lives in the corner div, not the pane — always visible, even
  // with the panel collapsed. Feel bugs and perf bugs look identical on
  // a phone; this number tells them apart.
  const status = document.getElementById('status');
  let frames = 0;
  let windowStart = performance.now();

  function update(nowMs) {
    const g = world.gravity;
    arrow.visible = view.gravityArrow;
    if (g.lengthSq() > 1e-6) arrow.setDirection(g.clone().normalize());
    arrow.setLength(0.35 * (g.length() / GRAVITY), 0.06, 0.03);
    monitors.gravity = `x ${g.x.toFixed(2)}  y ${g.y.toFixed(2)}  z ${g.z.toFixed(2)}`;
    monitors.screen = `${screenAngle()}°  ${
      window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    }${presentation.isRotated() ? ' (rotated)' : ''}  off ${input.resolveOffset()}°`;

    frames++;
    if (nowMs - windowStart > 500) {
      const fps = Math.round((frames * 1000) / (nowMs - windowStart));
      status.textContent = `${fps} fps${input.active ? '  tilt ✓' : ''}`;
      frames = 0;
      windowStart = nowMs;
    }
  }

  return { update, pane };
}
