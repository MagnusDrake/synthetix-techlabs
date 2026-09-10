export class ParallaxController {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;

    // Mouse Normalized (-1 to 1)
    this.mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };

    // Viewport & Cursor Tracking
    this.cursorDot = document.getElementById('cursor-dot');
    this.cursorRing = document.getElementById('cursor-ring');
    this.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Scroll Tracking
    this.scrollProgress = 0;
    this.activeSection = 'hero';

    // Parallax Sensitivity
    this.sensitivity = 1.0;

    // Biometric Head Tracking
    this.biometric = { x: 0, y: 0, z: 0 };

    this.init();
  }

  setBiometricOffset(bx, by, bz) {
    this.biometric.x = bx;
    this.biometric.y = by;
    this.biometric.z = bz;
    if (this.sceneManager) {
      this.sceneManager.setBiometricOffset(bx, by, bz);
    }
  }

  init() {
    this.bindEvents();
    this.updateParallaxLoop();
  }

  bindEvents() {
    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      this.cursorPos.x = e.clientX;
      this.cursorPos.y = e.clientY;

      // Normalized coordinates from -1 (left/top) to +1 (right/bottom)
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;

      if (this.sceneManager) {
        this.sceneManager.setMouse(this.mouse.targetX * this.sensitivity, this.mouse.targetY * this.sensitivity);
      }
    });

    // Touch / Mobile Fallback
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = (touch.clientY / window.innerHeight) * 2 - 1;

        if (this.sceneManager) {
          this.sceneManager.setMouse(this.mouse.targetX * this.sensitivity, this.mouse.targetY * this.sensitivity);
        }
      }
    }, { passive: true });

    // Gyroscope / Device Orientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          // gamma: left-to-right (-90 to 90)
          // beta: front-to-back (-180 to 180)
          const gx = Math.max(-1, Math.min(1, e.gamma / 45));
          const gy = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
          this.mouse.targetX = gx;
          this.mouse.targetY = gy;
          if (this.sceneManager) {
            this.sceneManager.setMouse(gx * this.sensitivity, gy * this.sensitivity);
          }
        }
      });
    }

    // Scroll listener
    window.addEventListener('scroll', () => {
      this.calculateScrollProgress();
    }, { passive: true });

    // Interactive Hover elements for cursor expansion
    const hoverables = document.querySelectorAll('a, button, input, .parallax-card, .tool-btn');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  setSensitivity(val) {
    this.sensitivity = parseFloat(val);
    if (this.sceneManager) {
      this.sceneManager.config.parallaxMultiplier = this.sensitivity;
    }
  }

  calculateScrollProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = totalHeight > 0 ? window.scrollY / totalHeight : 0;

    if (this.sceneManager) {
      this.sceneManager.setScroll(this.scrollProgress);
    }

    // Update active nav links based on scroll position
    const sections = ['hero', 'research', 'diorama', 'sandbox'];
    const currentScrollY = window.scrollY + window.innerHeight * 0.35;

    for (const secId of sections) {
      const el = document.getElementById(secId);
      if (el) {
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (currentScrollY >= top && currentScrollY < bottom) {
          if (this.activeSection !== secId) {
            this.activeSection = secId;
            document.querySelectorAll('.nav-link').forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${secId}`);
            });
          }
          break;
        }
      }
    }
  }

  updateParallaxLoop() {
    requestAnimationFrame(() => this.updateParallaxLoop());

    // 1. Smooth mouse lerp
    const lerp = 0.08;
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * lerp;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * lerp;

    // 2. Cursor dot & ring update with spring delay
    if (this.cursorDot) {
      this.cursorDot.style.transform = `translate(${this.cursorPos.x}px, ${this.cursorPos.y}px)`;
    }
    if (this.cursorRing) {
      this.ringPos.x += (this.cursorPos.x - this.ringPos.x) * 0.18;
      this.ringPos.y += (this.cursorPos.y - this.ringPos.y) * 0.18;
      this.cursorRing.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px)`;
    }

    // Combined coordinates for mouse + biometric head tracking
    const totalX = (this.mouse.x + this.biometric.x * 1.5) * this.sensitivity;
    const totalY = (this.mouse.y + this.biometric.y * 1.5) * this.sensitivity;

    // 3. Update DOM parallax elements in Hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      const offsetX = totalX * 20;
      const offsetY = totalY * 15;
      heroContent.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

      // Subtle inner depth on badges and title
      const depthElements = heroContent.querySelectorAll('[data-depth]');
      depthElements.forEach((el) => {
        const depth = parseFloat(el.getAttribute('data-depth')) || 10;
        const elX = totalX * (depth * 0.6);
        const elY = totalY * (depth * 0.4);
        el.style.transform = `translate3d(${elX}px, ${elY}px, 0)`;
      });
    }

    // Telemetry side box parallax
    const telemetryBox = document.querySelector('.hero-side-telemetry');
    if (telemetryBox) {
      const telX = -totalX * 25;
      const telY = -totalY * 20;
      telemetryBox.style.transform = `translate3d(${telX}px, ${telY}px, 0)`;
    }
  }
}
