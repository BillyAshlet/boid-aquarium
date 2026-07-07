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

  // Every tunable registers through here and carries: live value,
  // explicit range, its default (the value at registration), a ↺ reset,
  // and — for numeric sliders — recursive zoom: ⊕ halves the range and
  // ⊖ doubles it, both re-centered on the current value. Workflow:
  // sweep the full range to find the neighborhood, ⊕ in for detail,
  // ⊕ again for precision; ↺ restores value AND range. Optional
  // opts.hardMin/hardMax clamp how far ⊖ can widen (e.g. beta < 0 is
  // meaningless). Hover the label for current range + default.
  function addParam(folder, obj, key, opts = {}) {
    const { hardMin = -Infinity, hardMax = Infinity, ...tpOpts } = opts;
    const def = obj[key];
    const isNumeric =
      typeof def === 'number' && tpOpts.min !== undefined && !tpOpts.options;
    const state = { min: tpOpts.min, max: tpOpts.max, step: tpOpts.step };
    let binding;

    const nice = (x) => parseFloat(x.toPrecision(6));
    const niceStep = (width) => 10 ** Math.floor(Math.log10(width / 100));

    function decorate() {
      const label = binding.element.querySelector('.tp-lblv_l');
      if (!label) return;
      const range = isNumeric ? `range ${state.min}–${state.max} · ` : '';
      label.title = `${range}default ${def}`;
      const addBtn = (text, title, onClick) => {
        const btn = document.createElement('span');
        btn.className = 'param-btn';
        btn.textContent = text;
        btn.title = title;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onClick();
        });
        label.appendChild(btn);
      };
      addBtn('↺', `reset to ${def} (value + range)`, resetParam);
      if (isNumeric) {
        addBtn('+', 'zoom in: halve range, centered on value', () => zoom(0.5));
        addBtn('−', 'zoom out: double range, centered on value', () => zoom(2));
      }
    }

    // Tweakpane can't mutate a binding's min/max — rebuild it in place.
    function rebuild() {
      const index = folder.children.indexOf(binding);
      binding.dispose();
      binding = folder.addBinding(obj, key, {
        ...tpOpts,
        min: state.min,
        max: state.max,
        step: state.step,
        index,
      });
      decorate();
    }

    function zoom(factor) {
      const value = obj[key];
      const width = (state.max - state.min) * factor;
      const s = niceStep(width);
      const min = Math.max(value - width / 2, hardMin);
      const max = Math.min(value + width / 2, hardMax);
      state.min = nice(Math.floor(min / s) * s);
      state.max = nice(Math.ceil(max / s) * s);
      if (state.max <= state.min) state.max = nice(state.min + s * 100);
      state.step = s;
      rebuild();
    }

    function resetParam() {
      obj[key] = def;
      if (isNumeric) {
        state.min = tpOpts.min;
        state.max = tpOpts.max;
        state.step = tpOpts.step;
        rebuild();
      } else {
        binding.refresh();
      }
    }

    binding = folder.addBinding(obj, key, tpOpts);
    decorate();
    resets.push(resetParam);
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
  addParam(inputFolder, input, 'minCutoff', {
    min: 0.05,
    max: 10, // ≥10 Hz at a ~60 Hz sensor is near-raw passthrough
    step: 0.05,
    hardMin: 0.01, // 0 would freeze the filter (infinite time constant)
    hardMax: 60,
  });
  addParam(inputFolder, input, 'beta', {
    min: 0,
    max: 1.5, // whip derivatives are ~tens; 1.5 ≈ instant tracking
    step: 0.01,
    hardMin: 0, // negative beta is meaningless
    hardMax: 10,
  });
  // Flip ergonomics: debounce (threshold must hold this long) and the
  // workshop lock for tuning sessions.
  addParam(inputFolder, input, 'flipDelay', {
    min: 0,
    max: 5, // field-tuned value sat at the old max (3) — headroom added
    step: 0.1,
    hardMin: 0,
    hardMax: 10,
  });
  addParam(inputFolder, input, 'holdFrame', { label: 'hold frame 🔒' });
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
    }  F${input._F}  rot ${presentation.rotationDeg()}°  off ${input.resolveOffset()}°${
      input.holdFrame ? '  🔒' : ''
    }`;

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
