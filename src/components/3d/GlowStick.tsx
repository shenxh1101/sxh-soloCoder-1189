import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GlowStickData } from '../../types';
import { GAME_COLORS, LIGHT_CONFIG } from '../../utils/constants';

interface GlowStickProps {
  glowSticks: GlowStickData[];
  isGodMode: boolean;
  nearestStickId?: string | null;
}

const PICKUP_HIGHLIGHT_COLOR = '#ffffff';

export function GlowSticks({ glowSticks, isGodMode, nearestStickId }: GlowStickProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRefs = useRef<Map<string, THREE.PointLight>>(new Map());
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    glowSticks.forEach((gs) => {
      if (gs.isPickedUp) return;

      const mesh = meshRefs.current.get(gs.id);
      if (mesh) {
        mesh.rotation.y = time * 2;
        mesh.position.y = gs.position.y + Math.sin(time * 3 + gs.position.x) * 0.1;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (nearestStickId === gs.id) {
          mat.emissiveIntensity = gs.intensity * 1.2 + Math.sin(time * 8) * 0.3;
          mat.emissive.set(PICKUP_HIGHLIGHT_COLOR);
        } else {
          mat.emissiveIntensity = gs.intensity * 0.5;
          mat.emissive.set(GAME_COLORS.glowStick);
        }
      }

      const light = lightRefs.current.get(gs.id);
      if (light) {
        light.intensity = gs.intensity + Math.sin(time * 4 + gs.position.z) * 0.2;
      }
    });
  });

  useEffect(() => {
    const lights = lightRefs;
    const meshes = meshRefs;
    return () => {
      lights.current.clear();
      meshes.current.clear();
    };
  }, []);

  const activeSticks = glowSticks.filter((gs) => !gs.isPickedUp);
  const activeCount = activeSticks.length;
  const visibleCount = Math.min(activeCount, LIGHT_CONFIG.maxDynamicLights);

  return (
    <group ref={groupRef}>
      {activeSticks.slice(0, visibleCount).map((gs) => (
        <group key={gs.id}>
          <mesh
            ref={(el) => {
              if (el) meshRefs.current.set(gs.id, el);
            }}
            position={gs.position}
          >
            <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
            <meshStandardMaterial
              color={GAME_COLORS.glowStick}
              emissive={GAME_COLORS.glowStick}
              emissiveIntensity={gs.intensity * 0.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={gs.position}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial
              color={GAME_COLORS.glowStick}
              transparent
              opacity={0.3 + (isGodMode ? 0.2 : 0)}
            />
          </mesh>
          <pointLight
            ref={(el) => {
              if (el) lightRefs.current.set(gs.id, el);
            }}
            position={gs.position}
            color={GAME_COLORS.glowStick}
            intensity={gs.intensity}
            distance={LIGHT_CONFIG.glowStickDistance}
            decay={2}
            castShadow
          />
        </group>
      ))}
    </group>
  );
}
