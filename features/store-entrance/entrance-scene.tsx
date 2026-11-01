"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type { Group } from "three";

// 3D home screen: a small supermarket plaza. Click a station to open that page.

type StationProps = {
  href: string;
  label: string;
  position: [number, number, number];
  children: ReactNode;
};

function Station({ href, label, position, children }: StationProps) {
  const router = useRouter();
  const ref = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = hovered ? 1.12 : 1;
    const s = ref.current.scale.x + (target - ref.current.scale.x) * Math.min(1, dt * 10);
    ref.current.scale.setScalar(s);
  });

  return (
    <group position={position}>
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
      <Html position={[0, 3.6, 0]} center distanceFactor={14} pointerEvents="none">
        <div
          className={`whitespace-nowrap rounded-xl px-4 py-1.5 text-base font-black text-white shadow-lg ${
            hovered ? "bg-emerald-500" : "bg-emerald-700"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function Box({
  size,
  position,
  color,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Sales Floor: shop building with a checkout counter.
function ShopModel() {
  return (
    <>
      <Box size={[4, 2.4, 3]} position={[0, 1.2, 0]} color="#fde68a" />
      <Box size={[4.4, 0.3, 3.4]} position={[0, 2.55, 0]} color="#ef4444" />
      <Box size={[1.2, 1.6, 0.1]} position={[0, 0.8, 1.55]} color="#7dd3fc" />
      <Box size={[1.6, 0.7, 0.7]} position={[1.2, 0.35, 2.2]} color="#78350f" />
    </>
  );
}

// Stock Order: delivery truck and crates.
function TruckModel() {
  return (
    <>
      <Box size={[3, 1.7, 1.6]} position={[0, 1.15, 0]} color="#f8fafc" />
      <Box size={[1, 1.2, 1.5]} position={[2, 0.9, 0]} color="#2563eb" />
      {[-1, 1].map((x) =>
        [-0.85, 0.85].map((z) => (
          <mesh key={`${x}${z}`} position={[x * 1.2 + (x > 0 ? 0.8 : 0), 0.35, z]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        )),
      )}
      <Box size={[0.8, 0.8, 0.8]} position={[-0.8, 0.4, 1.6]} color="#d97706" />
      <Box size={[0.8, 0.8, 0.8]} position={[0.2, 0.4, 1.6]} color="#f59e0b" />
      <Box size={[0.8, 0.8, 0.8]} position={[-0.3, 1.2, 1.6]} color="#b45309" />
    </>
  );
}

// Store Expansion: finished building plus a see-through next extension.
function ExpansionModel() {
  return (
    <>
      <Box size={[2.6, 2, 2.6]} position={[-1.4, 1, 0]} color="#bae6fd" />
      <mesh position={[1.4, 1, 0]}>
        <boxGeometry args={[2.6, 2, 2.6]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.35} />
      </mesh>
      <Box size={[0.3, 2.6, 0.3]} position={[1.4, 1.3, 2]} color="#6b7280" />
      <Box size={[1.2, 0.8, 0.1]} position={[1.4, 2.4, 2]} color="#f59e0b" />
    </>
  );
}

// Profit Report: little 3D bar chart.
function ChartModel() {
  const bars = [1, 1.7, 1.3, 2.4, 3];
  const colors = ["#34d399", "#10b981", "#34d399", "#10b981", "#059669"];
  return (
    <>
      <Box size={[4.4, 0.2, 2]} position={[0, 0.1, 0]} color="#e5e7eb" />
      {bars.map((h, i) => (
        <Box key={i} size={[0.6, h, 0.9]} position={[(i - 2) * 0.85, 0.2 + h / 2, 0]} color={colors[i]} />
      ))}
    </>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box size={[0.3, 1, 0.3]} position={[0, 0.5, 0]} color="#78350f" />
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 8]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
    </group>
  );
}

export function EntranceScene() {
  return (
    <Canvas shadows camera={{ position: [0, 7, 15], fov: 50 }} className="touch-none">
      <color attach="background" args={["#bfe6ff"]} />
      <fog attach="fog" args={["#bfe6ff", 25, 55]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 14, 8]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />

      {/* ground + plaza */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>

      <Station href="/sales-floor" label="🛒 Sales Floor" position={[-5, 0, -1]}>
        <ShopModel />
      </Station>
      <Station href="/stock-order" label="📦 Stock Order" position={[5, 0, -1]}>
        <TruckModel />
      </Station>
      <Station href="/store-expansion" label="🏗️ Store Expansion" position={[-5, 0, 4]}>
        <ExpansionModel />
      </Station>
      <Station href="/profit-report" label="📊 Profit Report" position={[5, 0, 4]}>
        <ChartModel />
      </Station>

      {[-12, -9, 9, 12].map((x) => (
        <Tree key={x} position={[x, 0, -4]} />
      ))}
      {[-11, 11].map((x) => (
        <Tree key={x} position={[x, 0, 5]} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={24}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1, 1]}
      />
    </Canvas>
  );
}
