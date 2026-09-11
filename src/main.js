import { SceneManager } from './core/SceneManager.js';
import { ParallaxController } from './core/ParallaxController.js';
import { ParallaxCard } from './components/ParallaxCard.js';
import { Diorama3D } from './components/Diorama3D.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { DirectorHUD } from './components/DirectorHUD.js';
import { SandboxLab } from './components/SandboxLab.js';
import { FaceTracker } from './core/FaceTracker.js';
import { CommandPalette } from './components/CommandPalette.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('⚡ Synthetix TechLabs — 3D Parallax & Spatial Dimension Engine Initializing...');

  // 1. Audio Synthesizer & Cybernetic Voice
  const soundEngine = new SoundEngine();

  // 2. Three.js WebGL Canvas Scene with Audio Reactivity & Particle Morphing
  const canvas = document.getElementById('webgl-canvas');
  const sceneManager = new SceneManager(canvas, soundEngine);

  // 3. Parallax Controller (Mouse, Touch, Gyro, Biometric, Cursor)
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

  // 7. Biometric Head-Tracking Parallax Engine
  let faceTracker = null;

  // 8. Application Context for Command Palette and HUD
  const appContext = {
    scene: sceneManager,
    parallax: parallaxController,
    sound: soundEngine,
    hud: null,
    cmdPalette: null,
    faceTracker: null,

    async toggleFaceTracking() {
      if (!faceTracker) {
        faceTracker = new FaceTracker((x, y, z) => {
          parallaxController.setBiometricOffset(x, y, z);
        });
        this.faceTracker = faceTracker;

        const pipContainer = document.getElementById('pip-video-container');
        if (pipContainer) {
          pipContainer.innerHTML = '';
          pipContainer.appendChild(faceTracker.getVideoElement());
        }
      }

      const active = await faceTracker.toggle();
      return active;
    }
  };

  // 9. Lab Director HUD Console
  const hud = new DirectorHUD(sceneManager, parallaxController, soundEngine, appContext);
  appContext.hud = hud;

  // 10. Futuristic Command Terminal (Ctrl + K)
  const cmdPalette = new CommandPalette(appContext);
  appContext.cmdPalette = cmdPalette;
  window.SynthetixApp = appContext;

  // Header quick trigger for Terminal
  const headerCmdBtn = document.getElementById('header-cmd-btn');
  if (headerCmdBtn) {
    headerCmdBtn.addEventListener('click', () => cmdPalette.open());
  }

  // 11. Simulated Live Telemetry Fluctuation
  initLiveTelemetry();

  // 12. Smooth Scroll & Sound for Anchor Links
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

  // 13. First Interaction Welcome Trigger
  const onFirstInteraction = () => {
    window.removeEventListener('click', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
    if (soundEngine.voice && soundEngine.voice.isEnabled) {
      setTimeout(() => {
        soundEngine.voice.speak('Welcome to Synthetix TechLabs. Quantum core operational.');
      }, 600);
    }
  };
  window.addEventListener('click', onFirstInteraction, { once: true });
  window.addEventListener('keydown', onFirstInteraction, { once: true });

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
