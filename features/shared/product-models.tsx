// Small 3D product models shared by the 3D scenes (three.js).

export type Look = { color: string; shape: "box" | "sphere" | "cylinder"; size: number };

export const PRODUCT_LOOKS: Record<string, Look> = {
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

export function ProductItem({
  look,
  position,
  scale = 1,
}: {
  look: Look;
  position: [number, number, number];
  scale?: number;
}) {
  const s = look.size;
  return (
    <mesh position={position} scale={scale} castShadow>
      {look.shape === "sphere" && <sphereGeometry args={[s / 2, 16, 12]} />}
      {look.shape === "box" && <boxGeometry args={[s, s, s * 0.8]} />}
      {look.shape === "cylinder" && <cylinderGeometry args={[s / 2.4, s / 2.4, s, 16]} />}
      <meshStandardMaterial color={look.color} roughness={0.5} />
    </mesh>
  );
}
