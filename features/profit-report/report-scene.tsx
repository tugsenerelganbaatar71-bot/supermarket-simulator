"use client";

import { SceneLighting } from "@/features/shared/scene-lighting";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { formatMoney } from "@/features/shared/game-state";

// 3D bar chart: money bars (income / spending / profit) and best sellers.

export type SellerBar = { id: string; emoji: string; name: string; units: number };

type ReportSceneProps = {
  income: number;
  spending: number;
  sellers: SellerBar[];
};

const MAX_HEIGHT = 4.5;

export function ReportScene({ income, spending, sellers }: ReportSceneProps) {
  const profit = income - spending;
  const maxMoney = Math.max(income, spending, Math.abs(profit), 1);
  const maxUnits = Math.max(...sellers.map((s) => s.units), 1);

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 6, 11], fov: 50 }} className="touch-none">
      <color attach="background" args={["#e9f1fb"]} />
      <SceneLighting sun={[5, 10, 6]} />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 12]} />
        <meshStandardMaterial color="#f7f9fc" />
      </mesh>
      <gridHelper args={[24, 24, "#cfd8e3", "#e1e8f0"]} position={[0, 0.01, 0]} />

      <Html position={[-4, 0.1, 2.2]} center distanceFactor={14} pointerEvents="none">
        <div className="whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-zinc-600 shadow">Money</div>
      </Html>
      <Bar x={-5.5} value={income / maxMoney} color="#43a047" label="Income" text={formatMoney(income)} />
      <Bar x={-3.5} value={spending / maxMoney} color="#e53935" label="Spending" text={formatMoney(spending)} />
      <Bar
        x={-1.5}
        value={Math.abs(profit) / maxMoney}
        color={profit >= 0 ? "#1e88e5" : "#8e24aa"}
        label={profit >= 0 ? "Profit" : "Loss"}
        text={`${profit < 0 ? "−" : ""}${formatMoney(Math.abs(profit))}`}
      />

      <Html position={[4, 0.1, 2.2]} center distanceFactor={14} pointerEvents="none">
        <div className="whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-zinc-600 shadow">Best sellers</div>
      </Html>
      {sellers.length === 0 && (
        <Html position={[4, 1, 0]} center distanceFactor={12} pointerEvents="none">
          <div className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm text-zinc-800 shadow">No sales yet</div>
        </Html>
      )}
      {sellers.map((seller, i) => (
        <Bar
          key={seller.id}
          x={1.5 + i * 1.5}
          value={seller.units / maxUnits}
          color="#ffb300"
          label={`${seller.emoji} ${seller.name}`}
          text={`${seller.units} sold`}
        />
      ))}

      <OrbitControls target={[0, 1.5, 0]} minDistance={6} maxDistance={24} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}

/** A bar that grows smoothly to `value` (0..1 of the maximum height). */
function Bar({
  x,
  value,
  color,
  label,
  text,
}: {
  x: number;
  value: number;
  color: string;
  label: string;
  text: string;
}) {
  const ref = useRef<Group>(null);
  const height = useRef(0.001);
  const target = Math.max(0.05, value * MAX_HEIGHT);

  useFrame((_, delta) => {
    height.current += (target - height.current) * Math.min(1, delta * 4);
    if (ref.current) ref.current.scale.y = height.current;
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={ref} scale={[1, 0.001, 1]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <Html position={[0, 0.1, 1.1]} center distanceFactor={14} pointerEvents="none">
        <div className="whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-zinc-700 shadow">
          {label}
        </div>
      </Html>
      <Html position={[0, target + 0.4, 0]} center distanceFactor={12} pointerEvents="none">
        <div className="whitespace-nowrap rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-white shadow">
          {text}
        </div>
      </Html>
    </group>
  );
}
