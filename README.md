# Embodied Latent Explorer

Embodied Latent Explorer is a browser-based human-computer interaction prototype that investigates body movement as a natural interface for navigating abstract three-dimensional data spaces.

**Research Question**

> Can body movement provide an intuitive and expressive interface for exploring abstract representations without relying on traditional input devices?

---

## Overview

Most visualisation systems depend on a mouse, keyboard, or touch interface. This project explores an alternative interaction paradigm in which body posture becomes the primary navigation mechanism.

Using real-time pose estimation, upper-body movement is mapped to camera motion within a three-dimensional scene representing an abstract latent space. Rather than treating the body as a replacement for a joystick, the prototype investigates whether natural posture can communicate navigational intent.

Although the current environment contains abstract objects, the interaction model is intended as a foundation for future applications involving machine-learning embeddings, scientific visualisation, and embodied exploration of high-dimensional data.

---

## Interaction Design

The current interaction model maps upper-body movement to camera navigation.

- Lean left or right to move between horizontal navigation zones.
- Move vertically to adjust camera height.
- Automatic calibration establishes a neutral body position at the beginning of each session.

Horizontal navigation is intentionally zone-based rather than continuous. This reduces instability caused by small posture variations and provides a smoother interaction experience when using webcam-based pose estimation.

Vertical movement is estimated from the two-dimensional shoulder midpoint in image space rather than true three-dimensional body tracking.

---

## Signal Pipeline

```
Webcam
    │
MediaPipe Pose Landmarker
    │
Shoulder midpoint extraction
    │
Baseline normalization
    │
Exponential moving average smoothing
    │
Dead-zone filtering
    │
Finite-state zone model
    │
Camera interpolation
```

---

## Project Structure

```
src/
├── components/
│   ├── CameraController.jsx
│   ├── Points.jsx
│   └── UI.jsx
├── core/
│   └── poseController.js
├── hooks/
│   └── usePose.js
└── App.jsx
```

---

## Tech Stack

- React
- Vite
- Three.js
- React Three Fiber
- MediaPipe Tasks Vision
- Zustand

The application runs entirely in the browser and requires no backend services.

---

## Running Locally

```bash
npm install
npm run dev
```

Chrome with webcam access is recommended.

When the application starts, the first detected pose is used as the neutral calibration position. Calibration can be repeated at any time using the **Recalibrate** control.

---

## Current Limitations

- Camera depth is not yet controlled through body movement.
- Navigation is limited to upper-body pose estimation.
- The scene contains abstract objects rather than meaningful embedding projections.
- Performance depends on webcam quality and browser support.

---

## Future Work

- Introduce depth-aware body navigation.
- Replace the abstract scene with machine learning embedding projections.
- Investigate adaptive movement interpretation using lightweight machine learning models.
- Compare continuous and discrete navigation strategies through user studies.
- Integrate personalised interaction models developed in the Adaptive Embodied AI project.

---

## Author

Athanasia Lantouri

Applied Machine Learning | Human-Centered AI | Interactive Systems

GitHub: https://github.com/lant96
