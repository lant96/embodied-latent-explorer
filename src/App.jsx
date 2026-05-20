import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generatePoints } from "./data/points";
import { usePose } from "./hooks/usePose";
import { useRef, useState } from "react";

/* -------------------------
   POINT CLOUD
--------------------------*/
function Points() {
  const points = generatePoints(500);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <points>
      <bufferGeometry attach="geometry" {...geometry} />
      <pointsMaterial color="white" size={0.05} />
    </points>
  );
}

/* -------------------------
   CAMERA CONTROLLER
--------------------------*/
function CameraController({ pose }) {
  const { camera } = useThree();

  const target = useRef(new THREE.Vector3(0, 0, 5));

  useFrame(() => {
    if (pose) {
      const x = (pose.x - 0.5) * 2;
      const y = (pose.y - 0.5) * 2;

      target.current.x = x * 0.6;
      target.current.y = -y * 0.6;
      target.current.z = 5;
    } else {
      target.current.set(0, 0, 5);
    }

    camera.position.lerp(target.current, 0.08);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* -------------------------
   UI (DEBUG + RESEARCH FEEDBACK)
--------------------------*/
function UI({ pose }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        color: "white",
        fontFamily: "sans-serif",
        fontSize: "12px",
        zIndex: 10,
      }}
    >
      <div><b>Embodied Latent Explorer</b></div>
      <div>Move your body to navigate</div>

      <hr />

      <div>Pose X: {pose?.x?.toFixed(3) ?? "..."}</div>
      <div>Pose Y: {pose?.y?.toFixed(3) ?? "..."}</div>
    </div>
  );
}

/* -------------------------
   MAIN APP
--------------------------*/
export default function App() {
  const poseRef = useRef(null);
  const [pose, setPose] = useState(null);

  // receive pose updates
  usePose((data) => {
    poseRef.current = data;
    setPose(data);
  });

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      <UI pose={pose} />

      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />

        <Points />

        <CameraController pose={poseRef.current} />

        {/* optional manual debug control */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}