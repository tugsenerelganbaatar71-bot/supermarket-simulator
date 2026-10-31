"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

// First-person walking: click the scene to look around with the mouse,
// WASD / arrow keys to walk, Esc to leave.

const EYE_HEIGHT = 1.65;
const SPEED = 4.5;
const SPRINT = 8;
const BOUNDS = { minX: -40, maxX: 40, minZ: -11.4, maxZ: 13 };

export type Obstacle = { x: number; z: number; halfW: number; halfD: number };

type WalkerProps = {
  obstacles: Obstacle[];
  onExit: () => void;
};

function isBlocked(x: number, z: number, obstacles: Obstacle[]) {
  const radius = 0.35;
  return obstacles.some(
    (o) => Math.abs(x - o.x) < o.halfW + radius && Math.abs(z - o.z) < o.halfD + radius,
  );
}

// The shop floor is walled on three sides; the front (z > 9) is open to the street.
function insideWalls(x: number, z: number) {
  if (z > 9.1) return true;
  return x > -11.6 && x < 11.6;
}

export function Walker({ obstacles, onExit }: WalkerProps) {
  const camera = useThree((state) => state.camera);
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    camera.position.set(-10, EYE_HEIGHT, 11);
    camera.lookAt(-6, EYE_HEIGHT, 4);

    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      // Restore the overview camera for orbit mode.
      camera.position.set(0, 14, 24);
      camera.lookAt(0, 0, 3);
    };
  }, [camera]);

  useFrame(({ camera: cam }, delta) => {
    const k = keys.current;
    const forward = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const strafe = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    if (forward === 0 && strafe === 0) return;

    const direction = new Vector3();
    cam.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    const right = new Vector3(-direction.z, 0, direction.x);

    const speed = (k.ShiftLeft || k.ShiftRight ? SPRINT : SPEED) * Math.min(delta, 0.1);
    const move = direction.multiplyScalar(forward).add(right.multiplyScalar(strafe));
    if (move.lengthSq() > 1) move.normalize();
    move.multiplyScalar(speed);

    // Move one axis at a time so you slide along walls and shelves.
    const x = Math.min(BOUNDS.maxX, Math.max(BOUNDS.minX, cam.position.x + move.x));
    if (!isBlocked(x, cam.position.z, obstacles) && insideWalls(x, cam.position.z)) {
      cam.position.x = x;
    }
    const z = Math.min(BOUNDS.maxZ, Math.max(BOUNDS.minZ, cam.position.z + move.z));
    if (!isBlocked(cam.position.x, z, obstacles) && insideWalls(cam.position.x, z)) {
      cam.position.z = z;
    }
    cam.position.y = EYE_HEIGHT;
  });

  return <PointerLockControls onUnlock={onExit} />;
}
