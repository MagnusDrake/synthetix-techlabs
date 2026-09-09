export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientDroneGain = null;
    this.droneOscs = [];
    this.isEnabled = false;
    this.volume = 0.7;

    this.toggleBtn = document.getElementById('audio-toggle');
    this.label = document.getElementById('audio-btn-label');

    this.init();
  }

  init() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.ensureContext();
    this.isEnabled = !this.isEnabled;

    if (this.isEnabled) {
      this.startDrone();
      if (this.toggleBtn) this.toggleBtn.classList.add('active');
      if (this.label) this.label.textContent = 'AUDIO: LIVE';
      this.playWarpTone();
    } else {
      this.stopDrone();
      if (this.toggleBtn) this.toggleBtn.classList.remove('active');
      if (this.label) this.label.textContent = 'AUDIO: OFF';
    }
  }

  setVolume(fraction) {
    this.volume = Math.max(0, Math.min(1, fraction));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  startDrone() {
    if (!this.ctx || this.droneOscs.length > 0) return;

    this.ambientDroneGain = this.ctx.createGain();
    this.ambientDroneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.ambientDroneGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);

    // Lowpass filter for warm cosmic ambient
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);

    this.ambientDroneGain.connect(filter);
    filter.connect(this.masterGain);

    // Fundamental + sub + fifth chord
    const freqs = [55, 110, 164.81]; // A1, A2, E3

    this.droneOscs = freqs.map((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for phasing
      osc.detune.setValueAtTime((i - 1) * 3, this.ctx.currentTime);
      osc.connect(this.ambientDroneGain);
      osc.start();
      return osc;
    });
  }

  stopDrone() {
    if (this.ambientDroneGain && this.ctx) {
      this.ambientDroneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        this.droneOscs.forEach(osc => osc.stop());
        this.droneOscs = [];
      }, 500);
    }
  }

  playHoverTone() {
    if (!this.isEnabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Gentle high resonant chime
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playClickTone() {
    if (!this.isEnabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playWarpTone() {
    if (!this.isEnabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }
}
