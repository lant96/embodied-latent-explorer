import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

let poseLandmarker;
let video;

// Calibration baseline
let baseX = null;
let baseY = null;

// Dead zone: suppresses micro-jitter around neutral stance
const DEAD_ZONE = 0.03;

const SMOOTHING = 0.3;
let smoothX = 0;
let smoothY = 0;
let lastValidPose = { x: 0, y: 0 };

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
    numPoses: 1,
  });

  video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  video.onloadedmetadata = async () => {
    try {
      await video.play();
    } catch (e) {
      console.warn("Video play failed:", e);
    }

    requestAnimationFrame(loop);
  };

  function loop() {
    requestAnimationFrame(loop);

    if (!poseLandmarker || !video) return;

    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

    let result;

    try {
      result = poseLandmarker.detectForVideo(video, performance.now());
    } catch (err) {
      console.warn("Pose detection error:", err);
      onUpdate(lastValidPose);
      return;
    }

    if (!result?.landmarks?.length) {
      onUpdate(lastValidPose);
      return;
    }

    const lm = result.landmarks[0];
    const leftShoulder = lm[11];
    const rightShoulder = lm[12];

    if (!leftShoulder || !rightShoulder) {
      onUpdate(lastValidPose);
      return;
    }

    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;

    // Calibration
    if (baseX === null || baseY === null) {
      baseX = centerX;
      baseY = centerY;
    }

    let dx = centerX - baseX;
    let dy = centerY - baseY;

    smoothX = SMOOTHING * dx + (1 - SMOOTHING) * smoothX;
    smoothY = SMOOTHING * dy + (1 - SMOOTHING) * smoothY;


    const finalX = Math.abs(smoothX) < DEAD_ZONE ? 0 : smoothX;
    const finalY = Math.abs(smoothY) < DEAD_ZONE ? 0 : smoothY;

    const output = { x: finalX, y: finalY };

    lastValidPose = output;
    onUpdate(output);
  }
}

export function getVideoElement() {
  return video;
}

// Reset calibration baseline
export function recalibrate() {
  baseX = null;
  baseY = null;
  smoothX = 0;
  smoothY = 0;
}