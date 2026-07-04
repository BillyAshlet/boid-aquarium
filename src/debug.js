import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { GRAVITY } from './world.js';

// The window into the machine: Tweakpane panel, always-on FPS counter,
// and visualizers. Every invisible force in this game eventually gets a
// drawable form here.
export function createDebug({ world, scene, input }) {
  const pane = new Pane({ title: 'the boid 水族馆' });

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

  const monitors = { gravity: '' };

  const inputFolder = pane.addFolder({ title: 'input 感应' });
  inputFolder.addBinding(input, 'flipSign', { label: 'flip sign' });
  inputFolder.addBinding(input, 'smoothing', { min: 0.01, max: 1 });
  inputFolder.addBinding(monitors, 'gravity', {
    readonly: true,
    label: 'gravity',
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
