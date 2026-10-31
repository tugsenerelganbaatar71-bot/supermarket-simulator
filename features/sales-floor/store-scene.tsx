"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3, type Group } from "three";
import { SHELF_CAPACITY, getProduct, type Shelf } from "@/features/shared/game-state";
import type { Customer } from "./simulation";

// 3D view of the sales floor (three.js via @react-three/fiber).

export type LeavingCustomer = {
  id: number;
  counterIndex: number;
  until: number; // timestamp when it is removed from the scene
};

type StoreSceneProps = {
  shelves: Shelf[];
  prices: Record<string, number>;
  checkouts: number;
  customers: Customer[];
  leaving: LeavingCustomer[];
};

type Look = { color: string; shape: "box" | "sphere" | "cylinder"; size: number };

const PRODUCT_LOOKS: Record<string, Look> = {
  apple: { color: "#e53935", shape: "sphere", size: 0.3 },
  bread: { color: "#d4a056", shape: "box", size: 0.32 },
  milk: { color: "#f5f5f5", shape: "cylinder", size: 0.3 },
  eggs: { color: "#fff1c1", shape: "sphere", size: 0.26 },
  cheese: { color: "#fbc02d", shape: "box", size: 0.3 },
  juice: { color: "#ff9800", shape: "box", size: 0.3 },
  cookies: { color: "#8d6e63", shape: "cylinder", size: 0.32 },
  coffee: { color: "#4e342e", shape: "cylinder", size: 0.3 },
  chocolate: { color: "#6d4c41", shape: "box", size: 0.28 },
  watermelon: { color: "#43a047", shape: "sphere", size: 0.36 },
};

const CUSTOMER_COLORS = ["#1e88e5", "#8e24aa", "#f4511e", "#00897b", "#c0ca33", "#d81b60", "#5e35b1", "#fb8c00"];

const SHELF_COLUMNS = 4;
const SHELF_WIDTH = 2.4;
const SHELF_DEPTH = 0.8;
const SHELF_LEVELS = [0.1, 0.75]; // board heights
const ITEMS_PER_LEVEL = SHELF_CAPACITY / SHELF_LEVELS.length;

const COUNTER_Z = 5;
const SERVE_Z = 4.2; // where the customer being served stands
const QUEUE_SPACING = 0.7;
const ENTRANCE = new Vector3(-10, 0, 6);
const EXIT = new Vector3(10, 0, 7);

function shelfPosition(index: number): [number, number, number] {
  const col = index % SHELF_COLUMNS;
  const row = Math.floor(index / SHELF_COLUMNS);
  return [(col - (SHELF_COLUMNS - 1) / 2) * 3.2, 0, -2 - row * 3];
}

function counterX(index: number, checkouts: number) {
  return (index - (checkouts - 1) / 2) * 3;
}

/** Where customer number `index` in the line should stand. */
function queueSpot(index: number, checkouts: number): Vector3 {
  const lane = index % checkouts;
  const depth = Math.floor(index / checkouts);
  return new Vector3(counterX(lane, checkouts), 0, SERVE_Z - depth * QUEUE_SPACING);
}

