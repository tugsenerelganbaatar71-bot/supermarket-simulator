"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Group } from "three";
import { BACK_UNITS, COUNTER_DX, DOOR_WIDTH, SHOP_FRONT_Z, backWallZ, counterZ, type Shop } from "./shops";

// Pieces that make the town look full: windowed buildings, shop fronts,
// street lamps, benches, parked cars and people strolling on the sidewalk.

export type BuildingBlockData = { x: number; z: number; w: number; d: number; h: number; color: string };

// Window grid painted once and tiled over the buildings.
let windowTexture: CanvasTexture | null = null;
function getWindowTexture() {
  if (windowTexture) return windowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 64, 64);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      g.fillStyle = (r * 2 + c) % 3 === 0 ? "#ffe9a8" : "#6d8aa6";
      g.fillRect(8 + c * 28, 8 + r * 28, 20, 20);
    }
  }
  windowTexture = new CanvasTexture(canvas);
  windowTexture.wrapS = windowTexture.wrapT = RepeatWrapping;
  windowTexture.colorSpace = SRGBColorSpace;
  return windowTexture;
}

export function BuildingBlock({ block: b }: { block: BuildingBlockData }) {
  const map = useMemo(() => {
    const t = getWindowTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(1, Math.round(b.w / 2.5)), Math.max(1, Math.round(b.h / 2.5)));
    return t;
  }, [b.w, b.h]);
  return (
    <group position={[b.x, b.h / 2, b.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshStandardMaterial color={b.color} map={map} />
      </mesh>
      <mesh position={[0, b.h / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[b.w + 0.3, 0.3, b.d + 0.3]} />
        <meshStandardMaterial color="#78909c" />
      </mesh>
    </group>
  );
}

export function ShopBuilding({ shop }: { shop: Shop }) {
  const z = SHOP_FRONT_Z - shop.d / 2;
  return (
    <group position={[shop.x, 0, z]}>
      <mesh position={[0, shop.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[shop.w, shop.h, shop.d]} />
        <meshStandardMaterial color={shop.color} />
      </mesh>
      <mesh position={[0, shop.h + 0.15, 0]} castShadow>
        <boxGeometry args={[shop.w + 0.4, 0.3, shop.d + 0.4]} />
        <meshStandardMaterial color={shop.accent} />
      </mesh>
      <mesh position={[0, 1.1, shop.d / 2 + 0.03]}>
        <boxGeometry args={[1.5, 2.2, 0.08]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {[-2.1, 2.1].map((dx) => (
        <mesh key={dx} position={[dx, 1.6, shop.d / 2 + 0.03]}>
          <boxGeometry args={[1.8, 1.5, 0.08]} />
          <meshStandardMaterial color="#b3e5fc" emissive="#fff8e1" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {[-2.8, -1.4, 0, 1.4, 2.8].map((dx, i) => (
        <mesh key={dx} position={[dx, 2.7, shop.d / 2 + 0.6]} rotation-x={0.35} castShadow>
          <boxGeometry args={[1.4, 0.08, 1.4]} />
          <meshStandardMaterial color={i % 2 ? "#ffffff" : shop.accent} />
        </mesh>
      ))}
      <mesh position={[0, 3.6, shop.d / 2 + 0.1]}>
        <boxGeometry args={[4.6, 0.8, 0.15]} />
        <meshStandardMaterial color={shop.accent} />
      </mesh>
      <Html position={[0, 3.6, shop.d / 2 + 0.25]} center transform distanceFactor={6} pointerEvents="none">
        <div className="whitespace-nowrap text-2xl font-black text-white">
          {shop.emoji} {shop.name.toUpperCase()}
        </div>
      </Html>
      {/* glowing spot where you stand to shop */}
      <mesh position={[0, 0.01, shop.d / 2 + 1.3]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.9, 24]} />
        <meshStandardMaterial color={shop.accent} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function Lamp({ x }: { x: number }) {
  return (
    <group position={[x, 0, 9.4]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 3.2, 8]} />
        <meshStandardMaterial color="#37474f" />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#fff59d" emissive="#ffe082" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

export function Bench({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      <mesh position={[0, 0.8, -0.22]} castShadow>
        <boxGeometry args={[1.8, 0.4, 0.08]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {[-0.8, 0.8].map((dx) => (
        <mesh key={dx} position={[dx, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.44, 0.45]} />
          <meshStandardMaterial color="#37474f" />
        </mesh>
      ))}
    </group>
  );
}

export function ParkedCar({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, 0, 12.9]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.1, 0.5, 2.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.85, -0.1]} castShadow>
        <boxGeometry args={[0.95, 0.4, 1.2]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>
    </group>
  );
}

// A person strolling along the sidewalk.
export function Pedestrian({
  z,
  speed,
  offset,
  color,
}: {
  z: number;
  speed: number;
  offset: number;
  color: string;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const span = 100;
    const t = state.clock.elapsedTime * speed + offset;
    g.position.set(
      (((t % span) + span) % span) - span / 2,
      Math.abs(Math.sin(state.clock.elapsedTime * 7 + offset)) * 0.05,
      z,
    );
  });
  return (
    <group ref={ref} rotation-y={speed > 0 ? Math.PI / 2 : -Math.PI / 2}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.4, 0.7, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#ffcc99" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.32, 0.5, 0.2]} />
        <meshStandardMaterial color="#37474f" />
      </mesh>
    </group>
  );
}

// ---------- walk-in shops (clothes, games): hollow, with a door and furniture ----------

const GOOD_COLORS = ["#ef5350", "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#26c6da"];

export function WalkInShop({ shop }: { shop: Shop }) {
  const half = DOOR_WIDTH / 2;
  const segW = shop.w / 2 - half;
  const front = shop.d / 2; // local z of the front wall
  const clothes = shop.id === "clothes";

  return (
    <group position={[shop.x, 0, SHOP_FRONT_Z - shop.d / 2]}>
      {/* floor */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[shop.w, 0.06, shop.d]} />
        <meshStandardMaterial color={clothes ? "#f3e5f5" : "#37474f"} />
      </mesh>
      {/* back and side walls */}
      <mesh position={[0, shop.h / 2, -front]} castShadow receiveShadow>
        <boxGeometry args={[shop.w, shop.h, 0.3]} />
        <meshStandardMaterial color={shop.color} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * shop.w / 2, shop.h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, shop.h, shop.d]} />
          <meshStandardMaterial color={shop.color} />
        </mesh>
      ))}
      {/* front wall with a door gap */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (half + segW / 2), shop.h / 2, front]} castShadow>
          <boxGeometry args={[segW, shop.h, 0.3]} />
          <meshStandardMaterial color={shop.color} />
        </mesh>
      ))}
      <mesh position={[0, 3.2 + (shop.h - 3.2) / 2, front]} castShadow>
        <boxGeometry args={[DOOR_WIDTH, shop.h - 3.2, 0.3]} />
        <meshStandardMaterial color={shop.accent} />
      </mesh>
      {/* big shop windows beside the door */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (half + segW / 2), 1.7, front + 0.17]}>
          <boxGeometry args={[segW - 0.8, 1.6, 0.05]} />
          <meshStandardMaterial color="#b3e5fc" emissive="#fff8e1" emissiveIntensity={0.2} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* roof */}
      <mesh position={[0, shop.h + 0.15, 0]} castShadow>
        <boxGeometry args={[shop.w + 0.5, 0.3, shop.d + 0.5]} />
        <meshStandardMaterial color={shop.accent} />
      </mesh>
      {/* sign */}
      <mesh position={[0, shop.h - 0.7, front + 0.25]}>
        <boxGeometry args={[4.4, 0.7, 0.1]} />
        <meshStandardMaterial color={shop.accent} />
      </mesh>
      <Html position={[0, shop.h - 0.7, front + 0.35]} center transform distanceFactor={6} pointerEvents="none">
        <div className="whitespace-nowrap text-xl font-black text-white">
          {shop.emoji} {shop.name.toUpperCase()}
        </div>
      </Html>
      <pointLight position={[0, shop.h - 0.8, 0]} intensity={14} distance={12} color="#fff3e0" />

      {/* display units along the back wall */}
      {BACK_UNITS.map((dx, u) => (
        <group key={dx} position={[dx, 0, backWallZ(shop) - (SHOP_FRONT_Z - shop.d / 2) + 0.6]}>
          {clothes ? (
            <>
              <mesh position={[0, 1.7, 0]} castShadow>
                <boxGeometry args={[2.2, 0.06, 0.06]} />
                <meshStandardMaterial color="#9e9e9e" metalness={0.7} roughness={0.3} />
              </mesh>
              {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
                <mesh key={x} position={[x, 1.2, 0]} castShadow>
                  <boxGeometry args={[0.38, 0.9, 0.12]} />
                  <meshStandardMaterial color={GOOD_COLORS[(u + i) % GOOD_COLORS.length]} />
                </mesh>
              ))}
            </>
          ) : (
            <>
              {[0.4, 1.1, 1.8].map((y) => (
                <mesh key={y} position={[0, y, 0]} castShadow>
                  <boxGeometry args={[2.2, 0.06, 0.8]} />
                  <meshStandardMaterial color="#cfd8dc" />
                </mesh>
              ))}
              {[0.4, 1.1, 1.8].flatMap((y, r) =>
                [-0.85, -0.45, -0.05, 0.35, 0.75].map((x, i) => (
                  <mesh key={`${y}${x}`} position={[x, y + 0.27, 0]} castShadow>
                    <boxGeometry args={[0.32, 0.46, 0.1]} />
                    <meshStandardMaterial color={GOOD_COLORS[(u + r + i) % GOOD_COLORS.length]} />
                  </mesh>
                )),
              )}
            </>
          )}
        </group>
      ))}

      {/* checkout counter + cashier */}
      <group position={[COUNTER_DX, 0, counterZ() - (SHOP_FRONT_Z - shop.d / 2)]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1, 0.9]} />
          <meshStandardMaterial color={shop.accent} />
        </mesh>
        <mesh position={[0.5, 1.15, 0]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
          <meshStandardMaterial color="#37474f" />
        </mesh>
        <mesh position={[-0.3, 1.0, -0.9]} castShadow>
          <boxGeometry args={[0.45, 0.8, 0.3]} />
          <meshStandardMaterial color="#455a64" />
        </mesh>
        <mesh position={[-0.3, 1.6, -0.9]} castShadow>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color="#ffcc99" />
        </mesh>
      </group>

      {/* arcade cabinet in the game store, mannequin in the fashion store */}
      {clothes ? (
        <group position={[-3.6, 0, 1]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 1.4, 12]} />
            <meshStandardMaterial color="#ec407a" />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <sphereGeometry args={[0.2, 14, 14]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
        </group>
      ) : (
        <group position={[-3.6, 0, 1]}>
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[0.9, 2, 0.9]} />
            <meshStandardMaterial color="#1a237e" />
          </mesh>
          <mesh position={[0, 1.4, 0.46]}>
            <boxGeometry args={[0.7, 0.55, 0.04]} />
            <meshStandardMaterial color="#80deea" emissive="#26c6da" emissiveIntensity={1} />
          </mesh>
        </group>
      )}
    </group>
  );
}
