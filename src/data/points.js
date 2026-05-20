import * as THREE from "three";

export function generatePoints(count = 500) {
  const points = [];

  for (let i = 0; i < count; i++) {
    points.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      )
    );
  }

  return points;
}