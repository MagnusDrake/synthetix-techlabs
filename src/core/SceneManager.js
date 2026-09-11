import * as THREE from 'three';

export class SceneManager {
  constructor(canvas, soundEngine = null) {
    this.canvas = canvas;
    this.soundEngine = soundEngine;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Configuration & Physics State
    this.config = {
      parallaxMultiplier: 1.0,
      lerpFactor: 0.05,
      renderMode: 'solid', // 'solid', 'wireframe', 'points'
      particleCount: 8000,
      themeColors: {
        primary: 0x00f0ff,
        secondary: 0x8a2be2,
        ambient: 0x080b18
      }
    };

    // Normalized Mouse Coordinates (-1 to 1)
    this.mouse = {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 }
    };

    // Biometric Head Offset (-1 to 1)
    this.biometric = {
      x: 0,
      y: 0,
      z: 0
    };

    // Scroll Progress (0 to 1)
    this.scroll = {
      current: 0,
      target: 0
    };

    // Warp Impulse State
    this.warp = {
      factor: 0,
      speed: 1.0,
      inverted: false
    };

    // Particle Morph Targets State
    this.morph = {
      currentTarget: 'core',
      targetName: 'core',
      progress: 1.0,
      speed: 1.8
    };

    // Time Dilation / Rewind State
    this.timeDilation = {
      rate: 1.0, // 1.0 = normal, 0 = freeze, -1 = reverse, scrubber 0..1
      isRewinding: false,
      historyMax: 180,
      history: [],
      historyIndex: 0
    };

    // Burst Shockwave & Camera Recoil
    this.cameraShake = 0;
    this.flashIntensity = 0;
    this.isBursting = false;
    this.burstEnergy = 0;

    // Quantum Protocol Game State & Chaotic Wave Injection
    this.gameProtocol = {
      isActive: false,
      coherence: 0.0,
      chaosFactor: 0.0,
      currentFreq: 440,
      rotX: 0,
      rotY: 0
    };

