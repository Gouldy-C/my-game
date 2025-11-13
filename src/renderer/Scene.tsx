import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { Environment, OrbitControls, Stats, StatsGl } from "@react-three/drei";

export function Scene() {
  const meshRef = useRef<Mesh>(null);

  // Rotate the mesh on each frame
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <>
      {/* FPS Stats overlay - positioned top-left by default */}
      <StatsGl className="absolute bottom-0 right-10" />
      <Stats />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />

      {/* Basic mesh - a rotating box */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Grid helper for reference */}
      <gridHelper args={[10, 10]} />
      <axesHelper args={[5]} />
      <OrbitControls />
      <Environment preset="dawn" />
    </>
  );
}