export function StoreScene({ shelves, prices, checkouts, customers, leaving }: StoreSceneProps) {
  return (
    <Canvas shadows camera={{ position: [0, 11, 14], fov: 45 }} className="touch-none">
      <color attach="background" args={["#dff3ea"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 14, 8]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />

      <Building />

      {shelves.map((shelf, i) => (
        <ShelfUnit
          key={i}
          shelf={shelf}
          price={shelf.productId ? prices[shelf.productId] : 0}
          position={shelfPosition(i)}
        />
      ))}

      {Array.from({ length: checkouts }, (_, i) => (
        <CheckoutCounter key={i} x={counterX(i, checkouts)} number={i + 1} />
      ))}

      {customers.map((customer, index) => (
        <Person
          key={customer.id}
          id={customer.id}
          start={ENTRANCE}
          target={queueSpot(index, checkouts)}
          basket={
            index < checkouts
              ? customer.basket.map((b) => getProduct(b.productId).emoji).join("")
              : undefined
          }
        />
      ))}

      {leaving.map((person) => (
        <Person
          key={person.id}
          id={person.id}
          start={queueSpot(person.counterIndex, checkouts)}
          target={EXIT}
          basket="🛍️"
        />
      ))}

      <OrbitControls
        target={[0, 0, 0]}
        minDistance={6}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}

function Building() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[24, 22]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <gridHelper args={[24, 24, "#d6d0c4", "#e4dfd4"]} position={[0, 0.01, -1]} />
      <mesh position={[0, 1.5, -12.5]} receiveShadow>
        <boxGeometry args={[24, 3, 0.3]} />
        <meshStandardMaterial color="#9ad3bc" />
      </mesh>
      <Html position={[0, 2.3, -12.3]} center transform distanceFactor={8} pointerEvents="none">
        <div className="rounded-lg bg-emerald-600 px-6 py-2 text-4xl font-black tracking-widest text-white">
          SUPERMARKET
        </div>
      </Html>
      {/* entrance and exit mats */}
      <mesh rotation-x={-Math.PI / 2} position={[ENTRANCE.x + 0.5, 0.02, ENTRANCE.z]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#43a047" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[EXIT.x - 0.5, 0.02, EXIT.z]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#e53935" />
      </mesh>
    </group>
  );
}

function ShelfUnit({ shelf, price, position }: { shelf: Shelf; price: number; position: [number, number, number] }) {
  const product = shelf.productId ? getProduct(shelf.productId) : null;
  const look = shelf.productId ? PRODUCT_LOOKS[shelf.productId] : null;
  const empty = !product || shelf.quantity === 0;

  return (
    <group position={position}>
      {/* frame: back panel, sides and boards */}
      <mesh position={[0, 0.75, -SHELF_DEPTH / 2]} castShadow receiveShadow>
        <boxGeometry args={[SHELF_WIDTH, 1.5, 0.06]} />
        <meshStandardMaterial color="#b0bec5" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * SHELF_WIDTH) / 2, 0.75, 0]} castShadow>
          <boxGeometry args={[0.06, 1.5, SHELF_DEPTH]} />
          <meshStandardMaterial color="#90a4ae" />
        </mesh>
      ))}
      {SHELF_LEVELS.map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[SHELF_WIDTH, 0.05, SHELF_DEPTH]} />
          <meshStandardMaterial color="#eceff1" />
        </mesh>
      ))}

      {/* one small 3D item per unit on the shelf */}
      {look &&
        Array.from({ length: shelf.quantity }, (_, i) => {
          const level = Math.floor(i / ITEMS_PER_LEVEL);
          const slot = i % ITEMS_PER_LEVEL;
          const x = (slot - (ITEMS_PER_LEVEL - 1) / 2) * 0.44;
          const y = SHELF_LEVELS[level] + 0.025 + look.size / 2;
          return <ProductItem key={i} look={look} position={[x, y, 0.05]} />;
        })}

      <Html position={[0, 1.95, 0]} center distanceFactor={12} pointerEvents="none">
        <div
          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold shadow ${
            empty ? "bg-rose-500 text-white" : "bg-white text-zinc-800"
          }`}
        >
          {empty
            ? `${product ? product.emoji + " " : ""}Empty`
            : `${product.emoji} ${shelf.quantity}/${SHELF_CAPACITY} · $${price}`}
        </div>
      </Html>
    </group>
  );
}

function ProductItem({ look, position }: { look: Look; position: [number, number, number] }) {
  const s = look.size;
  return (
    <mesh position={position} castShadow>
      {look.shape === "sphere" && <sphereGeometry args={[s / 2, 16, 12]} />}
      {look.shape === "box" && <boxGeometry args={[s, s, s * 0.8]} />}
      {look.shape === "cylinder" && <cylinderGeometry args={[s / 2.4, s / 2.4, s, 16]} />}
      <meshStandardMaterial color={look.color} roughness={0.5} />
    </mesh>
  );
}

function CheckoutCounter({ x, number }: { x: number; number: number }) {
  return (
    <group position={[x, 0, COUNTER_Z]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.9, 0.8]} />
        <meshStandardMaterial color="#26a69a" />
      </mesh>
      <mesh position={[0.5, 1.05, 0]} castShadow>
        <boxGeometry args={[0.45, 0.3, 0.4]} />
        <meshStandardMaterial color="#37474f" />
      </mesh>
      {/* cashier */}
      <mesh position={[0, 0.7, 0.8]} castShadow>
        <capsuleGeometry args={[0.25, 0.6, 4, 12]} />
        <meshStandardMaterial color="#00695c" />
      </mesh>
      <mesh position={[0, 1.4, 0.8]} castShadow>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshStandardMaterial color="#f1c27d" />
      </mesh>
      <Html position={[0, 2, 0.8]} center distanceFactor={12} pointerEvents="none">
        <div className="rounded bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">#{number}</div>
      </Html>
    </group>
  );
}

function Person({ id, start, target, basket }: { id: number; start: Vector3; target: Vector3; basket?: string }) {
  const ref = useRef<Group>(null);
  const placed = useRef(false);
  const color = CUSTOMER_COLORS[id % CUSTOMER_COLORS.length];

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    if (!placed.current) {
      group.position.copy(start);
      placed.current = true;
    }
    const before = group.position.clone();
    // Walk toward the target at a steady pace.
    const toTarget = target.clone().sub(group.position);
    const distance = toTarget.length();
    const step = Math.min(distance, delta * 4);
    if (distance > 0.01) {
      group.position.add(toTarget.normalize().multiplyScalar(step));
      group.rotation.y = Math.atan2(group.position.x - before.x, group.position.z - before.z);
    }
    const moving = distance > 0.05;
    group.position.y = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.08 : 0;
  });

  return (
    <group ref={ref} position={[start.x, 0, start.z]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.6, 4, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshStandardMaterial color="#f1c27d" />
      </mesh>
      {basket && (
        <Html position={[0, 1.9, 0]} center distanceFactor={12} pointerEvents="none">
          <div className="whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-sm shadow">{basket}</div>
        </Html>
      )}
    </group>
  );
}
