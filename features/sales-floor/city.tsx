"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

// The town around the store: grass, sidewalk, road with moving cars,
// neighbouring buildings and trees. The store floor spans x -12..12, z -13..9.

type Block = { x: number; z: number; w: number; d: number; h: number; color: string };

const BUILDING_COLORS = ["#b0bec5", "#ffcc80", "#90caf9", "#ce93d8", "#a5d6a7", "#ef9a9a", "#fff59d", "#80cbc4"];

// Deterministic pseudo-random numbers so the town looks the same every render.
function seeded(seed: number) {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

function makeBlocks(): Block[] {
  const blocks: Block[] = [];
  const add = (x: number, z: number, i: number) => {
    blocks.push({
      x,
      z,
      w: 5 + seeded(i) * 4,
      d: 5 + seeded(i + 50) * 4,
      h: 4 + seeded(i + 100) * 12,
      color: BUILDING_COLORS[i % BUILDING_COLORS.length],
    });
  };
  // neighbours left and right of the store
  [-1, 1].forEach((side, s) => {
    for (let k = 0; k < 4; k++) add(side * (20 + k * 9), -6 - (k % 2) * 2, s * 10 + k);
  });
  // buildings behind the store
  for (let k = -5; k <= 5; k++) add(k * 9, -24 - (Math.abs(k) % 2) * 3, 30 + k + 5);
  // buildings across the road
  for (let k = -5; k <= 5; k++) add(k * 9 + 3, 30 + (Math.abs(k) % 2) * 2, 60 + k + 5);
  return blocks;
}

const BLOCKS = makeBlocks();

const TREES: [number, number][] = [
  [-16, 10.5], [-21, 10.5], [21, 10.5], [16, 10.5], [-26, 10.5], [26, 10.5],
  [-17, -14], [17, -14], [-30, -14], [30, -14],
];

const CARS = [
  { lane: 14, speed: 4, offset: 0, color: "#e53935" },
  { lane: 14, speed: 3, offset: 30, color: "#1e88e5" },
  { lane: 16, speed: -3.5, offset: 10, color: "#fdd835" },
  { lane: 16, speed: -5, offset: 45, color: "#43a047" },
];
const ROAD_HALF = 60;

export function City() {
  return (
    <group>
      {/* grass, sidewalk and road */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[240, 240]} />
        <meshStandardMaterial color="#9ccc65" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 10.5]} receiveShadow>
        <planeGeometry args={[240, 3]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.015, 15]} receiveShadow>
        <planeGeometry args={[240, 6]} />
        <meshStandardMaterial color="#455a64" />
      </mesh>
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-55 + i * 5, -0.005, 15]}>
          <planeGeometry args={[2, 0.15]} />
          <meshStandardMaterial color="#fafafa" />
        </mesh>
      ))}

      {BLOCKS.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}

      {TREES.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 1.2, 8]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <coneGeometry args={[0.9, 2, 10]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
        </group>
      ))}

      {CARS.map((car, i) => (
        <Car key={i} {...car} />
      ))}
    </group>
  );
}

function Car({ lane, speed, offset, color }: { lane: number; speed: number; offset: number; color: string }) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const span = ROAD_HALF * 2;
    const travelled = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = ((((travelled + ROAD_HALF) % span) + span) % span) - ROAD_HALF;
  });

  return (
    <group ref={ref} position={[0, 0, lane]} rotation-y={speed > 0 ? Math.PI / 2 : -Math.PI / 2}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.1, 0.5, 2.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.85, -0.1]} castShadow>
        <boxGeometry args={[0.95, 0.4, 1.2]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>
      {[-0.55, 0.55].flatMap((x) =>
        [-0.8, 0.8].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.25, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
        )),
      )}
    </group>
  );
}
