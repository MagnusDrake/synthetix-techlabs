export class DirectorHUD {
  constructor(sceneManager, parallaxController, soundEngine) {
    this.scene = sceneManager;
    this.parallax = parallaxController;
    this.sound = soundEngine;

    this.hud = document.getElementById('director-hud');
    this.toggleBtn = document.getElementById('hud-toggle');
    this.closeBtn = document.getElementById('hud-close-btn');

    this.themeBtns = document.querySelectorAll('.theme-btn');
    this.parallaxSlider = document.getElementById('hud-slider-parallax');
    this.parallaxVal = document.getElementById('hud-val-parallax');

    this.lerpSlider = document.getElementById('hud-slider-lerp');
    this.lerpVal = document.getElementById('hud-val-lerp');

    this.modeBtns = document.querySelectorAll('.hud-mode-btn');

    this.particlesSlider = document.getElementById('hud-slider-particles');
    this.particlesVal = document.getElementById('hud-val-particles');

    this.volumeSlider = document.getElementById('hud-slider-volume');
    this.volumeVal = document.getElementById('hud-val-volume');

    this.resetBtn = document.getElementById('hud-reset-all');

    this.init();
  }

  init() {
    // Open / Close
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close when clicking outside HUD on mobile
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });

    // Theme Switcher
    this.themeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        this.setTheme(theme);
        if (this.sound) this.sound.playClickTone();
      });
    });

    // Parallax Sensitivity
    if (this.parallaxSlider) {
      this.parallaxSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (this.parallaxVal) this.parallaxVal.textContent = `${parseFloat(val).toFixed(1)}x`;
        if (this.parallax) this.parallax.setSensitivity(val);
      });
    }

    // Camera Lerp
    if (this.lerpSlider) {
      this.lerpSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.lerpVal) this.lerpVal.textContent = val.toFixed(2);
        if (this.scene) this.scene.config.lerpFactor = val;
      });
    }

    // Geometry Render Mode
    this.modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        if (this.scene) this.scene.setRenderMode(mode);
        if (this.sound) this.sound.playHoverTone();
      });
    });

    // Particle Density
    if (this.particlesSlider) {
      this.particlesSlider.addEventListener('change', (e) => {
        const count = parseInt(e.target.value, 10);
        if (this.particlesVal) this.particlesVal.textContent = count.toLocaleString();
        if (this.scene) this.scene.setParticleCount(count);
      });
      this.particlesSlider.addEventListener('input', (e) => {
        const count = parseInt(e.target.value, 10);
        if (this.particlesVal) this.particlesVal.textContent = count.toLocaleString();
      });
    }

    // Volume Slider
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (this.volumeVal) this.volumeVal.textContent = `${val}%`;
        if (this.sound) this.sound.setVolume(val / 100);
      });
    }

    // Reset All
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetDefaults());
    }
  }

  toggle() {
    if (this.hud) {
      this.hud.classList.toggle('closed');
      if (this.sound) this.sound.playClickTone();
    }
  }

  close() {
    if (this.hud) {
      this.hud.classList.add('closed');
    }
  }

  setTheme(themeKey) {
    document.body.className = themeKey;
    this.themeBtns.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-theme') === themeKey);
    });
    if (this.scene) {
      this.scene.setTheme(themeKey);
    }
  }

  resetDefaults() {
    this.setTheme('theme-cyber-void');

    if (this.parallaxSlider) {
      this.parallaxSlider.value = 1.0;
      if (this.parallaxVal) this.parallaxVal.textContent = '1.0x';
      if (this.parallax) this.parallax.setSensitivity(1.0);
    }

    if (this.lerpSlider) {
      this.lerpSlider.value = 0.05;
      if (this.lerpVal) this.lerpVal.textContent = '0.05';
      if (this.scene) this.scene.config.lerpFactor = 0.05;
    }

    if (this.particlesSlider) {
      this.particlesSlider.value = 8000;
      if (this.particlesVal) this.particlesVal.textContent = '8,000';
      if (this.scene) this.scene.setParticleCount(8000);
    }

    if (this.volumeSlider) {
      this.volumeSlider.value = 70;
      if (this.volumeVal) this.volumeVal.textContent = '70%';
      if (this.sound) this.sound.setVolume(0.7);
    }

    this.modeBtns.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-mode') === 'solid');
    });
    if (this.scene) this.scene.setRenderMode('solid');

    if (this.sound) this.sound.playWarpTone();
  }
}
