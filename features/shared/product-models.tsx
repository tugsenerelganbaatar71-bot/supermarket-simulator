// Small 3D product models shared by the 3D scenes (three.js).
// Each product is built from a few shapes so it is easy to recognise.

export type Look = { id: string; color: string; shape: "box" | "sphere" | "cylinder"; size: number };

export const PRODUCT_LOOKS: Record<string, Look> = {
  apple: { id: "apple", color: "#e53935", shape: "sphere", size: 0.3 },
  bread: { id: "bread", color: "#d4a056", shape: "box", size: 0.32 },
  milk: { id: "milk", color: "#f5f5f5", shape: "cylinder", size: 0.3 },
  eggs: { id: "eggs", color: "#fff1c1", shape: "sphere", size: 0.26 },
  cheese: { id: "cheese", color: "#fbc02d", shape: "box", size: 0.3 },
  juice: { id: "juice", color: "#ff9800", shape: "box", size: 0.3 },
  cookies: { id: "cookies", color: "#8d6e63", shape: "cylinder", size: 0.32 },
  coffee: { id: "coffee", color: "#4e342e", shape: "cylinder", size: 0.3 },
  chocolate: { id: "chocolate", color: "#6d4c41", shape: "box", size: 0.28 },
  watermelon: { id: "watermelon", color: "#43a047", shape: "sphere", size: 0.36 },
};

type Vec3 = [number, number, number];

function Mat({ color, shine = 0.4, metal = 0 }: { color: string; shine?: number; metal?: number }) {
  return <meshStandardMaterial color={color} roughness={shine} metalness={metal} />;
}

