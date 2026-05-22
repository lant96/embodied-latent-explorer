import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

const COUNT    = 280;
const SPREAD   = { x: 12, y: 8, z: 10 };
const SIZE_MIN = 0.06;
const SIZE_MAX = 0.22;


const PALETTE = [
  // Oranges — cosmos, calendula (dominant)
  { h: 25,  s: 0.88, l: 0.58, w: 4 },
  { h: 18,  s: 0.90, l: 0.52, w: 3 },
  { h: 35,  s: 0.82, l: 0.62, w: 3 },
  // Red-orange — the deep red cosmos centre
  { h: 5,   s: 0.85, l: 0.48, w: 2 },
  { h: 358, s: 0.78, l: 0.44, w: 1 },
  // Purple / lavender — verbena, aster
  { h: 278, s: 0.55, l: 0.55, w: 2 },
  { h: 290, s: 0.45, l: 0.62, w: 1 },
  // Dusty pink — the babys-breath clusters
  { h: 345, s: 0.45, l: 0.72, w: 3 },
  { h: 350, s: 0.38, l: 0.78, w: 2 },
  // Creamy white — white cosmos
  { h: 40,  s: 0.30, l: 0.88, w: 2 },
  { h: 30,  s: 0.20, l: 0.92, w: 1 },
  // Warm yellow-gold — small background buds
  { h: 48,  s: 0.80, l: 0.60, w: 1 },
];


const POOL = PALETTE.flatMap((entry) =>
  Array(entry.w).fill(entry)
);

function pickColor(z) {
  const entry = POOL[Math.floor(Math.random() * POOL.length)];
  
  const lightnessBoost = THREE.MathUtils.lerp(0.06, 0, (z + 5) / 10);
  return new THREE.Color().setHSL(
    entry.h / 360,
    entry.s,
    Math.min(entry.l + lightnessBoost, 0.96)
  );
}

// Component
export default function Balls() {
  const meshRef = useRef();

  const instanceData = useMemo(() => {
    const dummy = new THREE.Object3D();
    const items = [];

    for (let i = 0; i < COUNT; i++) {
      const x     = (Math.random() - 0.5) * SPREAD.x;
      const y     = (Math.random() - 0.5) * SPREAD.y;
      const z     = (Math.random() - 0.5) * SPREAD.z;
      const scale = SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN);
      const color = pickColor(z);
      items.push({ x, y, z, scale, color });
    }

    return { dummy, items };
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { dummy, items } = instanceData;

    items.forEach(({ x, y, z, scale, color }, i) => {
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instanceData]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, COUNT]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 0.1]} /> 
      
      <meshStandardMaterial roughness={0.8} metalness={0.2} />
    </instancedMesh>
  );
}
