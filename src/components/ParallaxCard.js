export class ParallaxCard {
  constructor(cardEl, soundEngine) {
    this.card = cardEl;
    this.soundEngine = soundEngine;
    this.glare = this.card.querySelector('.card-glare');
    this.layers = this.card.querySelectorAll('[data-depth]');

    this.maxTilt = parseFloat(this.card.getAttribute('data-tilt-max')) || 20;
    this.bounds = null;
    this.isHovered = false;

    this.init();
  }

  init() {
    this.card.addEventListener('mouseenter', (e) => this.onMouseEnter(e));
    this.card.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.card.addEventListener('mouseleave', () => this.onMouseLeave());
    this.card.addEventListener('click', () => this.onClick());
  }

  updateBounds() {
    this.bounds = this.card.getBoundingClientRect();
  }

  onMouseEnter(e) {
    this.isHovered = true;
    this.updateBounds();
    this.card.style.transition = 'none';

    if (this.soundEngine) {
      this.soundEngine.playHoverTone();
    }
  }

  onMouseMove(e) {
    if (!this.isHovered || !this.bounds) return;

    // Relative coordinates within card
    const x = e.clientX - this.bounds.left;
    const y = e.clientY - this.bounds.top;

    // Normalized from -1 to 1
    const normX = (x / this.bounds.width) * 2 - 1;
    const normY = (y / this.bounds.height) * 2 - 1;

    // Rotations: moving mouse right tilts card left-to-right (positive rotateY)
    // Moving mouse down tilts top away (negative rotateX)
    const rotX = -normY * this.maxTilt;
    const rotY = normX * this.maxTilt;

    // Apply 3D transform to card
    this.card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    // Update specular glare
    if (this.glare) {
      const glareX = (x / this.bounds.width) * 100;
      const glareY = (y / this.bounds.height) * 100;
      this.glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 65%)`;
    }

    // Apply internal multi-layer 3D displacement
    this.layers.forEach((layer) => {
      const depth = parseFloat(layer.getAttribute('data-depth')) || 20;
      const transX = normX * (depth * 0.4);
      const transY = normY * (depth * 0.4);
      const transZ = depth;

      layer.style.transform = `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, ${transZ}px)`;
    });
  }

  onMouseLeave() {
    this.isHovered = false;
    this.card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    this.card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    // Reset layers
    this.layers.forEach((layer) => {
      layer.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      layer.style.transform = 'translate3d(0, 0, 0)';
    });

    // Reset transition after ease finishes
    setTimeout(() => {
      if (!this.isHovered) {
        this.layers.forEach((layer) => {
          layer.style.transition = '';
        });
      }
    }, 600);
  }

  onClick() {
    if (this.soundEngine) {
      this.soundEngine.playClickTone();
    }
  }

  static initAll(soundEngine) {
    const cardEls = document.querySelectorAll('.parallax-card');
    return Array.from(cardEls).map((el) => new ParallaxCard(el, soundEngine));
  }
}
