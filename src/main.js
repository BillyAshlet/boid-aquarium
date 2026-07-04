import { World } from './world.js';
import { createScene } from './scene.js';
import { MotionInput, mountEnableButton } from './input.js';
import { createDebug } from './debug.js';

const world = new World();
const presentation = createScene(document.getElementById('app'));
const { renderer, scene, camera } = presentation;
const input = new MotionInput(world);
mountEnableButton(input);
const debug = createDebug({ world, scene, input, presentation });

// The whole game, one frame at a time: senses → physics → picture → window.
renderer.setAnimationLoop((nowMs) => {
  input.update();
  world.step(nowMs);
  renderer.render(scene, camera);
  debug.update(nowMs);
});
