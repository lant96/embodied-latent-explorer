import { useEffect, useRef } from "react";
import { initPose } from "../core/poseController";

// usePose — initialises pose detection once and pipes updates to a callback

export function usePose(onUpdate) {
  const onUpdateRef = useRef(onUpdate);

  onUpdateRef.current = onUpdate;

  useEffect(() => {
    initPose((data) => onUpdateRef.current(data));
  }, []); 
}