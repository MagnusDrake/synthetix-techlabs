/**
 * SYNTHETIX TECHLABS — PROTOCOL: QUANTUM RESONANCE
 * Interactive 3D Particle Decoherence Alignment Puzzle
 */
export class QuantumProtocolGame {
  constructor(sceneManager, soundEngine, appController = null) {
    this.scene = sceneManager;
    this.sound = soundEngine;
    this.app = appController;

    this.isActive = false;
    this.victoryTriggered = false;
    this.timer = 0;
    this.timerInterval = null;
    this.lastPingTime = 0;

    // Target parameters to solve for
    this.target = {
      rotX: 0,
      rotY: 0,
      freq: 520,
      phase: 45
    };

    // Current player inputs
    this.state = {
      rotX: 0,
      rotY: 0,
      freq: 440,
      phase: 0,
      coherence: 0.0
    };

    this.isDragging = false;
    this.lastPointer = { x: 0, y: 0 };
    this.holdNearWinTime = 0;

    this.initDOM();
  }

  initDOM() {
    this.overlay = document.getElementById('quantum-game-overlay');
    this.toggleBtn = document.getElementById('quantum-protocol-btn');
    this.abortBtn = document.getElementById('game-abort-btn');
    this.hintBtn = document.getElementById('game-hint-btn');

    this.coherenceVal = document.getElementById('game-coherence-val');
    this.coherenceBar = document.getElementById('game-coherence-bar');
    this.coherenceStatus = document.getElementById('game-coherence-status');
    this.timerVal = document.getElementById('game-timer-val');

    this.freqSlider = document.getElementById('game-freq-slider');
    this.freqVal = document.getElementById('game-freq-val');
    this.phaseSlider = document.getElementById('game-phase-slider');
    this.phaseVal = document.getElementById('game-phase-val');

    this.trackpad = document.getElementById('game-trackpad');
    this.trackpadCursor = document.getElementById('game-trackpad-cursor');

    this.victoryModal = document.getElementById('game-victory-modal');
    this.victoryTime = document.getElementById('game-victory-time');
    this.victoryReplayBtn = document.getElementById('game-victory-replay');
    this.victoryExitBtn = document.getElementById('game-victory-exit');

    this.bindEvents();
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }

    if (this.abortBtn) {
      this.abortBtn.addEventListener('click', () => this.stop());
    }

    if (this.hintBtn) {
      this.hintBtn.addEventListener('click', () => this.autoAssist());
    }

    if (this.freqSlider) {
      this.freqSlider.addEventListener('input', (e) => {
        this.state.freq = parseFloat(e.target.value);
        if (this.freqVal) this.freqVal.textContent = `${this.state.freq} Hz`;
      });
    }

    if (this.phaseSlider) {
      this.phaseSlider.addEventListener('input', (e) => {
        this.state.phase = parseFloat(e.target.value);
        if (this.phaseVal) this.phaseVal.textContent = `${this.state.phase > 0 ? '+' : ''}${this.state.phase}°`;
      });
    }

