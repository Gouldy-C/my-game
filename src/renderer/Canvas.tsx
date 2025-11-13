import { Canvas as R3FCanvas } from "@react-three/fiber";
import { Scene } from "./Scene";

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  return (
    <R3FCanvas
      className={className + " relative w-full h-full"}
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true }}>
      <Scene />
    </R3FCanvas>
  );
}
