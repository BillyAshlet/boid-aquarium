import { World } from './world.js';
import { createScene } from './scene.js';
import { MotionInput, mountEnableButton } from './input.js';
import { createDebug } from './debug.js';

const world = new World();
const input = new MotionInput(world);
// Presentation follows the same resolved frame as physics — they flip
// together, so world-down is honest in every hold.
const presentation = createScene(
  document.getElementById('app'),
  () => input.resolveOffset() === 180
);
const { renderer, scene, camera } = presentation;
mountEnableButton(input);
const debug = createDebug({ world, scene, input, presentation });

// The whole game, one frame at a time: senses → physics → picture → window.
renderer.setAnimationLoop((nowMs) => {
  input.update();
  presentation.updateOrientation();
  world.step(nowMs);
  renderer.render(scene, camera);
  debug.update(nowMs);
});
