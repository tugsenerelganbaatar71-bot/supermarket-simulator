"use client";

import { ContactShadows, Html, OrbitControls, RoundedBox, Sky, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type { Group, Mesh } from "three";

// 3D home screen: a lively supermarket plaza. Click a station to open that page.

type Vec3 = [number, number, number];

type StationProps = {
  href: string;
  label: string;
  position: Vec3;
  rotationY?: number;
  children: ReactNode;
};

function Station({ href, label, position, rotationY = 0, children }: StationProps) {
  const router = useRouter();
  const ref = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = Math.min(1, dt * 10);
    g.scale.setScalar(g.scale.x + ((hovered ? 1.08 : 1) - g.scale.x) * k);
    g.position.y += ((hovered ? 0.25 : 0) - g.position.y) * k;
  });

  return (
    <group position={position} rotation-y={rotationY}>
      {/* base pad */}
      <RoundedBox args={[6.4, 0.18, 5.4]} radius={0.08} position={[0, 0.09, 0]} receiveShadow>
        <meshStandardMaterial color={hovered ? "#a7f3d0" : "#d6d3d1"} />
      </RoundedBox>
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          router.push(href);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        {children}
      </group>
      <Html position={[0, 4.6, 0]} center distanceFactor={14} pointerEvents="none">
        <div
          className={`whitespace-nowrap rounded-xl border-b-4 px-4 py-1.5 text-base font-black text-white shadow-lg transition-colors ${
            hovered ? "border-emerald-700 bg-emerald-500" : "border-emerald-900 bg-emerald-700"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function Block({
  size,
  position,
  color,
  radius = 0.06,
  metal = false,
}: {
  size: Vec3;
  position: Vec3;
  color: string;
  radius?: number;
  metal?: boolean;
}) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={3} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={metal ? 0.3 : 0.7} metalness={metal ? 0.6 : 0} />
    </RoundedBox>
  );
}

// ---------- Sales Floor: shop with awning, windows, sign, cart ----------

function Cart({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Block size={[0.7, 0.4, 0.45]} position={[0, 0.55, 0]} color="#9ca3af" metal />
      <Block size={[0.7, 0.05, 0.05]} position={[-0.0, 0.95, -0.25]} color="#374151" />
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.12, 0.15]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
      <Block size={[0.2, 0.2, 0.2]} position={[-0.15, 0.85, 0]} color="#ef4444" />
      <Block size={[0.2, 0.25, 0.2]} position={[0.15, 0.87, 0]} color="#facc15" />
    </group>
  );
}

function ShopModel() {
  return (
    <>
      <Block size={[4.6, 2.8, 3.2]} position={[0, 1.6, -0.2]} color="#fef3c7" />
      <Block size={[4.9, 0.3, 3.5]} position={[0, 3.15, -0.2]} color="#dc2626" />
      {/* striped awning */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x, i) => (
        <Block
          key={x}
          size={[0.9, 0.08, 1.1]}
          position={[x, 2.45, 1.75]}
          color={i % 2 ? "#ffffff" : "#16a34a"}
          radius={0.02}
        />
      ))}
      <Block size={[1.3, 1.7, 0.1]} position={[-1.2, 1.05, 1.42]} color="#7dd3fc" metal />
      <Block size={[1.2, 1.7, 0.1]} position={[1.2, 1.05, 1.42]} color="#7dd3fc" metal />
      <Block size={[0.9, 1.8, 0.12]} position={[0, 1.0, 1.43]} color="#78350f" />
      <Block size={[2.6, 0.5, 0.12]} position={[0, 2.8, 1.45]} color="#166534" />
      <Cart position={[2.7, 0.18, 1.8]} />
      <Cart position={[-2.7, 0.18, 1.9]} />
    </>
  );
}

// ---------- Stock Order: truck that bobs, with crates ----------

function TruckModel() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.02;
  });
  return (
    <group ref={ref}>
      <Block size={[3.6, 2, 1.8]} position={[-0.3, 1.4, 0]} color="#f8fafc" />
      <Block size={[3.62, 0.3, 1.82]} position={[-0.3, 0.55, 0]} color="#16a34a" />
      <Block size={[1.2, 1.5, 1.75]} position={[2.1, 1.15, 0]} color="#2563eb" />
      <Block size={[0.1, 0.7, 1.4]} position={[2.72, 1.45, 0]} color="#bae6fd" metal />
      {[-1.3, 0.6, 2.1].map((x) =>
        [-0.9, 0.9].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.4, z]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 20]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        )),
      )}
      <Block size={[0.8, 0.8, 0.8]} position={[-1.3, 0.5, 2.0]} color="#d97706" />
      <Block size={[0.8, 0.8, 0.8]} position={[-0.3, 0.5, 2.0]} color="#f59e0b" />
      <Block size={[0.8, 0.8, 0.8]} position={[-0.8, 1.3, 2.0]} color="#b45309" />
    </group>
  );
}

// ---------- Store Expansion: finished building + pulsing ghost ----------

function ExpansionModel() {
  const ghost = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = ghost.current;
    if (m) (m.material as { opacity: number }).opacity = 0.25 + Math.sin(clock.elapsedTime * 2.5) * 0.12;
  });
  return (
    <>
      <Block size={[2.6, 2.4, 2.6]} position={[-1.5, 1.3, 0]} color="#bae6fd" />
      <Block size={[2.9, 0.25, 2.9]} position={[-1.5, 2.6, 0]} color="#0ea5e9" />
      <mesh ref={ghost} position={[1.5, 1.3, 0]}>
        <boxGeometry args={[2.6, 2.4, 2.6]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.3} />
      </mesh>
      {/* crane */}
      <Block size={[0.2, 4, 0.2]} position={[3, 2.2, -1.2]} color="#f59e0b" />
      <Block size={[3, 0.18, 0.18]} position={[1.7, 4.2, -1.2]} color="#f59e0b" />
      <Block size={[0.05, 1.4, 0.05]} position={[0.6, 3.5, -1.2]} color="#374151" />
      <Block size={[0.5, 0.3, 0.5]} position={[0.6, 2.7, -1.2]} color="#dc2626" />
    </>
  );
}

// ---------- Profit Report: bars that grow in and idle-wave ----------

function ChartModel() {
  const targets = [1.1, 1.8, 1.4, 2.5, 3.2];
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const grow = Math.min(1, Math.max(0, t * 0.8 - i * 0.15));
      const h = targets[i] * grow * (1 + Math.sin(t * 1.5 + i) * 0.04);
      m.scale.y = Math.max(0.01, h);
      m.position.y = 0.18 + h / 2;
    });
  });
  return (
    <>
      <Block size={[4.6, 0.2, 2.2]} position={[0, 0.28, 0]} color="#e5e7eb" />
      {targets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[(i - 2) * 0.85, 0.5, 0]}
          castShadow
        >
          <boxGeometry args={[0.6, 1, 0.9]} />
          <meshStandardMaterial color={i === 4 ? "#059669" : "#34d399"} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
}

// ---------- scenery ----------

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.2, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial color="#22c55e" flatShading />
      </mesh>
      <mesh position={[0.3, 2.4, 0.1]} castShadow>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#16a34a" flatShading />
      </mesh>
    </group>
  );
}

function LampPost({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.8, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 2.9, 0]} intensity={4} distance={7} color="#fde68a" />
    </group>
  );
}

// A customer that walks back and forth along the plaza.
function Walker({ z, speed, offset, color }: { z: number; speed: number; offset: number; color: string }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * speed + offset;
    const phase = t % 20;
    const forward = phase < 10;
    const x = forward ? -10 + phase * 2 : 10 - (phase - 10) * 2;
    g.position.set(x, 0.18 + Math.abs(Math.sin(clock.elapsedTime * 8 + offset)) * 0.07, z);
    g.rotation.y = forward ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <Block size={[0.35, 0.55, 0.25]} position={[0, 0.65, 0]} color={color} radius={0.1} />
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fcd5b0" />
      </mesh>
      <Block size={[0.3, 0.4, 0.2]} position={[0, 0.2, 0]} color="#1e3a8a" radius={0.05} />
    </group>
  );
}

function Clouds() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.x = ((ref.current.position.x + dt * 0.4 + 40) % 80) - 40;
  });
  return (
    <group ref={ref}>
      {[
        [-10, 14, -22, 1.4],
        [6, 16, -26, 1.8],
        [18, 13, -18, 1.2],
        [-24, 17, -30, 2],
      ].map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>
          {[0, 1.1, -1, 0.5].map((dx, j) => (
            <mesh key={j} position={[dx, j === 3 ? 0.5 : 0, 0]}>
              <sphereGeometry args={[j === 0 ? 1.1 : 0.8, 16, 16]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.92} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Slowly spinning sign above the plaza.
function MainSign() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 6.2 + Math.sin(clock.elapsedTime * 1.5) * 0.15;
  });
  return (
    <group ref={ref} position={[0, 6.2, -5]}>
      <Block size={[3.4, 1.1, 0.3]} position={[0, 0, 0]} color="#047857" radius={0.15} />
      <Html center transform distanceFactor={4.5} position={[0, 0, 0.2]} pointerEvents="none">
        <div className="whitespace-nowrap text-2xl font-black text-white">🛒 SUPERMARKET</div>
      </Html>
      <Block size={[0.12, 1.4, 0.12]} position={[-1.4, -1.1, 0]} color="#374151" />
      <Block size={[0.12, 1.4, 0.12]} position={[1.4, -1.1, 0]} color="#374151" />
    </group>
  );
}

export function EntranceScene() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 8, 17], fov: 48 }} className="touch-none">
      <Sky sunPosition={[60, 40, 30]} turbidity={4} rayleigh={1.2} />
      <fog attach="fog" args={["#cfe9ff", 35, 80]} />
      <hemisphereLight args={["#ffffff", "#86efac", 0.7]} />
      <directionalLight
        position={[12, 18, 10]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* grass */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#6ee7a0" />
      </mesh>
      {/* plaza + crossing paths */}
      <RoundedBox args={[26, 0.1, 16]} radius={0.05} position={[0, 0.03, 1]} receiveShadow>
        <meshStandardMaterial color="#e7e5e4" />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.1, 1]}>
        <planeGeometry args={[1.6, 15.6]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      {/* road */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 14]} receiveShadow>
        <planeGeometry args={[140, 5]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-30 + i * 4.6, 0.03, 14]}>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#fde047" />
        </mesh>
      ))}

      <Station href="/sales-floor" label="🛒 Sales Floor" position={[-5.5, 0, -1.5]}>
        <ShopModel />
      </Station>
      <Station href="/stock-order" label="📦 Stock Order" position={[5.5, 0, -1.5]}>
        <TruckModel />
      </Station>
      <Station href="/store-expansion" label="🏗️ Store Expansion" position={[-5.5, 0, 5]}>
        <ExpansionModel />
      </Station>
      <Station href="/profit-report" label="📊 Profit Report" position={[5.5, 0, 5]}>
        <ChartModel />
      </Station>

      <MainSign />

      {[-14, -11, 11, 14, -17, 17].map((x, i) => (
        <Tree key={x} position={[x, 0, -5 - (i % 2) * 2]} scale={1 + (i % 3) * 0.15} />
      ))}
      {[-13, 13, -16, 16].map((x) => (
        <Tree key={x} position={[x, 0, 7]} />
      ))}
      {[-2.2, 2.2].flatMap((x) => [-1, 5].map((z) => <LampPost key={`${x}${z}`} position={[x, 0, z]} />))}

      <Walker z={2} speed={0.6} offset={0} color="#ef4444" />
      <Walker z={3.2} speed={0.45} offset={7} color="#8b5cf6" />
      <Walker z={8} speed={0.7} offset={13} color="#f59e0b" />

      <Clouds />
      <Sparkles count={40} scale={[24, 6, 14]} position={[0, 4, 1]} size={3} speed={0.4} color="#fef9c3" />
      <ContactShadows position={[0, 0.06, 1]} opacity={0.35} scale={30} blur={2.5} far={6} />

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 1.5, 1.5]}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </Canvas>
  );
}
