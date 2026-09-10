/**
 * Biometric Head-Tracking Parallax Engine
 * Uses browser camera feed with lightweight client-side optical centroid / face tracking
 * to translate physical head movements into 3D camera coordinates.
 */
export class FaceTracker {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.stream = null;
    this.video = document.createElement('video');
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.muted = true;

    // Downscaled processing canvas for sub-millisecond 60 FPS performance
    this.procCanvas = document.createElement('canvas');
    this.procCanvas.width = 64;
    this.procCanvas.height = 48;
    this.procCtx = this.procCanvas.getContext('2d', { willReadFrequently: true });

    this.isActive = false;
    this.hasPermission = false;
    this.animId = null;

    // Head Position Normalized (-1 to 1)
    this.headPos = {
      x: 0,
      y: 0,
      z: 0, // distance/scale
      smoothX: 0,
      smoothY: 0
    };

    // Native FaceDetector support check (Chrome/Edge experimental)
    this.nativeDetector = window.FaceDetector ? new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;
  }

  async start() {
    if (this.isActive) return true;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        },
        audio: false
      });

      this.video.srcObject = this.stream;
      await this.video.play();

      this.isActive = true;
      this.hasPermission = true;
      this.trackLoop();
      return true;
    } catch (err) {
      console.warn('Biometric camera access denied or unavailable:', err);
      this.isActive = false;
      return false;
    }
  }

  stop() {
    this.isActive = false;
    if (this.animId) cancelAnimationFrame(this.animId);

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.headPos.x = 0;
    this.headPos.y = 0;
    this.headPos.smoothX = 0;
    this.headPos.smoothY = 0;

    if (this.onUpdate) {
      this.onUpdate(0, 0, 0);
    }
  }

  toggle() {
    if (this.isActive) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  trackLoop() {
    if (!this.isActive) return;

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.procCtx.drawImage(this.video, 0, 0, this.procCanvas.width, this.procCanvas.height);

      if (this.nativeDetector) {
        this.nativeDetector.detect(this.procCanvas).then(faces => {
          if (faces.length > 0) {
            const box = faces[0].boundingBox;
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;

            // Invert X because camera is mirrored
            this.headPos.x = -((cx / this.procCanvas.width) * 2 - 1);
            this.headPos.y = (cy / this.procCanvas.height) * 2 - 1;
            this.headPos.z = (box.width / this.procCanvas.width);
          } else {
            this.fallbackCentroidTrack();
          }
        }).catch(() => this.fallbackCentroidTrack());
      } else {
        this.fallbackCentroidTrack();
      }

      // Smooth dampening
      this.headPos.smoothX += (this.headPos.x - this.headPos.smoothX) * 0.15;
      this.headPos.smoothY += (this.headPos.y - this.headPos.smoothY) * 0.15;

      if (this.onUpdate) {
        this.onUpdate(this.headPos.smoothX, this.headPos.smoothY, this.headPos.z);
      }
    }

    this.animId = requestAnimationFrame(() => this.trackLoop());
  }

  /**
   * Ultra-fast skin/luminance center-of-mass detection
   */
  fallbackCentroidTrack() {
    const imgData = this.procCtx.getImageData(0, 0, this.procCanvas.width, this.procCanvas.height);
    const data = imgData.data;
    const w = this.procCanvas.width;
    const h = this.procCanvas.height;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin & face luminance heuristic: R > G, R > B, brightness in human face range
        if (r > 60 && g > 40 && b > 20 && (r - g) > 10 && (r - b) > 10) {
          totalWeight += 1;
          weightedX += x;
          weightedY += y;
        }
      }
    }

    if (totalWeight > 20) {
      const avgX = weightedX / totalWeight;
      const avgY = weightedY / totalWeight;

      // Mirrored horizontal coordinate
      this.headPos.x = -((avgX / w) * 2 - 1);
      this.headPos.y = (avgY / h) * 2 - 1;
      this.headPos.z = Math.min(1.5, Math.max(0.5, totalWeight / 300));
    }
  }

  getVideoElement() {
    return this.video;
  }
}
