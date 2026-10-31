"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { getProduct } from "@/features/shared/game-state";
import { PRODUCT_LOOKS, ProductItem } from "@/features/shared/product-models";

// 3D storage room: one pallet of crates per product (1 crate = 5 units).

const UNITS_PER_CRATE = 5;
const MAX_CRATES = 12;
const COLUMNS = 5;

type StorageSceneProps = {
  products: string[]; // unlocked product ids
  storage: Record<string, number>;
};

function palletPosition(index: number): [number, number, number] {
  const col = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  return [(col - (COLUMNS - 1) / 2) * 2.6, 0, row * 3 - 0.5];
}

export function StorageScene({ products, storage }: StorageSceneProps) {
  return (
    <Canvas shadows camera={{ position: [0, 6.5, 9.5], fov: 50 }} className="touch-none">
      <color attach="background" args={["#e8eef5"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 10, 6]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 1]} receiveShadow>
        <planeGeometry args={[22, 14]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>
      <mesh position={[0, 1.5, -3.5]} receiveShadow>
        <boxGeometry args={[22, 3, 0.2]} />
        <meshStandardMaterial color="#90a4ae" />
      </mesh>

      {products.map((id, i) => (
        <Pallet key={id} productId={id} units={storage[id] ?? 0} position={palletPosition(i)} />
      ))}

      <Truck />

      <OrbitControls target={[0, 0.5, 1]} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}

function Pallet({
  productId,
  units,
  position,
}: {
  productId: string;
  units: number;
  position: [number, number, number];
}) {
  const product = getProduct(productId);
  const look = PRODUCT_LOOKS[productId];
  const crates = Math.min(MAX_CRATES, Math.ceil(units / UNITS_PER_CRATE));

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.12, 1.9]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {Array.from({ length: crates }, (_, k) => {
        const layer = Math.floor(k / 4);
        const slot = k % 4;
        const x = ((slot % 2) - 0.5) * 0.9;
        const z = (Math.floor(slot / 2) - 0.5) * 0.9;
        const y = 0.12 + 0.35 + layer * 0.7;
        return (
          <group key={k} position={[x, y, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.82, 0.66, 0.82]} />
              <meshStandardMaterial color="#d2a86a" />
            </mesh>
            <ProductItem look={look} position={[0, 0.4, 0]} scale={1.3} />
          </group>
        );
      })}
      <Html position={[0, 0.9 + Math.ceil(crates / 4) * 0.7, 0]} center distanceFactor={12} pointerEvents="none">
        <div
          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold shadow ${
            units === 0 ? "bg-rose-500 text-white" : "bg-white text-zinc-800"
          }`}
        >
          {product.emoji} {product.name}: {units}
        </div>
      </Html>
    </group>
  );
}

function Truck() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02;
  });

  return (
    <group ref={ref} position={[-9, 0, 4.5]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 1, -0.9]} castShadow>
        <boxGeometry args={[1.8, 1.8, 3]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0, 0.75, 1.1]} castShadow>
        <boxGeometry args={[1.7, 1.3, 1.2]} />
        <meshStandardMaterial color="#26a69a" />
      </mesh>
      {[-0.95, 0.95].flatMap((x) =>
        [-1.6, 1.2].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.3, z]} rotation-z={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#263238" />
          </mesh>
        )),
      )}
      <Html position={[0, 2.4, -0.9]} center distanceFactor={12} pointerEvents="none">
        <div className="whitespace-nowrap rounded bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">
          🚚 Supplier
        </div>
      </Html>
    </group>
  );
}
