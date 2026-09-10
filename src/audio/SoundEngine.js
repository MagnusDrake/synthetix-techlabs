export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientDroneGain = null;
    this.droneOscs = [];
    this.analyser = null;
    this.freqData = null;
    this.isEnabled = false;
    this.volume = 0.7;

    // AI Voice System
    this.voice = new CyberneticVoice();

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

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Real-time FFT Frequency Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64; // 32 frequency bins
      this.analyser.smoothingTimeConstant = 0.8;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
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
      this.voice.speak('Spatial audio initialized. Quantum frequencies active.');
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

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);

    this.ambientDroneGain.connect(filter);
    filter.connect(this.masterGain);

    const freqs = [55, 110, 164.81];

    this.droneOscs = freqs.map((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
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

  // Returns normalized audio frequency bands: { bass: 0..1, mid: 0..1, treble: 0..1, average: 0..1 }
  getFrequencyBands() {
    if (!this.analyser || !this.freqData || !this.isEnabled) {
      return { bass: 0, mid: 0, treble: 0, average: 0 };
    }

    this.analyser.getByteFrequencyData(this.freqData);

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;
    const len = this.freqData.length;

    // First 4 bins = Bass (0 - 250Hz approx)
    for (let i = 0; i < 4; i++) bassSum += this.freqData[i];
    // Mid bins (4 - 16)
    for (let i = 4; i < 16; i++) midSum += this.freqData[i];
    // Treble bins (16 - 32)
    for (let i = 16; i < len; i++) trebleSum += this.freqData[i];

    const bass = (bassSum / (4 * 255));
    const mid = (midSum / (12 * 255));
    const treble = (trebleSum / ((len - 16) * 255));
    const average = (bass + mid + treble) / 3;

    return { bass, mid, treble, average };
  }
}

/**
 * Cybernetic Robotic Voice Synthesizer
 */
export class CyberneticVoice {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isEnabled = true;
    this.isSpeaking = false;
    this.pitch = 0.85; // slightly lower robotic timbre
    this.rate = 1.05;  // crisp cadence
  }

  speak(text) {
    if (!this.synth || !this.isEnabled) return;

    try {
      // Cancel pending utterance to avoid queue lag
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = this.pitch;
      utterance.rate = this.rate;

      // Select high-tech English voice if available
      const voices = this.synth.getVoices();
      const preferred = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Daniel') || v.name.includes('Samantha')) && v.lang.startsWith('en')
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.speak('Cybernetic speech synthesis online.');
    } else if (this.synth) {
      this.synth.cancel();
    }
    return this.isEnabled;
  }
}
