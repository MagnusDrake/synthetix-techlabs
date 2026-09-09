import { SceneManager } from './core/SceneManager.js';
import { ParallaxController } from './core/ParallaxController.js';
import { ParallaxCard } from './components/ParallaxCard.js';
import { Diorama3D } from './components/Diorama3D.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { DirectorHUD } from './components/DirectorHUD.js';
import { SandboxLab } from './components/SandboxLab.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('⚡ Synthetix TechLabs — 3D Parallax & Spatial Dimension Engine Initializing...');

  // 1. Audio Synthesizer
  const soundEngine = new SoundEngine();

  // 2. Three.js WebGL Canvas Scene
  const canvas = document.getElementById('webgl-canvas');
  const sceneManager = new SceneManager(canvas);

  // 3. Parallax Controller (Mouse, Touch, Scroll, Cursor)
  const parallaxController = new ParallaxController(sceneManager);

  // 4. Interactive 3D Parallax Tilt Cards
  const cards = ParallaxCard.initAll(soundEngine);

  // 5. 3D Holographic Diorama / Depth Slicer
  const dioramaStage = document.getElementById('diorama-stage');
  let diorama = null;
  if (dioramaStage) {
    diorama = new Diorama3D(dioramaStage, soundEngine);
  }

  // 6. Interactive Warp Sandbox Lab
  const sandbox = new SandboxLab(sceneManager, soundEngine);

  // 7. Lab Director HUD Console
  const hud = new DirectorHUD(sceneManager, parallaxController, soundEngine);

  // 8. Simulated Live Telemetry Fluctuation
  initLiveTelemetry();

  // 9. Smooth Scroll & Sound for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        soundEngine.playClickTone();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  console.log('✨ Synthetix TechLabs Online. System Status: Superposition Stable.');
});

function initLiveTelemetry() {
  const coherenceEl = document.getElementById('tele-coherence');
  const fluxEl = document.getElementById('tele-flux');
  const entropyEl = document.getElementById('tele-entropy');

  setInterval(() => {
    if (coherenceEl) {
      const val = (99.94 + Math.random() * 0.05).toFixed(2);
      coherenceEl.textContent = `${val}%`;
    }
    if (fluxEl) {
      const val = (4.75 + Math.random() * 0.15).toFixed(2);
      fluxEl.textContent = `${val} THz`;
    }
    if (entropyEl) {
      const val = (0.002 + Math.random() * 0.003).toFixed(3);
      entropyEl.textContent = `${val} Δ`;
    }
  }, 2200);
}
