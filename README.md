# ⚡ Synthetix TechLabs — 3D Parallax & Spatial Dimension Engine

An ultra-modern, high-performance web engineering showcase combining multi-layered 3D parallax effects, Three.js WebGL scenes, biometric webcam head tracking, GPU particle morphing, audio-reactive shaders, and cybernetic voice synthesis.

![Synthetix TechLabs Preview](public/favicon.svg)

---

## 🌟 The 8 Next-Gen Show-Off Capabilities

### 1. 👁️ Biometric Head-Tracking Parallax (Webcam)
- Optical computer-vision head tracking running 100% locally in the browser at 60 FPS (zero external weight, privacy-first).
- Translates physical head movement (left, right, depth) into true holographic perspective parallax.
- Mini PIP optical telemetry feed in the Director HUD.

### 2. 🧬 4-Target GPU Particle Morphing
- 8,000+ particles dynamically morph between 4 mathematical 3D sculptures:
  1. **Quantum Core Cluster**: Spherical orbital cluster.
  2. **Neural Cortex Mesh**: Dual-hemisphere brain with synaptic convolutions.
  3. **DNA Double-Helix**: Twisting helical ladder with cross base-pair rungs.
  4. **Torus Singularity**: High-velocity vortex donut.
- Triggerable via HUD chips, Command Palette, or scroll transitions.

### 3. 🔊 Audio-Reactive Vertex Deformation & Pulsation
- Real-time FFT frequency analysis via native Web Audio API `AnalyserNode`:
  - Sub-bass frequencies pulse the core geometry scale and vertex ripples.
  - Mid-range frequencies expand the outer wireframe cage.
  - Treble frequencies modulate point light intensity and particle point sizes.

### 4. 🪞 Optical Glass Refraction & Chromatic Dispersion
- Physical dielectric transmission (`MeshPhysicalMaterial` with `transmission: 0.92`, `ior: 1.54`, `thickness: 2.6`).
- Refracts the background starfield, particles, and grid lines through spinning crystal facets in real-time.

### 5. 🤖 Cybernetic Synthetic AI Voice System
- Hardware-accelerated robotic speech synthesis using native `window.speechSynthesis`.
- Automatically announces major state changes (welcome, morph sequences, theme shifts, time dilation).

### 6. ⌨️ Futuristic Quick Command Palette (`Ctrl + K` / `Cmd + K`)
- High-tech cyberpunk terminal with holographic scanlines and responsive autocomplete.
- Directives include `/morph [brain|dna|torus|core]`, `/theme [void|cyan|solar|opal]`, `/burst`, `/rewind [on|off]`, `/wireframe`, `/audio`, `/voice`, `/ar`.

### 7. ⏳ Time-Dilation Physics Rewind Engine
- 180-frame state ring buffer recording particle trajectories and rotational transforms.
- Dragging the HUD Time Scrubber left (`-1.0x`) engages reverse playback with retro VHS/matrix scanline distortion.

### 8. 🥽 WebXR Spatial AR Mode
- Built-in WebXR session manager allowing users to project the Synthetix Hyper-Core into their physical room on supported mobile devices or headsets (Meta Quest, Apple Vision Pro).

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Shortcuts
* Press **`Ctrl + K`** (or **`Cmd + K`**) anywhere to open the Cybernetic Command Terminal.

---

## 🛠️ Tech Stack
* **Three.js** — 3D WebGL scenes, dielectric materials, particle physics, WebXR
* **Web Audio API** — Procedural synthesizer and real-time FFT frequency analyzer
* **Web Speech API** — Cybernetic AI robotic speech synthesis
* **Canvas Optical Centroid Tracking** — Sub-millisecond client-side biometric head tracking
* **Vite** — High-speed build tooling
* **Modern CSS3 3D Transforms** — Hardware-accelerated perspective rendering and glassmorphism
