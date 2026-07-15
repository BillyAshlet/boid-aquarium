import { World } from './world.js';
import { createScene } from './scene.js';
import { MotionInput, mountEnableButton } from './input.js';
import { Flock, BOID_PARAMS } from './boids.js';
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
const flock = new Flock(world, scene);
const debug = createDebug({ world, scene, input, presentation, flock });

// Debug handle for console poking and automated verification — reads
// real state instead of scraping the panel UI. Not part of the game.
window.aquarium = { world, input, presentation, flock, BOID_PARAMS };

// The whole game, one frame at a time: senses → physics → picture → window.
renderer.setAnimationLoop((nowMs) => {
  input.update();
  presentation.updateOrientation();
  world.step(nowMs);
  renderer.render(scene, camera);
  debug.update(nowMs);
});
