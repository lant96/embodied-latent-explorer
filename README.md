# Embodied Latent Explorer

A web-based HCI prototype that uses real-time body pose to navigate a 3D abstract data space. Lean left or right to shift perspective; lean forward and back for vertical drift. No mouse, no keyboard — just posture.

Built with React, Three.js, MediaPipe
🔗 **Live demo:** [https://embodied-latent-explorer.vercel.app/]

---

## What it is

An interaction design experiment asking:

> **Can the body serve as a natural interface for navigating abstract, high-dimensional data spaces?**

The scene is a stand-in for a latent space, the kind of abstract, high-dimensional structure that underlies ML representations. The interaction maps physical lean to camera movement, treating body posture as *navigational intent* rather than a joystick input.

---

## How it works

**Lean left / right** → zone-based horizontal navigation (LEFT · CENTER · RIGHT)  
**Vertical body movement** → continuous vertical camera shift (screen-space displacement of torso position)

The horizontal axis uses a zone model with hysteresis rather than continuous tracking, a deliberate choice. Real bodies are never perfectly still, and snapping between discrete zones is more stable and less fatiguing than proportional control at this signal quality.

Note: vertical movement is computed from 2D pose estimation (shoulder midpoint in image space), not true 3D depth estimation.

### Signal pipeline

```
Webcam → MediaPipe PoseLandmarker → Shoulder midpoint → Baseline delta
  → EMA smoothing (α = 0.3) → Dead zone → Zone FSM → Camera lerp
```

The shoulder midpoint (not hands or face) was chosen for stability: the torso expresses lean more clearly than the extremities, and requires no sustained arm effort.

---

## Architecture

```
src/
├── components/
│   ├── CameraController.jsx  — Zone FSM + camera lerp
│   ├── Points.jsx            — Instanced 3D objects, botanical colour palette
│   └── UI.jsx                — Status panel + live webcam preview
├── core/
│   └── poseController.js     — MediaPipe pipeline, EMA, auto-calibration
├── hooks/
│   └── usePose.js            — Stable one-time init (ref pattern)
└── App.jsx                   — Canvas, lighting, composition
```

A few intentional design decisions worth noting:

- **Pose processing is vanilla JS**, isolated from React, the signal pipeline is independently testable and swappable
- **Camera lerp is deliberately slow** (`t = 0.055`), inertia is a design value, not a performance constraint
- **Webcam preview polls for the video element** rather than assuming it exists on mount, since MediaPipe init is async

---

## Stack

React · Vite · Three.js (`@react-three/fiber`) · MediaPipe Tasks Vision · Zustand

No backend. Runs entirely in the browser.

---

## Running locally

```bash
npm install
npm run dev
```

Requires Chrome and webcam access. On first load, sit or stand in frame the first valid pose auto-calibrates as your neutral. Use **Recalibrate** if you reposition.

---

## Limitations & next steps

This is a research prototype, not a finished product. Known constraints:

- Z-axis (depth/zoom) is not yet body-controlled
- MediaPipe performs better in Chrome than Firefox
- The object field is unstructured, a natural next step is replacing it with real embedding projections (e.g. UMAP) to make navigation semantically meaningful
- No multi-user support

---

## Future directions

Several extensions are planned for future iterations of the prototype:

- Depth-aware navigation
Incorporating additional body landmarks and temporal signals to enable body-controlled Z-axis navigation.
- Semantic latent spaces
Replacing the random object field with actual embedding projections (e.g. UMAP/t-SNE representations of image or text datasets) to support meaningful spatial exploration.
- Learned interaction models
Exploring lightweight machine learning approaches for adaptive pose interpretation, temporal motion modelling, and user-specific calibration.
- Embodied interaction studies
Comparing discrete zone-based navigation against continuous control models in terms of stability, fatigue, learnability, and perceived embodiment.

---

## Author

Athanasia Lantouri - 
MSc in Data Science and Machine Learning 
[ath.lantouri@gmai.com]
