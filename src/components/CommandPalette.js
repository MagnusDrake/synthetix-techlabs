export class CommandPalette {
  constructor(appContext) {
    this.app = appContext;
    this.isOpen = false;

    this.palette = document.getElementById('command-palette');
    this.input = document.getElementById('cmd-input');
    this.list = document.getElementById('cmd-list');
    this.log = document.getElementById('cmd-log');
    this.closeBtn = document.getElementById('cmd-close');

    this.commands = [
      { cmd: '/morph brain', desc: 'Morph particle cloud to Neural Cortex Brain Mesh', action: () => this.app.scene.setMorphTarget('brain') },
      { cmd: '/morph dna', desc: 'Morph particle cloud to DNA Double-Helix Lattice', action: () => this.app.scene.setMorphTarget('dna') },
      { cmd: '/morph torus', desc: 'Morph particle cloud to Quantum Torus Singularity', action: () => this.app.scene.setMorphTarget('torus') },
      { cmd: '/morph core', desc: 'Morph particle cloud to Quantum Core Cluster', action: () => this.app.scene.setMorphTarget('core') },
      { cmd: '/theme void', desc: 'Switch spectrum to Cyber Void (Violet/Cyan)', action: () => this.app.hud.setTheme('theme-cyber-void') },
      { cmd: '/theme cyan', desc: 'Switch spectrum to Bioluminescent Cyan', action: () => this.app.hud.setTheme('theme-biolum-cyan') },
      { cmd: '/theme solar', desc: 'Switch spectrum to Solar Flare (Amber/Crimson)', action: () => this.app.hud.setTheme('theme-solar-flare') },
      { cmd: '/theme opal', desc: 'Switch spectrum to Quantum Opal (Iridescent)', action: () => this.app.hud.setTheme('theme-quantum-opal') },
      { cmd: '/burst', desc: 'Trigger high-velocity Quantum Burst expulsion', action: () => this.app.scene.triggerBurst() },
      { cmd: '/rewind on', desc: 'Engage Time Dilation Rewind playback', action: () => this.app.scene.setTimeDilation(-1.0) },
      { cmd: '/rewind off', desc: 'Resume forward real-time physics', action: () => this.app.scene.setTimeDilation(1.0) },
      { cmd: '/wireframe', desc: 'Toggle 3D Core wireframe geometry', action: () => this.app.scene.setRenderMode('wireframe') },
      { cmd: '/solid', desc: 'Restore 3D Core crystal shaded geometry', action: () => this.app.scene.setRenderMode('solid') },
      { cmd: '/audio on', desc: 'Enable synthesized Web Audio drone & FX', action: () => { if (!this.app.sound.isEnabled) this.app.sound.toggle(); } },
      { cmd: '/audio off', desc: 'Mute synthesized audio engine', action: () => { if (this.app.sound.isEnabled) this.app.sound.toggle(); } },
      { cmd: '/voice toggle', desc: 'Toggle Cybernetic AI Voice speech synthesis', action: () => this.app.sound.voice.toggle() },
      { cmd: '/face toggle', desc: 'Toggle Biometric Webcam Head-Tracking Parallax', action: () => this.app.toggleFaceTracking() },
      { cmd: '/ar', desc: 'Launch WebXR Augmented Reality spatial mode', action: () => this.app.scene.launchAR() },
      { cmd: '/help', desc: 'Display all terminal directive commands', action: () => this.printHelp() }
    ];

    this.selectedIndex = 0;
    this.filtered = [...this.commands];

    this.init();
  }

  init() {
    // Keyboard Shortcut (Ctrl+K or Cmd+K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.input) {
      this.input.addEventListener('input', () => this.onFilter());
      this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    this.renderList();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    if (this.palette) {
      this.palette.classList.remove('hidden');
      if (this.input) {
        this.input.value = '';
        this.input.focus();
      }
    }
    this.filtered = [...this.commands];
    this.selectedIndex = 0;
    this.renderList();
    if (this.app.sound) this.app.sound.playClickTone();
  }

  close() {
    this.isOpen = false;
    if (this.palette) {
      this.palette.classList.add('hidden');
    }
  }

  onFilter() {
    const q = this.input.value.trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.commands];
    } else {
      this.filtered = this.commands.filter(c => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
    }
    this.selectedIndex = 0;
    this.renderList();
  }

  onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.filtered.length;
      this.renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + this.filtered.length) % this.filtered.length;
      this.renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.filtered[this.selectedIndex]) {
        this.execute(this.filtered[this.selectedIndex]);
      }
    }
  }

  renderList() {
    if (!this.list) return;
    this.list.innerHTML = '';

    if (this.filtered.length === 0) {
      this.list.innerHTML = `<div class="cmd-empty">NO MATCHING PROTOCOLS FOUND</div>`;
      return;
    }

    this.filtered.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = `cmd-item ${idx === this.selectedIndex ? 'selected' : ''}`;
      item.innerHTML = `
        <span class="cmd-name">${c.cmd}</span>
        <span class="cmd-desc">${c.desc}</span>
      `;
      item.addEventListener('click', () => this.execute(c));
      this.list.appendChild(item);
    });
  }

  execute(c) {
    this.writeLog(`> EXECUTING: ${c.cmd}`);
    if (c.action) {
      c.action();
    }
    if (this.app.sound) {
      this.app.sound.playWarpTone();
      this.app.sound.voice.speak(`Executing protocol ${c.cmd.replace('/', '')}`);
    }
    setTimeout(() => this.close(), 350);
  }

  writeLog(msg) {
    if (this.log) {
      this.log.textContent = msg;
    }
  }

  printHelp() {
    this.writeLog(`> ${this.commands.length} PROTOCOLS AVAILABLE. USE ARROWS TO SELECT.`);
  }
}
