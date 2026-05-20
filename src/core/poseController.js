import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

let poseLandmarker;
let video;

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

  video.onloadeddata = () => {
    requestAnimationFrame(loop);
  };

  function loop() {
    if (!poseLandmarker || !video) return;

    const result = poseLandmarker.detectForVideo(video, performance.now());

    if (result.landmarks?.length > 0) {
      const lm = result.landmarks[0];

      const nose = lm[0]; // basic body center reference

      onUpdate({
        x: nose.x,
        y: nose.y,
      });
    }

    requestAnimationFrame(loop);
  }
}