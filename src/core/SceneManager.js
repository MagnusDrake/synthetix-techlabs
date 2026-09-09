import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
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

    this.clock = new THREE.Clock();
    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060810, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 18);
    this.cameraBaseZ = 18;

    // 3. Renderer
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

    // 4. Lighting
    this.setupLights();

    // 5. 3D Elements
    this.createSynthetixCore();
    this.createGyroscopicRings();
    this.createFloatingShards();
    this.createParticleField();

    // 6. Window Resize
    window.addEventListener('resize', () => this.onResize());

    // 7. Start Render Loop
    this.animate();
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(this.config.themeColors.ambient, 2.5);
    this.scene.add(this.ambientLight);

    // Dynamic mouse-tracking primary point light
    this.mousePointLight = new THREE.PointLight(this.config.themeColors.primary, 8, 30);
    this.mousePointLight.position.set(0, 0, 10);
    this.scene.add(this.mousePointLight);

    // Secondary fill light
    this.secondaryLight = new THREE.DirectionalLight(this.config.themeColors.secondary, 2.5);
    this.secondaryLight.position.set(-10, 10, -5);
    this.scene.add(this.secondaryLight);

    // Back rim light
    this.rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.rimLight.position.set(0, -10, -15);
    this.scene.add(this.rimLight);
  }

  createSynthetixCore() {
    this.coreGroup = new THREE.Group();

    // Inner glowing crystal
    const innerGeo = new THREE.IcosahedronGeometry(3.2, 0);
    this.coreMaterial = new THREE.MeshPhysicalMaterial({
      color: this.config.themeColors.primary,
      emissive: this.config.themeColors.secondary,
      emissiveIntensity: 0.4,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
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
      opacity: 0.7
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

    // 3 Concentric Gimbal Rings
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
    const shardCount = 32;

    this.shards = [];
    const shardGeo = new THREE.OctahedronGeometry(0.8, 0);

    for (let i = 0; i < shardCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: (i % 2 === 0) ? this.config.themeColors.primary : this.config.themeColors.secondary,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.75
      });

      const shard = new THREE.Mesh(shardGeo, mat);
      
      // Place shards in a toroidal belt around the core, staying away from foreground camera lens
      const radius = 10 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 1.2;

      const sx = radius * Math.cos(theta) * Math.cos(phi);
      const sy = radius * Math.sin(phi);
      // Keep z strictly behind z = 6 so shards float around the core (z=0) and never block text
      const sz = Math.min(6, (Math.random() - 0.5) * 20);

      shard.position.set(sx, sy, sz);

      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      shard.scale.setScalar(0.3 + Math.random() * 0.6);

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

  createParticleField(count = this.config.particleCount) {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleGeo.dispose();
      this.particleMat.dispose();
    }

    this.particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    const colPrimary = new THREE.Color(this.config.themeColors.primary);
    const colSecondary = new THREE.Color(this.config.themeColors.secondary);
    const colWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Cylindrical spatial volume around camera path
      const r = 5 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 100;

      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      // Color variation
      const rand = Math.random();
      let c = colPrimary;
      if (rand > 0.7) c = colSecondary;
      else if (rand > 0.95) c = colWhite;

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeo.userData = { originalPositions };

    this.particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particleSystem);
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

    // Update lights
    this.mousePointLight.color.setHex(t.primary);
    this.secondaryLight.color.setHex(t.secondary);
    this.ambientLight.color.setHex(t.ambient);

    // Update core materials
    this.coreMaterial.color.setHex(t.primary);
    this.coreMaterial.emissive.setHex(t.secondary);
    this.cageMaterial.color.setHex(t.primary);

    // Update rings
    this.ring1.material.color.setHex(t.primary);
    this.ring2.material.color.setHex(t.secondary);
    this.ring3.material.color.setHex(t.primary);

    // Re-create particles with new theme colors
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
    this.createParticleField(count);
  }

  triggerBurst() {
    this.warp.factor = 4.0;
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

    // Lerp mouse coordinates
    const lerp = this.config.lerpFactor;
    this.mouse.current.x += (this.mouse.target.x - this.mouse.current.x) * lerp;
    this.mouse.current.y += (this.mouse.target.y - this.mouse.current.y) * lerp;

    // Lerp scroll
    this.scroll.current += (this.scroll.target - this.scroll.current) * lerp;

    // 1. Dynamic Parallax Camera Position based on Scroll & Mouse
    const pStrength = this.config.parallaxMultiplier;
    const mouseOffsetX = this.mouse.current.x * 4 * pStrength;
    const mouseOffsetY = this.mouse.current.y * 3 * pStrength;

    // Scroll trajectory path:
    // As scroll goes 0 -> 1:
    // Z: 18 -> 10 -> -5 -> 15 (traversal loop)
    // X: curve left and right
    const scrollZ = this.cameraBaseZ - (this.scroll.current * 28);
    const scrollX = Math.sin(this.scroll.current * Math.PI * 2) * 5;
    const scrollY = -this.scroll.current * 10;

    this.camera.position.x = scrollX + mouseOffsetX;
    this.camera.position.y = scrollY - mouseOffsetY;
    this.camera.position.z = scrollZ;

    // Camera look target with parallax tilt
    const lookTarget = new THREE.Vector3(
      mouseOffsetX * 0.4,
      scrollY * 0.9 - mouseOffsetY * 0.4,
      scrollZ - 15
    );
    this.camera.lookAt(lookTarget);

    // Roll camera slightly based on mouse horizontal speed
    this.camera.rotation.z = -this.mouse.current.x * 0.06 * pStrength;

    // 2. Update Mouse Point Light
    this.mousePointLight.position.x = mouseOffsetX * 1.5;
    this.mousePointLight.position.y = scrollY - mouseOffsetY * 1.5;
    this.mousePointLight.position.z = scrollZ - 6;

    // 3. Rotate 3D Core
    if (this.coreGroup) {
      this.coreMesh.rotation.x = elapsedTime * 0.35;
      this.coreMesh.rotation.y = elapsedTime * 0.5;
      this.cageMesh.rotation.x = -elapsedTime * 0.2;
      this.cageMesh.rotation.y = -elapsedTime * 0.3;
      this.pointsMesh.rotation.y = elapsedTime * 0.15;

      // Slight scale pulsation
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.04;
      this.coreMesh.scale.setScalar(pulse);
    }

    // 4. Rotate Gyroscopic Rings
    if (this.ringGroup) {
      this.ring1.rotation.x = elapsedTime * 0.6;
      this.ring1.rotation.y = elapsedTime * 0.4;

      this.ring2.rotation.y = -elapsedTime * 0.5;
      this.ring2.rotation.z = elapsedTime * 0.3;

      this.ring3.rotation.x = -elapsedTime * 0.4;
      this.ring3.rotation.z = -elapsedTime * 0.6;
    }

    // 5. Update Floating Shards
    if (this.shards) {
      this.shards.forEach((shard) => {
        const d = shard.userData;
        const t = elapsedTime * d.orbitSpeed + d.phase;
        shard.position.x = d.basePos.x + Math.sin(t) * 1.5;
        shard.position.y = d.basePos.y + Math.cos(t * 1.2) * 1.5;
        shard.rotation.x += d.rotSpeedX * delta;
        shard.rotation.y += d.rotSpeedY * delta;
      });
    }

    // 6. Update Particle Field Dynamics
    if (this.particleSystem) {
      const posAttr = this.particleGeo.getAttribute('position');
      const positions = posAttr.array;
      const originals = this.particleGeo.userData.originalPositions;
      const count = positions.length / 3;

      // Warp factor decays back to 0
      this.warp.factor += (0 - this.warp.factor) * 0.05;
      const currentWarpSpeed = (1.0 + this.warp.factor) * (this.warp.inverted ? -1 : 1);

      // Rotate particle group slowly
      this.particleSystem.rotation.y = elapsedTime * 0.03 * currentWarpSpeed;

      // React to mouse coordinates
      const mx = this.mouse.current.x * 10;
      const my = -this.mouse.current.y * 10;

      for (let i = 0; i < count; i += 8) { // update subset per frame for high performance
        const i3 = i * 3;
        const ox = originals[i3];
        const oy = originals[i3 + 1];
        const oz = originals[i3 + 2];

        // Gravitational displacement from cursor
        const dx = positions[i3] - mx;
        const dy = positions[i3 + 1] - my;
        const distSq = dx * dx + dy * dy;

        if (distSq < 150) {
          const force = (150 - distSq) / 150 * 0.08;
          positions[i3] += dx * force;
          positions[i3 + 1] += dy * force;
        } else {
          // Spring back
          positions[i3] += (ox - positions[i3]) * 0.03;
          positions[i3 + 1] += (oy - positions[i3 + 1]) * 0.03;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}
