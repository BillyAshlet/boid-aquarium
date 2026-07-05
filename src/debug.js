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

  const resets = [];

  // Every tunable registers through here and carries three things:
  // live value, explicit range, and its default (the value at
  // registration). Hover the label for range + default; click ↺ to go
  // back to a known state. This is the per-param one-slot preset.
  function addParam(folder, obj, key, opts = {}) {
    const def = obj[key];
    const binding = folder.addBinding(obj, key, opts);
    const label = binding.element.querySelector('.tp-lblv_l');
    if (label) {
      const range =
        opts.min !== undefined ? `range ${opts.min}–${opts.max} · ` : '';
      label.title = `${range}default ${def}`;
      const btn = document.createElement('span');
      btn.className = 'param-reset';
      btn.textContent = '↺';
      btn.title = `reset to ${def}`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        obj[key] = def;
        binding.refresh();
      });
      label.appendChild(btn);
    }
    resets.push(() => {
      obj[key] = def;
      binding.refresh();
    });
    return binding;
  }

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
  addParam(inputFolder, input, 'flipSign', { label: 'flip sign' });
  addParam(inputFolder, input, 'frameOffset', {
    label: 'frame',
    options: { auto: 'auto', '0°': 0, '180°': 180 },
  });
  // One Euro: tune minCutoff FIRST (hold still, lower until calm),
  // then beta (whip the phone, raise until no lag).
  addParam(inputFolder, input, 'minCutoff', { min: 0.05, max: 3, step: 0.05 });
  addParam(inputFolder, input, 'beta', { min: 0, max: 0.5, step: 0.005 });
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
  addParam(viewFolder, view, 'gravityArrow', { label: 'gravity arrow' });

  pane
    .addButton({ title: 'reset all ↺' })
    .on('click', () => resets.forEach((r) => r()));

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
    }  rot ${presentation.rotationDeg()}°  off ${input.resolveOffset()}°`;

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
