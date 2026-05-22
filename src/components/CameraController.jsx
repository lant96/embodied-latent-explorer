import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const ZONE_ENTER = 0.18;
const ZONE_EXIT  = 0.08;

const ZONE_X = { LEFT: -2.2, CENTER: 0, RIGHT: 2.2 };

const LERP_SPEED = 0.055;

export default function CameraController({ pose }) {
  const { camera } = useThree();
  const target      = useRef(new THREE.Vector3(0, 0, 5.5));
  const currentZone = useRef("CENTER");

  useFrame(() => {
    if (!pose) return;

    const dx = pose.x ?? 0;
    const dy = pose.y ?? 0;

    // Horizontal
    
    if (currentZone.current === "CENTER") {
      if (dx < -ZONE_ENTER) currentZone.current = "LEFT";
      else if (dx > ZONE_ENTER) currentZone.current = "RIGHT";
    } else if (currentZone.current === "LEFT") {
      if (dx > -ZONE_EXIT) currentZone.current = "CENTER";
    } else if (currentZone.current === "RIGHT") {
      if (dx < ZONE_EXIT) currentZone.current = "CENTER";
    }

    // Vertical 
    
    target.current.x = ZONE_X[currentZone.current];
    target.current.y = THREE.MathUtils.clamp(-dy * 1.8, -1.5, 1.5);
    target.current.z = 5.5;

    camera.position.lerp(target.current, LERP_SPEED);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