// All models are about `size` tall and sit with their centre at the origin.
function Model({ look }: { look: Look }) {
  const s = look.size;

  switch (look.id) {
    case "apple":
      return (
        <>
          <mesh castShadow scale={[1, 0.92, 1]}>
            <sphereGeometry args={[s / 2, 24, 18]} />
            <Mat color="#e53935" shine={0.25} />
          </mesh>
          <mesh position={[0, s * 0.5, 0]} rotation-z={0.3}>
            <cylinderGeometry args={[s * 0.03, s * 0.04, s * 0.2, 6]} />
            <Mat color="#5d4037" shine={0.8} />
          </mesh>
          <mesh position={[s * 0.12, s * 0.5, 0]} rotation-z={-0.6} scale={[1, 0.25, 0.6]}>
            <sphereGeometry args={[s * 0.14, 12, 8]} />
            <Mat color="#43a047" />
          </mesh>
        </>
      );
    case "bread":
      return (
        <>
          <mesh castShadow scale={[1.25, 0.8, 0.8]}>
            <sphereGeometry args={[s / 2, 24, 16]} />
            <Mat color="#c98a3d" shine={0.8} />
          </mesh>
          {[-0.2, 0, 0.2].map((x) => (
            <mesh key={x} position={[x * s * 1.5, s * 0.3, 0]} rotation-z={0.6} scale={[1, 0.15, 0.7]}>
              <boxGeometry args={[s * 0.3, s * 0.3, s * 0.4]} />
              <Mat color="#e8b86a" shine={0.9} />
            </mesh>
          ))}
        </>
      );
    case "milk":
      return (
        <>
          <mesh castShadow>
            <boxGeometry args={[s * 0.55, s * 0.8, s * 0.55]} />
            <Mat color="#f8fafc" shine={0.3} />
          </mesh>
          <mesh position={[0, s * 0.5, 0]} rotation-z={0}>
            <boxGeometry args={[s * 0.55, s * 0.2, s * 0.28]} />
            <Mat color="#e2e8f0" shine={0.3} />
          </mesh>
          <mesh position={[0, 0, s * 0.28]}>
            <boxGeometry args={[s * 0.5, s * 0.3, 0.005]} />
            <Mat color="#3b82f6" />
          </mesh>
        </>
      );
    case "eggs":
      return (
        <>
          {[-0.17, 0.17].map((x) => (
            <mesh key={x} position={[x * s * 1.3, 0, 0]} castShadow scale={[0.8, 1, 0.8]}>
              <sphereGeometry args={[s * 0.4, 20, 16]} />
              <Mat color="#fff1c1" shine={0.35} />
            </mesh>
          ))}
          <mesh position={[0, -s * 0.38, 0]}>
            <boxGeometry args={[s * 1.1, s * 0.1, s * 0.5]} />
            <Mat color="#d6c7a1" shine={0.9} />
          </mesh>
        </>
      );
    case "cheese":
      return (
        <>
          <mesh castShadow rotation-y={0.4}>
            <cylinderGeometry args={[s * 0.55, s * 0.55, s * 0.6, 3]} />
            <Mat color="#fbc02d" shine={0.5} />
          </mesh>
          {[
            [0.15, 0.1, 0.3],
            [-0.2, -0.1, 0.25],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x * s, y * s, z * s]}>
              <sphereGeometry args={[s * 0.09, 10, 8]} />
              <Mat color="#c79100" />
            </mesh>
          ))}
        </>
      );
    case "juice":
      return (
        <>
          <mesh castShadow>
            <boxGeometry args={[s * 0.5, s * 0.85, s * 0.35]} />
            <Mat color="#ff9800" shine={0.3} />
          </mesh>
          <mesh position={[0, s * 0.5, 0]}>
            <boxGeometry args={[s * 0.5, s * 0.14, s * 0.35]} />
            <Mat color="#fb8c00" shine={0.3} />
          </mesh>
          <mesh position={[s * 0.1, s * 0.75, 0]} rotation-z={-0.2}>
            <cylinderGeometry args={[s * 0.02, s * 0.02, s * 0.4, 6]} />
            <Mat color="#ef4444" />
          </mesh>
        </>
      );
    case "cookies":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, (i - 1) * s * 0.2, 0]} rotation-y={i * 0.7} castShadow>
              <cylinderGeometry args={[s * 0.5, s * 0.5, s * 0.14, 20]} />
              <Mat color="#c68642" shine={0.9} />
            </mesh>
          ))}
          {([[0.15, 0.3, 0.1], [-0.2, 0.3, -0.1], [0.05, 0.3, -0.25]] as Vec3[]).map(([x, y, z], i) => (
            <mesh key={i} position={[x * s, y * s * 0.9, z * s]}>
              <sphereGeometry args={[s * 0.06, 8, 6]} />
              <Mat color="#3e2723" />
            </mesh>
          ))}
        </>
      );
    case "coffee":
      return (
        <>
          <mesh castShadow>
            <cylinderGeometry args={[s * 0.42, s * 0.34, s * 0.8, 20]} />
            <Mat color="#5d4037" shine={0.3} />
          </mesh>
          <mesh position={[0, s * 0.43, 0]}>
            <cylinderGeometry args={[s * 0.44, s * 0.44, s * 0.1, 20]} />
            <Mat color="#212121" shine={0.2} metal={0.5} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[s * 0.43, s * 0.37, s * 0.3, 20]} />
            <Mat color="#fbbf24" />
          </mesh>
        </>
      );
    case "chocolate":
      return (
        <>
          <mesh castShadow>
            <boxGeometry args={[s * 0.8, s * 1, s * 0.12]} />
            <Mat color="#4e342e" shine={0.3} />
          </mesh>
          {[-0.2, 0.2].flatMap((x) =>
            [-0.28, 0, 0.28].map((y) => (
              <mesh key={`${x}${y}`} position={[x * s, y * s, s * 0.065]}>
                <boxGeometry args={[s * 0.3, s * 0.24, s * 0.03]} />
                <Mat color="#6d4c41" shine={0.25} />
              </mesh>
            )),
          )}
          <mesh position={[0, -s * 0.5, 0]}>
            <boxGeometry args={[s * 0.8, s * 0.2, s * 0.14]} />
            <Mat color="#dc2626" metal={0.6} shine={0.3} />
          </mesh>
        </>
      );
    case "watermelon":
      return (
        <>
          <mesh castShadow scale={[1.1, 0.9, 0.9]}>
            <sphereGeometry args={[s / 2, 28, 20]} />
            <Mat color="#2e7d32" shine={0.35} />
          </mesh>
          {[-0.5, -0.2, 0.2, 0.5].map((a, i) => (
            <mesh key={i} rotation-y={a} scale={[1.1, 0.9, 0.9]}>
              <sphereGeometry args={[s * 0.505, 20, 16, 0, 0.12]} />
              <Mat color="#81c784" />
            </mesh>
          ))}
        </>
      );
    default:
      // Unknown product: fall back to a plain shape.
      return (
        <mesh castShadow>
          {look.shape === "sphere" && <sphereGeometry args={[s / 2, 16, 12]} />}
          {look.shape === "box" && <boxGeometry args={[s, s, s * 0.8]} />}
          {look.shape === "cylinder" && <cylinderGeometry args={[s / 2.4, s / 2.4, s, 16]} />}
          <Mat color={look.color} shine={0.5} />
        </mesh>
      );
  }
}

export function ProductItem({
  look,
  position,
  scale = 1,
}: {
  look: Look;
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Model look={look} />
    </group>
  );
}
