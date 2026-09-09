export class SandboxLab {
  constructor(sceneManager, soundEngine) {
    this.scene = sceneManager;
    this.sound = soundEngine;

    this.hitbox = document.getElementById('sandbox-hitbox');
    this.burstBtn = document.getElementById('warp-burst-btn');
    this.invertBtn = document.getElementById('gravity-invert-btn');
    this.dispersionSlider = document.getElementById('dispersion-slider');

    // Metrics
    this.gravDisplay = document.getElementById('sb-grav');
    this.speedDisplay = document.getElementById('sb-speed');
    this.vectorDisplay = document.getElementById('sb-vector');
    this.pitchDisplay = document.getElementById('sb-pitch');

    this.isInteracting = false;
    this.bounds = null;

    this.init();
  }

  init() {
    if (this.hitbox) {
      this.hitbox.addEventListener('mousedown', (e) => this.onStart(e));
      window.addEventListener('mousemove', (e) => this.onMove(e));
      window.addEventListener('mouseup', () => this.onEnd());

      // Touch support
      this.hitbox.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) this.onStart(e.touches[0]);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) this.onMove(e.touches[0]);
      }, { passive: true });
      window.addEventListener('touchend', () => this.onEnd());
    }

    if (this.burstBtn) {
      this.burstBtn.addEventListener('click', () => {
        if (this.scene) this.scene.triggerBurst();
        if (this.sound) this.sound.playWarpTone();

        this.burstBtn.classList.add('active');
        setTimeout(() => this.burstBtn.classList.remove('active'), 400);
      });
    }

    if (this.invertBtn) {
      this.invertBtn.addEventListener('click', () => {
        if (this.scene) this.scene.invertPolarity();
        if (this.sound) this.sound.playClickTone();
        this.invertBtn.classList.toggle('active');
      });
    }

    if (this.dispersionSlider) {
      this.dispersionSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.scene && this.scene.particleMat) {
          this.scene.particleMat.size = 0.12 * (val / 5);
        }
      });
    }
  }

  onStart(e) {
    this.isInteracting = true;
    this.bounds = this.hitbox.getBoundingClientRect();
    this.handleInteraction(e.clientX, e.clientY);
    if (this.sound) this.sound.playClickTone();
  }

  onMove(e) {
    if (!this.isInteracting) return;
    this.handleInteraction(e.clientX, e.clientY);
  }

  onEnd() {
    if (!this.isInteracting) return;
    this.isInteracting = false;
    this.resetMetrics();
  }

  handleInteraction(clientX, clientY) {
    if (!this.bounds) this.bounds = this.hitbox.getBoundingClientRect();

    const x = (clientX - this.bounds.left) / this.bounds.width;
    const y = (clientY - this.bounds.top) / this.bounds.height;

    const normX = Math.max(-1, Math.min(1, x * 2 - 1));
    const normY = Math.max(-1, Math.min(1, y * 2 - 1));

    const distance = Math.hypot(normX, normY);
    const gravity = (1.0 + distance * 3.5).toFixed(2);
    const speed = (42.8 + distance * 140).toFixed(1);
    const pitch = (220 + distance * 440).toFixed(0);

    if (this.gravDisplay) this.gravDisplay.textContent = `${gravity} G`;
    if (this.speedDisplay) this.speedDisplay.textContent = `${speed} km/s`;
    if (this.vectorDisplay) this.vectorDisplay.textContent = `X: ${normX.toFixed(2)} | Y: ${normY.toFixed(2)}`;
    if (this.pitchDisplay) this.pitchDisplay.textContent = `${pitch} Hz`;

    // Visual center displacement
    const vortexVisual = this.hitbox.querySelector('.vortex-center-visual');
    if (vortexVisual) {
      vortexVisual.style.transform = `translate(${normX * 30}px, ${normY * 30}px) scale(${1 + distance * 0.2})`;
    }

    // Three.js scene gravitational pull
    if (this.scene) {
      this.scene.warp.factor = distance * 2.0;
    }
  }

  resetMetrics() {
    if (this.gravDisplay) this.gravDisplay.textContent = '1.00 G';
    if (this.speedDisplay) this.speedDisplay.textContent = '42.8 km/s';
    if (this.vectorDisplay) this.vectorDisplay.textContent = 'X: 0.00 | Y: 0.00';
    if (this.pitchDisplay) this.pitchDisplay.textContent = '220.0 Hz';

    const vortexVisual = this.hitbox.querySelector('.vortex-center-visual');
    if (vortexVisual) {
      vortexVisual.style.transform = 'translate(0, 0) scale(1)';
    }
  }
}
