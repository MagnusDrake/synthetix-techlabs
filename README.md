# ⚡ Synthetix TechLabs — 3D Parallax & Spatial Dimension Engine

A cutting-edge, high-performance web application showcasing multi-layered 3D parallax effects, WebGL spatial scenes, interactive holographic cards, and real-time physics controls.

![Synthetix TechLabs Preview](public/favicon.svg)

---

## 🌟 Key Features

### 1. Multi-Layer 3D WebGL Spatial Core (Three.js)
- **Dielectric Crystalline Core**: Faceted icosahedron with procedural clearcoat and emissive glow.
- **Geodesic Containment Cage**: Outer wireframe lattice and point matrix.
- **Gyroscopic Orbital Rings**: 3 concentric gimbal rings rotating on asynchronous axes.
- **Orbital Shard Cloud**: 32 floating polyhedral crystal shards with dynamic specular reflections.
- **Volumetric Particle Field**: 8,000+ interactive particles with mouse gravitational attraction, spring recovery, and warp speed acceleration.
- **Dynamic Mouse-Tracking Lighting**: Point light that follows cursor coordinates in 3D camera space.

### 2. Interactive 3D Parallax Holographic Cards
- **Perspective Tilt Engine**: Real-time cursor angle calculation with `rotateX` and `rotateY` physics.
- **Specular Sheen & Glare**: Incident lighting glare that dynamically tracks cursor position.
- **Multi-Depth Internal Layering**: Badges, holographic icons, typography, and stats float at distinct physical Z-offsets (`data-depth`).

### 3. The Synthetix Hyper-Core 3D Diorama
- **5-Plane Optical Depth Slicer**:
  - `Plane 1`: HUD Crosshairs & telemetry readouts
  - `Plane 2`: Magnetic containment vector rings
  - `Plane 3`: Superconducting Quantum Core
  - `Plane 4`: Sub-lattice heat exchangers and circuit traces
  - `Plane 5`: Event horizon cosmic grid and nebulas
- **Interactive Depth Slicer**: "EXPAND DEPTH" explodes planes along the Z-axis for a dramatic spatial breakdown.
- **Plane Isolation**: Click any plane in the legend to highlight and focus on that layer.

### 4. Warp Dynamics Sandbox
- **Interactive Particle Field Deformation**: Drag or click within the sandbox to warp the particle trajectories.
- **Real-Time Telemetry**: Live gravitational pull, particle velocity, singularity vector, and resonance pitch readouts.
- **Quantum Burst & Inversion**: Trigger an impulse warp blast or invert particle gravitational polarity.

### 5. Procedural Web Audio FX Synthesizer
- Zero-dependency sound engine built with the native Web Audio API (no external MP3/WAV files required).
- Ambient sub-bass harmonic drone, high-resonance hover chimes, quantum clicks, and frequency-swept warp whooshes.

### 6. Lab Director HUD Console
- Slide-out control deck to customize the entire experience in real-time:
  - **4 Harmonic Color Presets**: *Cyber Void*, *Biolum Cyan*, *Solar Flare*, *Quantum Opal*.
  - **Parallax Sensitivity**: Adjust multiplier from `0.2x` to `2.5x`.
  - **Camera Interpolation**: Adjust lerp damping / smoothness.
  - **3D Core Shader Mode**: Toggle between *Crystal Shaded*, *Wireframe*, and *Points Matrix*.
  - **Particle Density**: Scale field from `2,000` to `15,000` points.
  - **Volume Gain**: Real-time master gain slider.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack
- **Three.js** — 3D WebGL rendering, custom materials, lighting, particle engines
- **Vite** — High-speed build tool and dev server
- **Web Audio API** — Real-time synthesized spatial sound
- **Vanilla Modern JavaScript (ES2024)** — Zero framework overhead, 60+ FPS performance
- **CSS 3D Transforms** — Hardware-accelerated perspective rendering and glassmorphism
