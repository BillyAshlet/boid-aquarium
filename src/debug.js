import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { GRAVITY, TANK, TANK_PRESETS, notifyTankChange } from './world.js';
import { screenAngle } from './input.js';
import { BOID_PARAMS } from './boids.js';
import m1StandingWave from '../presets/m1-standing-wave.json';

// The window into the machine: Tweakpane panel, always-on FPS counter,
// and visualizers. Every invisible force in this game eventually gets a
// drawable form here.
export function createDebug({ world, scene, input, presentation, flock }) {
  // Mounted inside #app (via panel-holder) so it rotates with the game.
  const pane = new Pane({
    title: 'the boid 水族馆',
    container: document.getElementById('panel-holder'),
  });

  const resets = [];
  const registry = []; // every param, so preset-apply can refresh/widen it

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

    // After a preset writes obj[key] directly: repaint the control, and
    // if the new value sits outside the slider's current window, widen
    // the window to include it (never silently clamp a loaded preset).
    function ensureVisible() {
      const v = obj[key];
      if (isNumeric && (v < state.min || v > state.max)) {
        state.min = nice(Math.min(state.min, v));
        state.max = nice(Math.max(state.max, v));
        state.step = niceStep(state.max - state.min);
        rebuild();
      } else {
        binding.refresh();
      }
    }

    binding = folder.addBinding(obj, key, tpOpts);
    decorate();
    resets.push(resetParam);
    registry.push({ ensureVisible });
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

  // Tank dims 水槽 — platform-selected at boot (scaling model A: only
  // the tank scales; creature-scale params stay put). Live-tunable for
  // the multi-gyre space experiment; shell + camera follow on release.
  const tankFolder = pane.addFolder({ title: 'tank 水槽', expanded: false });
  const onTankSlider = (ev) => {
    if (ev.last) notifyTankChange();
  };
  addParam(tankFolder, TANK, 'width', { min: 0.4, max: 4, step: 0.05, hardMin: 0.2, hardMax: 10 }).on('change', onTankSlider);
  addParam(tankFolder, TANK, 'height', { min: 0.3, max: 3, step: 0.05, hardMin: 0.2, hardMax: 10 }).on('change', onTankSlider);
  addParam(tankFolder, TANK, 'depth', { min: 0.2, max: 3, step: 0.05, hardMin: 0.1, hardMax: 10 }).on('change', onTankSlider);
  const applyTankPreset = (dims) => {
    Object.assign(TANK, dims);
    for (const r of registry) r.ensureVisible();
    notifyTankChange();
  };
  tankFolder
    .addButton({ title: 'mobile dims 1.2×0.8×0.5' })
    .on('click', () => applyTankPreset(TANK_PRESETS.mobile));
  tankFolder
    .addButton({ title: 'desktop dims 2.0×1.2×0.8' })
    .on('click', () => applyTankPreset(TANK_PRESETS.desktop));

  const boidsFolder = pane.addFolder({ title: 'boids 鱼群', expanded: false });
  addParam(boidsFolder, BOID_PARAMS, 'fishCount', {
    min: 1,
    max: 1000, // dense-school exploration headroom (was 200/500)
    step: 1,
    hardMin: 1,
    hardMax: 1000,
  }).on('change', (ev) => {
    if (ev.last) flock.setCount(ev.value); // rebuild once, on release
  });
  addParam(boidsFolder, BOID_PARAMS, 'cruiseSpeed', { min: 0.02, max: 0.6, step: 0.01, hardMin: 0.01 });
  addParam(boidsFolder, BOID_PARAMS, 'maxSpeed', { min: 0.05, max: 0.8, step: 0.01, hardMin: 0.01 });
  addParam(boidsFolder, BOID_PARAMS, 'maxForce', { min: 0.05, max: 8, step: 0.05, hardMin: 0.01 });
  addParam(boidsFolder, BOID_PARAMS, 'separationRadius', { min: 0.01, max: 0.3, step: 0.005, hardMin: 0 });
  addParam(boidsFolder, BOID_PARAMS, 'separationWeight', { min: 0, max: 5, step: 0.05, hardMin: 0 });
  addParam(boidsFolder, BOID_PARAMS, 'sepFalloff', {
    label: 'sepFalloff',
    options: { inverse: 'inverse', linear: 'linear', 'inverse-log': 'invlog' },
  });
  addParam(boidsFolder, BOID_PARAMS, 'alignmentRadius', { min: 0.02, max: 0.6, step: 0.01, hardMin: 0 });
  addParam(boidsFolder, BOID_PARAMS, 'alignmentWeight', { min: 0, max: 5, step: 0.05, hardMin: 0 });
  addParam(boidsFolder, BOID_PARAMS, 'cohesionRadius', { min: 0.05, max: 0.8, step: 0.01, hardMin: 0 });
  addParam(boidsFolder, BOID_PARAMS, 'cohesionWeight', { min: 0, max: 5, step: 0.05, hardMin: 0 });
  // max 2.5 > tank diagonal: deliberately reachable "accidental
  // containment" territory (the old misdiagnosis turned aesthetic)
  addParam(boidsFolder, BOID_PARAMS, 'detectionLength', { min: 0.02, max: 2.5, step: 0.01, hardMin: 0.01, hardMax: 10 });
  addParam(boidsFolder, BOID_PARAMS, 'avoidanceWeight', { min: 0, max: 8, step: 0.1, hardMin: 0 });
  addParam(boidsFolder, BOID_PARAMS, 'centeringWeight', { min: 0, max: 2, step: 0.01, hardMin: 0 });
  addParam(boidsFolder, BOID_PARAMS, 'angleStep', { min: 5, max: 45, step: 1, hardMin: 1, hardMax: 90 });
  addParam(boidsFolder, BOID_PARAMS, 'maxPitch', { min: 0, max: 80, step: 1, hardMin: 0, hardMax: 89 });
  addParam(boidsFolder, BOID_PARAMS, 'turnSpeed', { min: 0.2, max: 10, step: 0.1, hardMin: 0.05 });

  // --- Presets 预设: the tuning workflow's memory ---
  // Desktop tunes (precise sliders, rapid A/B), the phone feels (real
  // gravity) — the bridge is one compact JSON line: copy here, paste
  // there, apply. localStorage is the per-browser scratchpad of
  // works-in-progress; presets/*.json in the repo (★ built-ins) is the
  // committed archive of locked aesthetic decisions. Presets cover
  // BOID_PARAMS only — input tuning (One Euro etc.) is per-device by
  // design and keeps its own baseline preset.
  const LS_KEY = 'boid-aquarium.presets.v1';
  const builtins = { [m1StandingWave.name]: m1StandingWave.params };
  const readStore = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || {};
    } catch {
      return {};
    }
  };
  const writeStore = (s) => localStorage.setItem(LS_KEY, JSON.stringify(s));

  const presetUI = { name: '', saved: '★' + m1StandingWave.name, paste: '', status: '' };
  const presetFolder = pane.addFolder({ title: 'presets 预设', expanded: false });
  presetFolder.addBinding(presetUI, 'name', { label: 'name' });

  function applyParams(params, sourceLabel) {
    let applied = 0;
    const skipped = [];
    for (const [k, v] of Object.entries(params)) {
      if (k in BOID_PARAMS && typeof v === typeof BOID_PARAMS[k]) {
        BOID_PARAMS[k] = v;
        applied++;
      } else {
        skipped.push(k);
      }
    }
    // setCount both rebuilds the school and normalizes fishCount; the
    // slider's own change handler only fires on user input, not here.
    flock.setCount(BOID_PARAMS.fishCount);
    for (const r of registry) r.ensureVisible();
    presetUI.status =
      `${sourceLabel}: ${applied} params` +
      (skipped.length ? ` · ignored ${skipped.join(', ')}` : '');
  }

  let savedList = null;
  function rebuildList() {
    const options = [
      ...Object.keys(builtins).map((k) => ({ text: `★ ${k}`, value: '★' + k })),
      ...Object.keys(readStore()).map((k) => ({ text: k, value: k })),
    ];
    if (!options.some((o) => o.value === presetUI.saved)) presetUI.saved = options[0].value;
    const index = savedList ? presetFolder.children.indexOf(savedList) : undefined;
    if (savedList) savedList.dispose();
    savedList = presetFolder.addBlade({
      view: 'list',
      label: 'saved',
      options,
      value: presetUI.saved,
      index,
    });
    savedList.on('change', (ev) => {
      presetUI.saved = ev.value;
    });
  }

  presetFolder.addButton({ title: 'save to browser 💾' }).on('click', () => {
    const name = presetUI.name.trim();
    if (!name) {
      presetUI.status = 'name it first';
      return;
    }
    if (builtins[name]) {
      presetUI.status = '★ names are reserved';
      return;
    }
    const store = readStore();
    store[name] = { ...BOID_PARAMS };
    writeStore(store);
    presetUI.saved = name;
    rebuildList();
    presetUI.status = `saved "${name}"`;
  });

  rebuildList();

  presetFolder.addButton({ title: 'load ▶' }).on('click', () => {
    const params = presetUI.saved.startsWith('★')
      ? builtins[presetUI.saved.slice(1)]
      : readStore()[presetUI.saved];
    if (params) applyParams(params, presetUI.saved);
    else presetUI.status = 'preset not found';
  });

  presetFolder.addButton({ title: 'delete 🗑' }).on('click', () => {
    if (presetUI.saved.startsWith('★')) {
      presetUI.status = '★ built-ins live in the repo, not here';
      return;
    }
    const store = readStore();
    delete store[presetUI.saved];
    writeStore(store);
    rebuildList();
    presetUI.status = 'deleted';
  });

  presetFolder.addButton({ title: 'copy to clipboard 📋' }).on('click', async () => {
    const json = JSON.stringify({
      _type: 'boid-preset',
      name: presetUI.name.trim() || 'untitled',
      date: new Date().toISOString().slice(0, 10),
      // Additive key (2026-07-17): the tank this preset was tuned in.
      // Radius params don't transfer verbatim across tank scales —
      // that's inherent to scaling model A, not a bug.
      tank: { ...TANK },
      params: { ...BOID_PARAMS },
    });
    presetUI.paste = json; // always mirrored — manual-copy fallback
    pasteBinding.refresh();
    try {
      await navigator.clipboard.writeText(json);
      presetUI.status = `copied (${json.length} chars)`;
    } catch {
      presetUI.status = 'clipboard blocked — copy from paste field';
    }
  });

  const pasteBinding = presetFolder.addBinding(presetUI, 'paste', { label: 'paste' });
  presetFolder.addButton({ title: 'apply pasted ▶' }).on('click', () => {
    try {
      const obj = JSON.parse(presetUI.paste);
      applyParams(obj.params ?? obj, obj.name || 'pasted'); // bare param objects OK
    } catch {
      presetUI.status = 'not valid JSON';
    }
  });
  presetFolder.addBinding(presetUI, 'status', { readonly: true, label: '·' });

  const view = { gravityArrow: true, perceptionRadii: false, steeringArrows: false };
  const viewFolder = pane.addFolder({ title: 'visualizers 可视化' });
  addParam(viewFolder, view, 'gravityArrow', { label: 'gravity arrow' });
  addParam(viewFolder, view, 'perceptionRadii', { label: 'perception radii' });
  addParam(viewFolder, view, 'steeringArrows', { label: 'steering arrows' });

  // Perception radii: three wireframe spheres around fish[0]. Numbers
  // are meaningless; wrapped around a swimming fish they're legible.
  const radiiGroup = new THREE.Group();
  const radiusSpheres = ['#ff9d9d', '#9dc9ff', '#a8ff9d'].map((color) => {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 12),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.15 })
    );
    radiiGroup.add(s);
    return s;
  });
  radiiGroup.visible = false;
  scene.add(radiiGroup);

  // Steering arrows: one LineSegments buffer, two verts per fish.
  const FORCE_SCALE = 0.15;
  const maxFish = 1000; // must track the fishCount hardMax
  const linePositions = new Float32Array(maxFish * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const forceLines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: '#ffb347' })
  );
  forceLines.frustumCulled = false;
  forceLines.visible = false;
  scene.add(forceLines);

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

    radiiGroup.visible = view.perceptionRadii;
    if (view.perceptionRadii && flock.positions.length > 0) {
      radiiGroup.position.copy(flock.positions[0]);
      radiusSpheres[0].scale.setScalar(Math.max(BOID_PARAMS.separationRadius, 1e-4));
      radiusSpheres[1].scale.setScalar(Math.max(BOID_PARAMS.alignmentRadius, 1e-4));
      radiusSpheres[2].scale.setScalar(Math.max(BOID_PARAMS.cohesionRadius, 1e-4));
    }

    forceLines.visible = view.steeringArrows;
    if (view.steeringArrows) {
      const n = Math.min(flock.positions.length, maxFish);
      for (let i = 0; i < n; i++) {
        const p = flock.positions[i];
        const f = flock.forces[i];
        linePositions[i * 6] = p.x;
        linePositions[i * 6 + 1] = p.y;
        linePositions[i * 6 + 2] = p.z;
        linePositions[i * 6 + 3] = p.x + f.x * FORCE_SCALE;
        linePositions[i * 6 + 4] = p.y + f.y * FORCE_SCALE;
        linePositions[i * 6 + 5] = p.z + f.z * FORCE_SCALE;
      }
      lineGeo.setDrawRange(0, n * 2);
      lineGeo.attributes.position.needsUpdate = true;
    }
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
