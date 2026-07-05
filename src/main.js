import { World } from './world.js';
import { createScene } from './scene.js';
import { MotionInput, mountEnableButton } from './input.js';
import { createDebug } from './debug.js';

const world = new World();
const input = new MotionInput(world);
// Presentation and physics share the same hold state (input owns both
// halves of the frame model), so they cannot disagree.
const presentation = createScene(
  document.getElementById('app'),
  () => input.presentationRotation()
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
