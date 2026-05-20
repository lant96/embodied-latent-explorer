import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

let poseLandmarker;
let video;

// ----------------------------
// STATE
// ----------------------------
let baseX = null;
let baseY = null;

let prevX = null;
let prevY = null;

const DEAD_ZONE = 0.025;
const MIN_INTERVAL = 33; // ~30fps cap

let lastTime = 0;

export async function initPose(onUpdate) {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
    },
    runningMode: "VIDEO",
  });

  video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  video.srcObject = stream;

  // FIX: safe video start (prevents AbortError)
  video.onloadedmetadata = async () => {
    try {
      await video.play();
    } catch (e) {
      console.warn("Video play error:", e);
    }

    requestAnimationFrame(loop);
  };

  function loop() {
    if (!poseLandmarker || !video) {
      requestAnimationFrame(loop);
      return;
    }

    // ----------------------------
    // FRAME RATE LIMIT (important for stability)
    // ----------------------------
    const now = performance.now();
    if (now - lastTime < MIN_INTERVAL) {
      requestAnimationFrame(loop);
      return;
    }
    lastTime = now;

    // ensure valid frame
    if (!video.videoWidth || !video.videoHeight) {
      requestAnimationFrame(loop);
      return;
    }

    let result;

    try {
      result = poseLandmarker.detectForVideo(video, now);
    } catch (err) {
      console.warn("Pose error:", err);
      requestAnimationFrame(loop);
      return;
    }

    if (!result?.landmarks?.length) {
      requestAnimationFrame(loop);
      return;
    }

    const lm = result.landmarks[0];

    const leftShoulder = lm[11];
    const rightShoulder = lm[12];

    if (!leftShoulder || !rightShoulder) {
      requestAnimationFrame(loop);
      return;
    }

    // ----------------------------
    // STABLE BODY CENTER
    // ----------------------------
    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;

    // ----------------------------
    // CALIBRATION (neutral stance)
    // ----------------------------
    if (baseX === null || baseY === null) {
      baseX = centerX;
      baseY = centerY;
    }

    let dx = centerX - baseX;
    let dy = centerY - baseY;

    // ----------------------------
    // DEAD ZONE (removes micro jitter)
    // ----------------------------
    if (Math.abs(dx) < DEAD_ZONE) dx = 0;
    if (Math.abs(dy) < DEAD_ZONE) dy = 0;

    // ----------------------------
    // MOTION FILTER (core stability fix)
    // ----------------------------
    if (prevX === null || prevY === null) {
      prevX = dx;
      prevY = dy;
    }

    const vx = dx - prevX;
    const vy = dy - prevY;

    prevX = dx;
    prevY = dy;

    // damping (reduces noise amplification)
    const filteredX = vx * 0.8;
    const filteredY = vy * 0.8;

    // ----------------------------
    // OUTPUT
    // ----------------------------
    onUpdate({
      x: filteredX,
      y: filteredY,
    });

    requestAnimationFrame(loop);
  }
}