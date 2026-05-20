import { useEffect } from "react";
import { initPose } from "../core/poseController";

export function usePose(onUpdate) {
  useEffect(() => {
    initPose(onUpdate);
  }, [onUpdate]);
}