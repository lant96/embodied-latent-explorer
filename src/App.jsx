import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState } from "react";

import Balls from "./components/Points";
import CameraController from "./components/CameraController";
import UI from "./components/UI";

import { usePose } from "./hooks/usePose";

export default function App() {
  const poseRef = useRef(null);
  const [pose, setPose] = useState(null);

  usePose((data) => {
    poseRef.current = data;
    setPose(data);
  });

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f0ebe0" }}>
      <UI pose={pose} />

      <Canvas camera={{ position: [0, 0, 6], fov: 55 }} shadows>
        
        <color attach="background" args={["#f0ebe0"]} />
        <fog attach="fog" args={["#f0ebe0", 8, 22]} />
        <ambientLight intensity={1.5} color="#fff8ef" />
        <directionalLight
          position={[7, 9, 4]}
          intensity={1.6}
          color="#ffe8c0"
          castShadow
        />

        <directionalLight
          position={[-4, -3, -2]}
          intensity={0.4}
          color="#d4c8bd"
        />

        <directionalLight
          position={[0, -1, -5]}
          intensity={0.2}
          color="#f5ede0"
        />

        <Balls />
        <CameraController pose={poseRef.current} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
