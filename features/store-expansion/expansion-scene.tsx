"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MAX_CHECKOUTS, MAX_SHELVES, type Shelf } from "@/features/shared/game-state";
import { PRODUCT_LOOKS, ProductItem } from "@/features/shared/product-models";

// 3D preview of the store. Owned upgrades are solid; the next one is a ghost.

type ExpansionSceneProps = {
  shelves: Shelf[];
  checkouts: number;
  level: number;
};

const COLUMNS = 4;

function shelfPosition(index: number): [number, number, number] {
  const col = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  return [(col - (COLUMNS - 1) / 2) * 3.2, 0, -2 - row * 3];
}

function counterX(index: number, count: number) {
  return (index - (count - 1) / 2) * 3;
}

export function ExpansionScene({ shelves, checkouts, level }: ExpansionSceneProps) {
  const nextShelf = shelves.length < MAX_SHELVES ? shelves.length : null;
  const nextCounter = checkouts < MAX_CHECKOUTS ? checkouts : null;
  // Counters are centered, so draw the ghost one slot beyond the owned ones.
  const counterSlots = nextCounter === null ? checkouts : checkouts + 1;

  return (
    <Canvas shadows camera={{ position: [0, 9, 12], fov: 50 }} className="touch-none">
      <color attach="background" args={["#fdf3dc"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 14, 8]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[24, 22]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <mesh position={[0, 1.5, -12.5]}>
        <boxGeometry args={[24, 3, 0.3]} />
        <meshStandardMaterial color="#ffd180" />
      </mesh>
      <Html position={[0, 3.6, -12]} center distanceFactor={12} pointerEvents="none">
        <div className="rounded-lg bg-amber-500 px-5 py-1.5 text-lg font-black text-white shadow">
          ⭐ Store level {level}
        </div>
      </Html>

      {shelves.map((shelf, i) => (
        <Shelf3D key={i} position={shelfPosition(i)} productId={shelf.productId} quantity={shelf.quantity} />
      ))}
      {nextShelf !== null && <Shelf3D ghost position={shelfPosition(nextShelf)} productId={null} quantity={0} />}

      {Array.from({ length: counterSlots }, (_, i) => {
        const ghost = i >= checkouts;
        return <Counter3D key={i} x={counterX(i, counterSlots)} ghost={ghost} />;
      })}

      <OrbitControls target={[0, 0, 1]} minDistance={6} maxDistance={30} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}

function Shelf3D({
  position,
  productId,
  quantity,
  ghost = false,
}: {
  position: [number, number, number];
  productId: string | null;
  quantity: number;
  ghost?: boolean;
}) {
  const look = productId ? PRODUCT_LOOKS[productId] : null;
  const material = ghost ? (
    <meshStandardMaterial color="#26a69a" transparent opacity={0.3} />
  ) : (
    <meshStandardMaterial color="#b0bec5" />
  );

  return (
    <group position={position}>
      <mesh position={[0, 0.75, -0.4]} castShadow>
        <boxGeometry args={[2.4, 1.5, 0.06]} />
        {material}
      </mesh>
      {[0.1, 0.75].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[2.4, 0.05, 0.8]} />
          {material}
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.2, 0.75, 0]}>
          <boxGeometry args={[0.06, 1.5, 0.8]} />
          {material}
        </mesh>
      ))}
      {look &&
        Array.from({ length: quantity }, (_, i) => (
          <ProductItem
            key={i}
            look={look}
            position={[((i % 5) - 2) * 0.44, (i < 5 ? 0.1 : 0.75) + 0.025 + look.size / 2, 0.05]}
          />
        ))}
      {ghost && (
        <Html position={[0, 1.2, 0]} center distanceFactor={12} pointerEvents="none">
          <div className="whitespace-nowrap rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white shadow">
            + Next shelf
          </div>
        </Html>
      )}
    </group>
  );
}

function Counter3D({ x, ghost }: { x: number; ghost: boolean }) {
  return (
    <group position={[x, 0, 5]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.8, 0.9, 0.8]} />
        {ghost ? (
          <meshStandardMaterial color="#26a69a" transparent opacity={0.3} />
        ) : (
          <meshStandardMaterial color="#26a69a" />
        )}
      </mesh>
      {!ghost && (
        <mesh position={[0.5, 1.05, 0]} castShadow>
          <boxGeometry args={[0.45, 0.3, 0.4]} />
          <meshStandardMaterial color="#37474f" />
        </mesh>
      )}
      {ghost && (
        <Html position={[0, 1.5, 0]} center distanceFactor={12} pointerEvents="none">
          <div className="whitespace-nowrap rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white shadow">
            + Next counter
          </div>
        </Html>
      )}
    </group>
  );
}