    this.clock = new THREE.Clock();
    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060810, 0.012);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 18);
    this.cameraBaseZ = 18;

    // 3. Renderer with WebXR support
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    if (navigator.xr) {
      this.renderer.xr.enabled = true;
    }

    // 4. Lighting
    this.setupLights();

    // 5. 3D Elements
    this.createSynthetixCore();
    this.createGyroscopicRings();
    this.createFloatingShards();
    this.createShockwaveMesh();
    this.createCosmicDustField();
    this.initParticleMorphTargets();
    this.createFilamentNetwork();

    // 6. Window Resize
    window.addEventListener('resize', () => this.onResize());

    // 7. Start Render Loop
    this.animate();
  }

  createShockwaveMesh() {
    const shockGeo = new THREE.RingGeometry(0.2, 2.2, 64);
    this.shockwaveMat = new THREE.MeshBasicMaterial({
      color: this.config.themeColors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.shockwave = new THREE.Mesh(shockGeo, this.shockwaveMat);
    this.shockwave.renderOrder = 999;
    this.shockwave.visible = false;
    this.scene.add(this.shockwave);
  }

  createParticleGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(0, 240, 255, 0.9)');
    grad.addColorStop(0.5, 'rgba(138, 43, 226, 0.4)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    // Cross-flare anamorphic laser spike
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(32, 10); ctx.lineTo(32, 54);
    ctx.moveTo(10, 32); ctx.lineTo(54, 32);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  createCosmicDustField() {
    const count = 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(this.config.themeColors.primary);
    const c2 = new THREE.Color(this.config.themeColors.secondary);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 25 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i3] = r * Math.cos(theta) * Math.cos(phi);
      positions[i3 + 1] = r * Math.sin(phi);
      positions[i3 + 2] = r * Math.sin(theta) * Math.cos(phi);

      const col = Math.random() > 0.5 ? c1 : c2;
      colors[i3] = col.r * 0.6;
      colors[i3 + 1] = col.g * 0.6;
      colors[i3 + 2] = col.b * 0.6;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dustSystem = new THREE.Points(geo, mat);
    this.scene.add(this.dustSystem);
  }

  createFilamentNetwork() {
    const maxLines = 300;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxLines * 2 * 3);
    const colors = new Float32Array(maxLines * 2 * 3);

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.filamentMesh = new THREE.LineSegments(geo, mat);
    this.scene.add(this.filamentMesh);
  }

  updateFilaments() {
    if (!this.filamentMesh || !this.particleGeo) return;
    const posAttr = this.particleGeo.getAttribute('position');
    const positions = posAttr.array;
    const linePosAttr = this.filamentMesh.geometry.getAttribute('position');
    const linePositions = linePosAttr.array;
    const lineColAttr = this.filamentMesh.geometry.getAttribute('color');
    const lineColors = lineColAttr.array;

    const sampleStep = Math.max(1, Math.floor((positions.length / 3) / 100));
    let lineIdx = 0;
    const maxLines = 250;
    const maxDistSq = 12 * 12;

    const colPrimary = new THREE.Color(this.config.themeColors.primary);
    const colSecondary = new THREE.Color(this.config.themeColors.secondary);

    for (let i = 0; i < positions.length / 3 && lineIdx < maxLines; i += sampleStep) {
      const i3 = i * 3;
      const x1 = positions[i3];
      const y1 = positions[i3 + 1];
      const z1 = positions[i3 + 2];

      for (let j = i + sampleStep; j < positions.length / 3 && lineIdx < maxLines; j += sampleStep * 2) {
        const j3 = j * 3;
        const dx = positions[j3] - x1;
        const dy = positions[j3 + 1] - y1;
        const dz = positions[j3 + 2] - z1;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistSq && distSq > 3.0) {
          const pIdx = lineIdx * 6;
          linePositions[pIdx] = x1;
          linePositions[pIdx + 1] = y1;
          linePositions[pIdx + 2] = z1;
          linePositions[pIdx + 3] = positions[j3];
          linePositions[pIdx + 4] = positions[j3 + 1];
          linePositions[pIdx + 5] = positions[j3 + 2];

          const alpha = 1.0 - Math.sqrt(distSq) / 12;
          const c = lineIdx % 2 === 0 ? colPrimary : colSecondary;
          lineColors[pIdx] = c.r * alpha;
          lineColors[pIdx + 1] = c.g * alpha;
          lineColors[pIdx + 2] = c.b * alpha;
          lineColors[pIdx + 3] = c.r * alpha;
          lineColors[pIdx + 4] = c.g * alpha;
          lineColors[pIdx + 5] = c.b * alpha;

          lineIdx++;
        }
      }
    }

    this.filamentMesh.geometry.setDrawRange(0, lineIdx * 2);
    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(this.config.themeColors.ambient, 2.5);
    this.scene.add(this.ambientLight);

    // Dynamic mouse-tracking primary point light
    this.mousePointLight = new THREE.PointLight(this.config.themeColors.primary, 8, 35);
    this.mousePointLight.position.set(0, 0, 10);
    this.scene.add(this.mousePointLight);

    // Secondary directional fill light
    this.secondaryLight = new THREE.DirectionalLight(this.config.themeColors.secondary, 2.8);
    this.secondaryLight.position.set(-12, 12, -6);
    this.scene.add(this.secondaryLight);

    // Back rim light
    this.rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.rimLight.position.set(0, -10, -15);
    this.scene.add(this.rimLight);
  }

  createSynthetixCore() {
    this.coreGroup = new THREE.Group();

    // Optical Glass Refraction Material (Caustics & Transmission)
    const innerGeo = new THREE.IcosahedronGeometry(3.2, 0);
    this.coreMaterial = new THREE.MeshPhysicalMaterial({
      color: this.config.themeColors.primary,
      emissive: this.config.themeColors.secondary,
      emissiveIntensity: 0.35,
      roughness: 0.08,
      metalness: 0.15,
      transmission: 0.92, // Real-time optical transmission!
      thickness: 2.6,     // Refraction thickness
      ior: 1.54,          // Glass IOR
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      wireframe: false
    });

    this.coreMesh = new THREE.Mesh(innerGeo, this.coreMaterial);
    this.coreGroup.add(this.coreMesh);

    // Outer wireframe cage
    const outerGeo = new THREE.IcosahedronGeometry(4.0, 1);
    this.cageMaterial = new THREE.MeshBasicMaterial({
      color: this.config.themeColors.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.cageMesh = new THREE.Mesh(outerGeo, this.cageMaterial);
    this.coreGroup.add(this.cageMesh);

    // Core point matrix
    const pointsGeo = new THREE.IcosahedronGeometry(3.6, 2);
    this.pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.75
    });
    this.pointsMesh = new THREE.Points(pointsGeo, this.pointsMaterial);
    this.coreGroup.add(this.pointsMesh);

    this.scene.add(this.coreGroup);
  }

  createGyroscopicRings() {
    this.ringGroup = new THREE.Group();

    const ringMat1 = new THREE.MeshStandardMaterial({
      color: this.config.themeColors.primary,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true
    });

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: this.config.themeColors.secondary,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true
    });

    this.ring1 = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.08, 16, 100), ringMat1);
    this.ring2 = new THREE.Mesh(new THREE.TorusGeometry(7.6, 0.08, 16, 100), ringMat2);
    this.ring3 = new THREE.Mesh(new THREE.TorusGeometry(9.0, 0.08, 16, 100), ringMat1);

    this.ringGroup.add(this.ring1);
    this.ringGroup.add(this.ring2);
    this.ringGroup.add(this.ring3);

    this.scene.add(this.ringGroup);
  }

  createFloatingShards() {
    this.shardsGroup = new THREE.Group();
    const shardCount = 28;
    this.shards = [];
    const shardGeo = new THREE.OctahedronGeometry(0.7, 0);

    for (let i = 0; i < shardCount; i++) {
      const mat = new THREE.MeshPhysicalMaterial({
        color: (i % 2 === 0) ? this.config.themeColors.primary : this.config.themeColors.secondary,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.85,
        thickness: 1.5,
        ior: 1.5,
        transparent: true,
        opacity: 0.8
      });

      const shard = new THREE.Mesh(shardGeo, mat);
      const radius = 10 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 1.2;

      const sx = radius * Math.cos(theta) * Math.cos(phi);
      const sy = radius * Math.sin(phi);
      const sz = Math.min(6, (Math.random() - 0.5) * 20);

      shard.position.set(sx, sy, sz);
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      shard.scale.setScalar(0.3 + Math.random() * 0.5);

      shard.userData = {
        basePos: shard.position.clone(),
        orbitSpeed: (Math.random() - 0.5) * 0.4,
        rotSpeedX: (Math.random() - 0.5) * 1.5,
        rotSpeedY: (Math.random() - 0.5) * 1.5,
        phase: Math.random() * Math.PI * 2
      };

      this.shards.push(shard);
      this.shardsGroup.add(shard);
    }

    this.scene.add(this.shardsGroup);
  }

  /**
   * Generates mathematical 3D coordinates for all 4 morph targets:
   * 1. Quantum Core Cluster
   * 2. Neural Cortex Brain Mesh
   * 3. DNA Double-Helix Lattice
   * 4. Torus Singularity
   */
  initParticleMorphTargets() {
    const count = this.config.particleCount;
    this.targetBuffers = {
      core: new Float32Array(count * 3),
      brain: new Float32Array(count * 3),
      dna: new Float32Array(count * 3),
      torus: new Float32Array(count * 3)
    };

    // 1. Target: Core (Volumetric cluster around origin)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 5 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 80;

      this.targetBuffers.core[i3] = Math.cos(theta) * r;
      this.targetBuffers.core[i3 + 1] = Math.sin(theta) * r;
      this.targetBuffers.core[i3 + 2] = z;
    }

    // 2. Target: Neural Brain Cortex (Dual-hemisphere synaptic convolutions)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const hemisphere = i % 2 === 0 ? 1 : -1;
      const u = Math.random() * Math.PI;
      const v = (Math.random() - 0.5) * Math.PI;

      // Brain cortex folds & folds
      const fold = Math.sin(u * 6) * Math.cos(v * 6) * 0.8;
      const bx = hemisphere * (1.8 + Math.cos(v) * (4.5 + fold));
      const by = Math.sin(v) * (5.5 + fold);
      const bz = Math.sin(u) * Math.cos(v) * (6.0 + fold);

      this.targetBuffers.brain[i3] = bx * 1.5;
      this.targetBuffers.brain[i3 + 1] = by * 1.5;
      this.targetBuffers.brain[i3 + 2] = bz * 1.5;
    }

    // 3. Target: DNA Double-Helix (Twisting helical ladder with base rungs)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = (i / count) * Math.PI * 18 - Math.PI * 9;
      const y = t * 2.2;
      const isRung = Math.random() > 0.65;

      if (isRung) {
        // Horizontal connecting base pairs
        const frac = Math.random() * 2 - 1;
        const radius = 6 * frac;
        this.targetBuffers.dna[i3] = Math.cos(t) * radius;
        this.targetBuffers.dna[i3 + 1] = y;
        this.targetBuffers.dna[i3 + 2] = Math.sin(t) * radius;
      } else {
        // Strand 1 or Strand 2 (180 deg offset)
        const strandOffset = (i % 2 === 0) ? 0 : Math.PI;
        const radius = 6.2;
        this.targetBuffers.dna[i3] = Math.cos(t + strandOffset) * radius;
        this.targetBuffers.dna[i3 + 1] = y;
        this.targetBuffers.dna[i3 + 2] = Math.sin(t + strandOffset) * radius;
      }
    }

    // 4. Target: Torus Singularity Vortex
    const R = 11.0;
    const r = 4.2;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;

      this.targetBuffers.torus[i3] = (R + r * Math.cos(v)) * Math.cos(u);
      this.targetBuffers.torus[i3 + 1] = r * Math.sin(v) * 1.4;
      this.targetBuffers.torus[i3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
    }

    // 5. Target: 4D Hypercube Tesseract (Inner cube, Outer cube, 8 Hyperspatial struts)
    this.targetBuffers.tesseract = new Float32Array(count * 3);
    const innerSize = 5.2;
    const outerSize = 11.8;
    const corners = [];
    for (let cx of [-1, 1]) {
      for (let cy of [-1, 1]) {
        for (let cz of [-1, 1]) {
          corners.push({
            in: new THREE.Vector3(cx * innerSize, cy * innerSize, cz * innerSize),
            out: new THREE.Vector3(cx * outerSize, cy * outerSize, cz * outerSize)
          });
        }
      }
    }

    const edges = [];
    // 8 Connecting 4D Struts
    for (let c of corners) {
      edges.push([c.in, c.out]);
    }
    // 12 Inner and 12 Outer Cube Edges
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        const cA = corners[i].in;
        const cB = corners[j].in;
        const diffs = (cA.x !== cB.x ? 1 : 0) + (cA.y !== cB.y ? 1 : 0) + (cA.z !== cB.z ? 1 : 0);
        if (diffs === 1) {
          edges.push([cA, cB]);
          edges.push([corners[i].out, corners[j].out]);
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const edge = edges[i % edges.length];
      const t = Math.random();
      const p = new THREE.Vector3().lerpVectors(edge[0], edge[1], t);
      const fuzz = 0.35;
      this.targetBuffers.tesseract[i3] = p.x + (Math.random() - 0.5) * fuzz;
      this.targetBuffers.tesseract[i3 + 1] = p.y + (Math.random() - 0.5) * fuzz;
      this.targetBuffers.tesseract[i3 + 2] = p.z + (Math.random() - 0.5) * fuzz;
    }

    // Initialize particle geometry with current target
    this.createParticleField(count);
  }

  createParticleField(count = this.config.particleCount) {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleGeo.dispose();
      this.particleMat.dispose();
    }

    this.particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sourcePositions = new Float32Array(count * 3);

    const initialBuffer = this.targetBuffers[this.morph.currentTarget] || this.targetBuffers.core;
    positions.set(initialBuffer);
    sourcePositions.set(initialBuffer);

    const colPrimary = new THREE.Color(this.config.themeColors.primary);
    const colSecondary = new THREE.Color(this.config.themeColors.secondary);
    const colWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const rand = Math.random();
      let c = colPrimary;
      if (rand > 0.65) c = colSecondary;
      else if (rand > 0.94) c = colWhite;

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeo.userData = { sourcePositions };

    const glowTex = this.createParticleGlowTexture();
    this.particleMat = new THREE.PointsMaterial({
      size: 0.28,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particleSystem);
  }

  setMorphTarget(targetName) {
    if (!this.targetBuffers[targetName] || this.morph.targetName === targetName) return;

    // Snapshot current rendered positions as source
    const posAttr = this.particleGeo.getAttribute('position');
    const sourcePositions = this.particleGeo.userData.sourcePositions;
    sourcePositions.set(posAttr.array);

    this.morph.currentTarget = this.morph.targetName;
    this.morph.targetName = targetName;
    this.morph.progress = 0.0;

    if (this.soundEngine && this.soundEngine.voice) {
      const names = {
        core: 'Quantum Core Cluster',
        brain: 'Neural Cortex Brain Mesh',
        dna: 'DNA Double Helix Lattice',
        torus: 'Quantum Torus Singularity',
        tesseract: '4D Hypercube Tesseract Singularity'
      };
      this.soundEngine.voice.speak(`Morphing particle field to ${names[targetName] || targetName}`);
    }
  }

  setTimeDilation(rate) {
    this.timeDilation.rate = rate;
    this.timeDilation.isRewinding = rate < 0;

    const overlay = document.getElementById('time-rewind-overlay');
    if (overlay) {
      overlay.classList.toggle('active', rate < 0);
    }
  }

  setBiometricOffset(x, y, z) {
    this.biometric.x = x;
    this.biometric.y = y;
    this.biometric.z = z;
  }

  setTheme(themeKey) {
    const themes = {
      'theme-cyber-void': { primary: 0x00f0ff, secondary: 0x8a2be2, ambient: 0x080b18 },
      'theme-biolum-cyan': { primary: 0x00ffcc, secondary: 0x0088ff, ambient: 0x030f14 },
      'theme-solar-flare': { primary: 0xff9900, secondary: 0xff2a2a, ambient: 0x140603 },
      'theme-quantum-opal': { primary: 0xc084fc, secondary: 0x67e8f9, ambient: 0x0a0b16 }
    };

    const t = themes[themeKey] || themes['theme-cyber-void'];
    this.config.themeColors = t;

    this.mousePointLight.color.setHex(t.primary);
    this.secondaryLight.color.setHex(t.secondary);
    this.ambientLight.color.setHex(t.ambient);

    this.coreMaterial.color.setHex(t.primary);
    this.coreMaterial.emissive.setHex(t.secondary);
    this.cageMaterial.color.setHex(t.primary);

    this.ring1.material.color.setHex(t.primary);
    this.ring2.material.color.setHex(t.secondary);
    this.ring3.material.color.setHex(t.primary);

    this.createParticleField(this.config.particleCount);
  }

  setRenderMode(mode) {
    this.config.renderMode = mode;
    if (mode === 'solid') {
      this.coreMaterial.wireframe = false;
      this.cageMesh.visible = true;
      this.pointsMesh.visible = true;
    } else if (mode === 'wireframe') {
      this.coreMaterial.wireframe = true;
      this.cageMesh.visible = true;
      this.pointsMesh.visible = false;
    } else if (mode === 'points') {
      this.coreMaterial.wireframe = false;
      this.cageMesh.visible = false;
      this.pointsMesh.visible = true;
    }
  }

  setParticleCount(count) {
    this.config.particleCount = count;
    this.initParticleMorphTargets();
  }

  triggerBurst() {
    this.warp.factor = 8.0;
    this.cameraShake = 3.2;
    this.flashIntensity = 70.0;
    this.isBursting = true;
    this.burstEnergy = 1.0;

    // 1. High-Velocity Radial Particle Expulsion
    if (this.particleGeo) {
      const posAttr = this.particleGeo.getAttribute('position');
      const positions = posAttr.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        let x = positions[i3];
        let y = positions[i3 + 1];
        let z = positions[i3 + 2];
        let len = Math.hypot(x, y, z);

        if (len < 0.1) {
          x = (Math.random() - 0.5) * 2;
          y = (Math.random() - 0.5) * 2;
          z = (Math.random() - 0.5) * 2;
          len = Math.hypot(x, y, z);
        }

        // Violent radial expulsion outward away from origin
        const force = 28.0 + Math.random() * 42.0;
        positions[i3] += (x / len) * force;
        positions[i3 + 1] += (y / len) * force;
        positions[i3 + 2] += (z / len) * force;
      }
      posAttr.needsUpdate = true;
    }

    // 2. Glowing Shockwave Mesh Setup
    if (this.shockwave) {
      this.shockwave.visible = true;
      this.shockwave.scale.set(0.1, 0.1, 0.1);
      this.shockwave.position.set(0, 0, 0);
      if (this.shockwaveMat) {
        this.shockwaveMat.opacity = 1.0;
      }
    }

    // 3. Core Mesh Kinetic Expansion Recoil
    if (this.coreMesh) {
      this.coreMesh.scale.setScalar(3.2);
    }
    if (this.cageMesh) {
      this.cageMesh.scale.setScalar(3.8);
    }

    // 4. Audio FX & AI Voice Alert
    if (this.soundEngine) {
      this.soundEngine.playExplosionTone();
    }
  }

  invertPolarity() {
    this.warp.inverted = !this.warp.inverted;
  }

  setMouse(targetX, targetY) {
    this.mouse.target.x = targetX;
    this.mouse.target.y = targetY;
  }

  setScroll(progress) {
    this.scroll.target = progress;
  }

  launchAR() {
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-ar').then(supported => {
        if (supported) {
          navigator.xr.requestSession('immersive-ar').then(session => {
            this.renderer.xr.setSession(session);
          });
        } else {
          alert('WebXR AR not supported on this display device. Try opening on a WebXR-compatible mobile browser or headset.');
        }
      });
    } else {
      alert('WebXR immersive spatial API is not available on this browser. Chrome on Android or Apple Vision Pro recommended.');
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Audio-Reactive Frequency Analysis
    let audioFreqs = { bass: 0, mid: 0, treble: 0, average: 0 };
    if (this.soundEngine) {
      audioFreqs = this.soundEngine.getFrequencyBands();
    }

    // 2. Mouse & Biometric Parallax Combined
    const lerp = this.config.lerpFactor;
    // Combine mouse and webcam head tracking if active
    const effectiveTargetX = this.mouse.target.x + this.biometric.x * 1.5;
    const effectiveTargetY = this.mouse.target.y + this.biometric.y * 1.5;

    this.mouse.current.x += (effectiveTargetX - this.mouse.current.x) * lerp;
    this.mouse.current.y += (effectiveTargetY - this.mouse.current.y) * lerp;

    this.scroll.current += (this.scroll.target - this.scroll.current) * lerp;

    // Camera trajectory
    const pStrength = this.config.parallaxMultiplier;
    const mouseOffsetX = this.mouse.current.x * 4 * pStrength;
    const mouseOffsetY = this.mouse.current.y * 3 * pStrength;

    const scrollZ = this.cameraBaseZ - (this.scroll.current * 28);
    const scrollX = Math.sin(this.scroll.current * Math.PI * 2) * 5;
    const scrollY = -this.scroll.current * 10;

    if (this.gameProtocol.isActive) {
      this.camera.position.x += (0 - this.camera.position.x) * 0.08;
      this.camera.position.y += (0 - this.camera.position.y) * 0.08;
      this.camera.position.z += (22 - this.camera.position.z) * 0.08;
      this.camera.lookAt(0, 0, 0);
    } else {
      this.camera.position.x = scrollX + mouseOffsetX;
      this.camera.position.y = scrollY - mouseOffsetY;
      this.camera.position.z = scrollZ - (this.biometric.z ? (this.biometric.z - 1) * 6 : 0);

      // Camera shake recoil from quantum burst
      if (this.cameraShake > 0.001) {
        this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
        this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
        this.camera.position.z += (Math.random() - 0.5) * this.cameraShake;
        this.cameraShake *= Math.pow(0.04, delta);
        if (this.cameraShake < 0.001) this.cameraShake = 0;
      }

      const lookTarget = new THREE.Vector3(
        mouseOffsetX * 0.4,
        scrollY * 0.9 - mouseOffsetY * 0.4,
        scrollZ - 15
      );
      this.camera.lookAt(lookTarget);
      this.camera.rotation.z = -this.mouse.current.x * 0.06 * pStrength;
    }

    // Cosmic Micro-Dust Orbit
    if (this.dustSystem) {
      this.dustSystem.rotation.y += delta * 0.025 * this.timeDilation.rate;
      this.dustSystem.rotation.x += delta * 0.012 * this.timeDilation.rate;
    }

    // Dynamic Synaptic Filaments Update
    this.updateFilaments();

    // 3. Audio-Reactive Point Light Modulation & Burst Flash
    this.mousePointLight.position.x = mouseOffsetX * 1.5;
    this.mousePointLight.position.y = scrollY - mouseOffsetY * 1.5;
    this.mousePointLight.position.z = scrollZ - 6;
    this.mousePointLight.intensity = (8 + audioFreqs.treble * 16) + this.flashIntensity;
    if (this.flashIntensity > 0.01) {
      this.flashIntensity *= Math.pow(0.04, delta);
      if (this.flashIntensity < 0.01) this.flashIntensity = 0;
    }

    // 4. Audio-Reactive Core Scale & Rotation
    if (this.coreGroup) {
      const bassPulse = 1.0 + audioFreqs.bass * 0.4;
      const rotSpeed = this.timeDilation.rate;

      this.coreMesh.rotation.x += delta * 0.35 * rotSpeed;
      this.coreMesh.rotation.y += delta * 0.5 * rotSpeed;
      this.cageMesh.rotation.x -= delta * 0.2 * rotSpeed;
      this.cageMesh.rotation.y -= delta * 0.3 * rotSpeed;
      this.pointsMesh.rotation.y += delta * 0.15 * rotSpeed;

      const idlePulse = 1 + Math.sin(elapsedTime * 2.5) * 0.04;
      this.coreMesh.scale.setScalar(idlePulse * bassPulse);
      this.cageMesh.scale.setScalar((idlePulse + 0.1) * (1.0 + audioFreqs.mid * 0.25));
    }

    // Shockwave Ring Animation
    if (this.shockwave && this.shockwave.visible) {
      this.shockwave.quaternion.copy(this.camera.quaternion);
      this.shockwave.scale.addScalar(delta * 65.0);
      this.shockwaveMat.opacity -= delta * 1.4;
      if (this.shockwaveMat.opacity <= 0) {
        this.shockwaveMat.opacity = 0;
        this.shockwave.visible = false;
      }
    }

    // 5. Gyroscopic Rings Rotation
    if (this.ringGroup) {
      const rotSpeed = this.timeDilation.rate;
      this.ring1.rotation.x += delta * 0.6 * rotSpeed;
      this.ring1.rotation.y += delta * 0.4 * rotSpeed;
      this.ring2.rotation.y -= delta * 0.5 * rotSpeed;
      this.ring2.rotation.z += delta * 0.3 * rotSpeed;
      this.ring3.rotation.x -= delta * 0.4 * rotSpeed;
      this.ring3.rotation.z -= delta * 0.6 * rotSpeed;
    }

    // 6. Floating Shards
    if (this.shards) {
      const rotSpeed = this.timeDilation.rate;
      this.shards.forEach((shard) => {
        const d = shard.userData;
        const t = elapsedTime * d.orbitSpeed * rotSpeed + d.phase;
        shard.position.x = d.basePos.x + Math.sin(t) * 1.5;
        shard.position.y = d.basePos.y + Math.cos(t * 1.2) * 1.5;
        shard.rotation.x += d.rotSpeedX * delta * rotSpeed;
        shard.rotation.y += d.rotSpeedY * delta * rotSpeed;
      });
    }

    // 7. Particle Morphing & Physics Interpolation
    if (this.particleSystem) {
      const posAttr = this.particleGeo.getAttribute('position');
      const positions = posAttr.array;
      const count = positions.length / 3;
      const targetBuffer = this.targetBuffers[this.morph.targetName] || this.targetBuffers.core;
      const sourceBuffer = this.particleGeo.userData.sourcePositions;

      // Handle Morph Transition
      if (this.morph.progress < 1.0) {
        this.morph.progress = Math.min(1.0, this.morph.progress + delta * this.morph.speed);
        // Smooth cubic ease-in-out
        const t = this.morph.progress;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        for (let i = 0; i < positions.length; i++) {
          positions[i] = sourceBuffer[i] + (targetBuffer[i] - sourceBuffer[i]) * ease;
        }
      } else if (this.isBursting || this.burstEnergy > 0.001) {
        // Smooth spring recovery back to active morph target after explosion
        const springFactor = Math.min(1.0, delta * 3.8);
        let maxDiff = 0;
        for (let i = 0; i < positions.length; i++) {
          const diff = targetBuffer[i] - positions[i];
          positions[i] += diff * springFactor;
          const absDiff = Math.abs(diff);
          if (absDiff > maxDiff) maxDiff = absDiff;
        }
        this.burstEnergy *= Math.pow(0.08, delta);
        if (this.burstEnergy < 0.005) {
          this.isBursting = false;
          this.burstEnergy = 0;
        }
        sourceBuffer.set(positions);
      }

      // Warp Factor & Audio-Reactive Particle Pulse
      if (this.gameProtocol.isActive) {
        this.particleSystem.rotation.x = this.gameProtocol.rotX;
        this.particleSystem.rotation.y = this.gameProtocol.rotY;
      } else {
        this.warp.factor += (0 - this.warp.factor) * 0.05;
        const currentWarpSpeed = (1.0 + this.warp.factor + audioFreqs.bass * 2.0) * (this.warp.inverted ? -1 : 1) * this.timeDilation.rate;
        this.particleSystem.rotation.y += delta * 0.06 * currentWarpSpeed;
      }

      // Dynamic Particle Point Size reacting to Treble
      if (this.particleMat) {
        this.particleMat.size = 0.24 + audioFreqs.treble * 0.22;
      }

      // Interactive cursor gravitational deflection
      const mx = this.mouse.current.x * 12;
      const my = -this.mouse.current.y * 12;

      for (let i = 0; i < count; i += 6) {
        const i3 = i * 3;
        const dx = positions[i3] - mx;
        const dy = positions[i3 + 1] - my;
        const distSq = dx * dx + dy * dy;

        if (distSq < 160) {
          const force = (160 - distSq) / 160 * 0.1;
          positions[i3] += dx * force;
          positions[i3 + 1] += dy * force;
        }
      }

      // Quantum Protocol Chaotic Wave Perturbation
      if (this.gameProtocol.isActive && this.gameProtocol.chaosFactor > 0.01) {
        const chaos = this.gameProtocol.chaosFactor;
        const freq = (this.gameProtocol.currentFreq || 440) / 100.0;
        const t = elapsedTime * 3.2;
        for (let i = 0; i < count; i += 3) {
          const i3 = i * 3;
          const wave = Math.sin(t + positions[i3 + 1] * 0.25 * freq) * chaos * 3.5;
          positions[i3] += Math.sin(t + i) * chaos * 0.25;
          positions[i3 + 1] += wave * 0.12;
          positions[i3 + 2] += Math.cos(t + i) * chaos * 0.25;
        }
      }

      posAttr.needsUpdate = true;

      // 8. Time Dilation History Ring Buffer
      if (this.timeDilation.rate > 0) {
        if (this.timeDilation.history.length >= this.timeDilation.historyMax) {
          this.timeDilation.history.shift();
        }
        // Save copy of positions and core state
        this.timeDilation.history.push({
          pos: new Float32Array(positions),
          coreRotX: this.coreMesh ? this.coreMesh.rotation.x : 0,
          coreRotY: this.coreMesh ? this.coreMesh.rotation.y : 0
        });
      } else if (this.timeDilation.rate < 0 && this.timeDilation.history.length > 0) {
        // Rewind from history
        const frame = this.timeDilation.history.pop();
        if (frame) {
          positions.set(frame.pos);
          if (this.coreMesh) {
            this.coreMesh.rotation.x = frame.coreRotX;
            this.coreMesh.rotation.y = frame.coreRotY;
          }
          posAttr.needsUpdate = true;
        }
      }
    }

    // 9. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}
