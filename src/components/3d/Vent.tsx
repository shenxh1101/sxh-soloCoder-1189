import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VentData } from '../../types';
import { GAME_COLORS, LIGHT_CONFIG } from '../../utils/constants';

interface VentProps {
  vents: VentData[];
  isGodMode: boolean;
}

export function Vents({ vents, isGodMode }: VentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRefs = useRef<Map<string, THREE.PointLight>>(new Map());

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    lightRefs.current.forEach((light) => {
      light.intensity = 0.5 + Math.sin(time * 2 + light.position.x) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {vents.map((vent) => (
        <group key={vent.id} position={vent.position}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[vent.radius * 0.8, vent.radius, 16]} />
            <meshBasicMaterial
              color={GAME_COLORS.vent}
              transparent
              opacity={isGodMode ? 0.8 : 0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[vent.radius * 0.8, 16]} />
            <meshBasicMaterial
              color={GAME_COLORS.vent}
              transparent
              opacity={isGodMode ? 0.3 : 0.1}
            />
          </mesh>
          <pointLight
            ref={(el) => {
              if (el) lightRefs.current.set(vent.id, el);
            }}
            color={GAME_COLORS.vent}
            intensity={0.3}
            distance={vent.radius * 4}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
