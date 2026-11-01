import { ContactShadows } from "@react-three/drei";

// Shared look for the 3D scenes: soft sky/ground light, a sun with sharp
// shadows, and a soft contact shadow under everything on the floor.
export function SceneLighting({
  sun = [6, 14, 8],
  sky = "#ffffff",
  ground = "#c8d6c0",
  shadowSize = 16,
  contactScale = 30,
}: {
  sun?: [number, number, number];
  sky?: string;
  ground?: string;
  shadowSize?: number;
  contactScale?: number;
}) {
  return (
    <>
      <hemisphereLight args={[sky, ground, 0.85]} />
      <directionalLight
        position={sun}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-bias={-0.0005}
      />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.3} scale={contactScale} blur={2.4} far={5} />
    </>
  );
}
