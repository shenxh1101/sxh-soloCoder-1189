import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GAME_COLORS } from '../../utils/constants';

interface CaveProps {
  geometry: THREE.BufferGeometry | null;
}

export function Cave({ geometry }: CaveProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: GAME_COLORS.caveWall,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      material.emissiveIntensity = 0.02 + Math.sin(time * 0.5) * 0.01;
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow castShadow />
  );
}
