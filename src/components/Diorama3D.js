export class Diorama3D {
  constructor(stageEl, soundEngine) {
    this.stage = stageEl;
    this.soundEngine = soundEngine;
    this.planes = Array.from(this.stage.querySelectorAll('.diorama-plane'));
    this.expandBtn = document.getElementById('diorama-expand-btn');
    this.resetBtn = document.getElementById('diorama-reset-btn');
    this.legendDots = Array.from(document.querySelectorAll('.legend-dot'));
    this.bar = document.getElementById('diorama-bar');
    this.valDisplay = document.getElementById('diorama-val');

    this.isExpanded = false;
    this.activePlaneIndex = -1; // -1 means all visible
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.bounds = null;
    this.isHovered = false;

    this.init();
  }

  init() {
    this.updatePlanePositions();

    // Mouse events on stage
    this.stage.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.bounds = this.stage.getBoundingClientRect();
    });

    this.stage.addEventListener('mousemove', (e) => {
      if (!this.bounds) this.bounds = this.stage.getBoundingClientRect();
      const x = (e.clientX - this.bounds.left) / this.bounds.width;
      const y = (e.clientY - this.bounds.top) / this.bounds.height;

      this.mouse.targetX = (x * 2 - 1);
      this.mouse.targetY = (y * 2 - 1);

      if (this.valDisplay) {
        const mag = Math.hypot(this.mouse.targetX, this.mouse.targetY).toFixed(2);
        this.valDisplay.textContent = `${mag}x`;
      }
      if (this.bar) {
        const mag = Math.min(100, Math.hypot(this.mouse.targetX, this.mouse.targetY) * 70);
        this.bar.style.width = `${mag}%`;
      }
    });

    this.stage.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.mouse.targetX = 0;
      this.mouse.targetY = 0;
      if (this.valDisplay) this.valDisplay.textContent = '1.0x';
      if (this.bar) this.bar.style.width = '50%';
    });

    // Expand Button
    if (this.expandBtn) {
      this.expandBtn.addEventListener('click', () => {
        this.isExpanded = !this.isExpanded;
        this.expandBtn.textContent = this.isExpanded ? 'COLLAPSE DEPTH' : 'EXPAND DEPTH (Z-SPACING)';
        this.updatePlanePositions();
        if (this.soundEngine) this.soundEngine.playWarpTone();
      });
    }

    // Reset Button
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.isExpanded = false;
        this.activePlaneIndex = -1;
        if (this.expandBtn) this.expandBtn.textContent = 'EXPAND DEPTH (Z-SPACING)';
        this.legendDots.forEach((dot) => dot.classList.remove('active'));
        this.updatePlanePositions();
        if (this.soundEngine) this.soundEngine.playClickTone();
      });
    }

    // Legend Dots
    this.legendDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.legendDots.forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        this.activePlaneIndex = index;
        this.updatePlaneFocus();
        if (this.soundEngine) this.soundEngine.playHoverTone();
      });
    });

    // Animation Loop for smooth tilt & multi-plane parallax
    this.animate();
  }

  updatePlanePositions() {
    const multiplier = this.isExpanded ? 2.2 : 1.0;

    // Plane 1 (index 4 in DOM order): foreground HUD (+120px)
    // Plane 2 (index 3): containment (+60px)
    // Plane 3 (index 2): core (0px)
    // Plane 4 (index 1): heatsink (-60px)
    // Plane 5 (index 0): nebula (-120px)
    const zOffsets = [
      -120 * multiplier,
      -60 * multiplier,
      0,
      60 * multiplier,
      120 * multiplier
    ];

    this.planes.forEach((plane, i) => {
      plane.dataset.baseZ = zOffsets[i];
    });
  }

  updatePlaneFocus() {
    if (this.activePlaneIndex === -1) {
      this.planes.forEach((plane) => {
        plane.style.opacity = '1';
        plane.style.filter = 'none';
      });
      return;
    }

    // Target plane: legend index 0 corresponds to plane 1 (last in DOM: planes[4]), etc.
    const targetDomIndex = 4 - this.activePlaneIndex;

    this.planes.forEach((plane, i) => {
      if (i === targetDomIndex) {
        plane.style.opacity = '1';
        plane.style.filter = 'drop-shadow(0 0 20px var(--accent-primary)) brightness(1.3)';
      } else {
        plane.style.opacity = '0.25';
        plane.style.filter = 'blur(2px)';
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Lerp mouse
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    // Tilt stage
    const rotX = -this.mouse.y * 18;
    const rotY = this.mouse.x * 22;

    this.planes.forEach((plane) => {
      const baseZ = parseFloat(plane.dataset.baseZ) || 0;
      // Parallax translation proportional to Z distance
      const factor = (baseZ + 150) * 0.25;
      const transX = this.mouse.x * factor;
      const transY = this.mouse.y * factor;

      plane.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, ${baseZ}px)`;
    });
  }
}
