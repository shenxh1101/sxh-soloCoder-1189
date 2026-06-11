import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CAVE_CONFIG, LIGHT_CONFIG, GAME_COLORS } from '../../utils/constants';

interface GodViewCameraProps {
  isActive: boolean;
}

export function GodViewCamera({ isActive }: GodViewCameraProps) {
  const { camera, set } = useThree();
  const controlsRef = useRef<any>(null);
  const initialCamPos = useRef(new THREE.Vector3(0, CAVE_CONFIG.size.y * 0.8, CAVE_CONFIG.size.z * 0.6));

  useEffect(() => {
    if (isActive) {
      const perspCamera = camera as THREE.PerspectiveCamera;
      perspCamera.fov = 60;
      perspCamera.near = 0.1;
      perspCamera.far = 500;
      perspCamera.position.copy(initialCamPos.current);
      perspCamera.lookAt(0, 0, 0);
      perspCamera.updateProjectionMatrix();
    }
  }, [isActive, camera, set]);

  useFrame(() => {
    if (isActive && controlsRef.current) {
      controlsRef.current.update();
    }
  });

  if (!isActive) return null;

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
      <ambientLight intensity={0.3} color="#445566" />
      <directionalLight
        position={[30, 50, 30]}
        intensity={0.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight position={[-30, 20, -30]} intensity={0.2} color="#88aacc" />
      <fog attach="fog" args={[GAME_COLORS.caveRock, 50, 200]} />
    </>
  );
}