    // 3D Gimbal Trackpad & Global Drag
    if (this.trackpad) {
      this.trackpad.addEventListener('mousedown', (e) => this.onDragStart(e));
      window.addEventListener('mousemove', (e) => this.onDragMove(e));
      window.addEventListener('mouseup', () => this.onDragEnd());

      // Touch
      this.trackpad.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) this.onDragStart(e.touches[0]);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) this.onDragMove(e.touches[0]);
      }, { passive: true });
      window.addEventListener('touchend', () => this.onDragEnd());
    }

    if (this.victoryReplayBtn) {
      this.victoryReplayBtn.addEventListener('click', () => {
        if (this.victoryModal) this.victoryModal.classList.remove('active');
        this.start();
      });
    }

    if (this.victoryExitBtn) {
      this.victoryExitBtn.addEventListener('click', () => {
        if (this.victoryModal) this.victoryModal.classList.remove('active');
        this.stop();
      });
    }

    // Escape key to exit
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.stop();
      }
    });
  }

  toggle() {
    if (this.isActive) this.stop();
    else this.start();
  }

  start() {
    this.isActive = true;
    this.victoryTriggered = false;
    this.timer = 0;
    this.holdNearWinTime = 0;

    // Scramble randomized target parameters
    const randomAngles = [-1.4, -0.9, -0.4, 0.4, 0.9, 1.4];
    this.target.rotX = randomAngles[Math.floor(Math.random() * randomAngles.length)];
    this.target.rotY = (Math.random() * 2 - 1) * Math.PI * 0.75;
    this.target.freq = Math.round(250 + Math.random() * 500); // 250 - 750 Hz
    this.target.phase = Math.round((Math.random() * 2 - 1) * 140); // -140° to +140°

    // Initialize player state with offset
    this.state.rotX = 0;
    this.state.rotY = 0;
    this.state.freq = 440;
    this.state.phase = 0;

    if (this.freqSlider) this.freqSlider.value = 440;
    if (this.freqVal) this.freqVal.textContent = '440 Hz';
    if (this.phaseSlider) this.phaseSlider.value = 0;
    if (this.phaseVal) this.phaseVal.textContent = '0°';

    // Update SceneManager
    if (this.scene) {
      this.scene.gameProtocol.isActive = true;
      this.scene.gameProtocol.chaosFactor = 1.0;
      this.scene.gameProtocol.rotX = 0;
      this.scene.gameProtocol.rotY = 0;
      this.scene.gameProtocol.currentFreq = 440;
      // Start in Core or Brain formation for puzzle alignment
      this.scene.setMorphTarget('core');
    }

    // Toggle page styles for cinematic focus
    document.body.classList.add('game-mode-active');
    if (this.overlay) this.overlay.classList.add('active');
    if (this.victoryModal) this.victoryModal.classList.remove('active');

    // Start timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer += 0.1;
      if (this.timerVal) this.timerVal.textContent = this.timer.toFixed(1) + 's';
    }, 100);

    // Audio announcement
    if (this.sound && this.sound.voice) {
      this.sound.voice.speak('Quantum decoherence detected. Vector alignment protocol engaged.');
    }

    this.runGameLoop();
  }

  stop() {
    this.isActive = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (this.scene) {
      this.scene.gameProtocol.isActive = false;
      this.scene.gameProtocol.chaosFactor = 0.0;
    }

    document.body.classList.remove('game-mode-active');
    if (this.overlay) this.overlay.classList.remove('active');
    if (this.victoryModal) this.victoryModal.classList.remove('active');
  }

  onDragStart(e) {
    this.isDragging = true;
    this.lastPointer = { x: e.clientX, y: e.clientY };
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastPointer.x;
    const dy = e.clientY - this.lastPointer.y;
    this.lastPointer = { x: e.clientX, y: e.clientY };

    // Update gimbal rotations
    this.state.rotY += dx * 0.008;
    this.state.rotX += dy * 0.008;

    // Clamp X rotation to prevent flipping upside down
    this.state.rotX = Math.max(-Math.PI * 0.6, Math.min(Math.PI * 0.6, this.state.rotX));

    // Update trackpad reticle graphic
    if (this.trackpadCursor) {
      const px = ((this.state.rotY % (Math.PI * 2)) / (Math.PI * 2)) * 60;
      const py = (this.state.rotX / (Math.PI * 0.6)) * 40;
      this.trackpadCursor.style.transform = `translate(${px}px, ${py}px)`;
    }
  }

  onDragEnd() {
    this.isDragging = false;
  }

  autoAssist() {
    if (!this.isActive || this.victoryTriggered) return;

    // Hint: nudge each parameter 40% closer to the target
    this.state.rotX += (this.target.rotX - this.state.rotX) * 0.4;
    this.state.rotY += (this.target.rotY - this.state.rotY) * 0.4;
    this.state.freq += (this.target.freq - this.state.freq) * 0.4;
    this.state.phase += (this.target.phase - this.state.phase) * 0.4;

    this.state.freq = Math.round(this.state.freq);
    this.state.phase = Math.round(this.state.phase);

    if (this.freqSlider) this.freqSlider.value = this.state.freq;
    if (this.freqVal) this.freqVal.textContent = `${this.state.freq} Hz`;
    if (this.phaseSlider) this.phaseSlider.value = this.state.phase;
    if (this.phaseVal) this.phaseVal.textContent = `${this.state.phase > 0 ? '+' : ''}${this.state.phase}°`;

    if (this.sound) this.sound.playClickTone();
  }

  runGameLoop() {
    if (!this.isActive) return;

    requestAnimationFrame(() => this.runGameLoop());

    // 1. Calculate Angular Distance between player gimbal and target gimbal
    const dX = this.state.rotX - this.target.rotX;
    // Circular angle distance on Y
    let dY = Math.abs((this.state.rotY - this.target.rotY) % (Math.PI * 2));
    if (dY > Math.PI) dY = Math.PI * 2 - dY;
    const angDist = Math.hypot(dX, dY);
    const rotCoherence = Math.max(0, 1.0 - angDist / (Math.PI * 0.9));

    // 2. Frequency Distance
    const freqDiff = Math.abs(this.state.freq - this.target.freq);
    const freqCoherence = Math.max(0, 1.0 - freqDiff / 320.0);

    // 3. Phase Distance
    const phaseDiff = Math.abs(this.state.phase - this.target.phase);
    const phaseCoherence = Math.max(0, 1.0 - phaseDiff / 180.0);

    // 4. Combined Coherence (Weighted: Rot 45%, Freq 35%, Phase 20%)
    const rawCoherence = rotCoherence * 0.45 + freqCoherence * 0.35 + phaseCoherence * 0.20;
    // Non-linear visual curve for high-stakes tension near 100%
    const curvedCoherence = Math.pow(rawCoherence, 1.25);
    const coherencePercent = Math.min(100, Math.max(0, curvedCoherence * 100));

    this.state.coherence = coherencePercent;

    // 5. Feed into SceneManager
    if (this.scene) {
      this.scene.gameProtocol.rotX = this.state.rotX;
      this.scene.gameProtocol.rotY = this.state.rotY;
      this.scene.gameProtocol.currentFreq = this.state.freq;
      this.scene.gameProtocol.coherence = curvedCoherence;
      // High coherence smoothly collapses chaotic wave perturbations
      this.scene.gameProtocol.chaosFactor = Math.max(0, 1.0 - curvedCoherence);
    }

    // 6. Update HUD Elements
    if (this.coherenceVal) {
      this.coherenceVal.textContent = `${coherencePercent.toFixed(1)}%`;
      if (coherencePercent < 45) {
        this.coherenceVal.className = 'coherence-num critical';
        if (this.coherenceStatus) this.coherenceStatus.textContent = 'DECOHERENCE CRITICAL // AXES DRIFTING';
      } else if (coherencePercent < 80) {
        this.coherenceVal.className = 'coherence-num resolving';
        if (this.coherenceStatus) this.coherenceStatus.textContent = 'HARMONIC LOCK IN PROGRESS';
      } else {
        this.coherenceVal.className = 'coherence-num resonance';
        if (this.coherenceStatus) this.coherenceStatus.textContent = 'SUPERPOSITION STABILIZING // RESONANCE IMMINENT';
      }
    }

    if (this.coherenceBar) {
      this.coherenceBar.style.width = `${coherencePercent}%`;
    }

    // 7. Proximity Audio Ping (frequency proportional to alignment)
    const now = performance.now();
    const pingInterval = 1200 - curvedCoherence * 800; // 1200ms down to 400ms
    if (now - this.lastPingTime > pingInterval && !this.victoryTriggered) {
      this.lastPingTime = now;
      if (this.sound) {
        this.sound.playProximityPing(curvedCoherence);
        if (curvedCoherence > 0.6) {
          this.sound.playCoherencePulse(curvedCoherence);
        }
      }
    }

    // 8. Win Condition: Coherence >= 96% for ~0.35s
    if (curvedCoherence >= 0.96 && !this.victoryTriggered) {
      this.holdNearWinTime += 0.016;
      if (this.holdNearWinTime >= 0.35) {
        this.triggerVictory();
      }
    } else {
      this.holdNearWinTime = 0;
    }
  }

  triggerVictory() {
    this.victoryTriggered = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    // 1. Particle Explosion Shockwave Burst
    if (this.scene) {
      this.scene.triggerBurst();
      // Snap to 4D Hypercube Tesseract!
      this.scene.setMorphTarget('tesseract');
      this.scene.gameProtocol.chaosFactor = 0.0;
    }

    // 2. Triumphant Audio & Voice Fanfare
    if (this.sound) {
      this.sound.playVictoryFanfare();
    }

    // 3. Display Victory Modal
    setTimeout(() => {
      if (this.victoryModal) {
        this.victoryModal.classList.add('active');
        if (this.victoryTime) {
          this.victoryTime.textContent = this.timer.toFixed(1) + 's';
        }
      }
    }, 1200);
  }
}
