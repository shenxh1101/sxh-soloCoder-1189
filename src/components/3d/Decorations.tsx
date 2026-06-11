import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { DecorationData } from '../../types';
import { GAME_COLORS } from '../../utils/constants';

interface DecorationsProps {
  decorations: DecorationData[];
}

export function Decorations({ decorations }: DecorationsProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geometry = useMemo(() => {
    const coneGeo = new THREE.ConeGeometry(1, 2, 8);
    coneGeo.translate(0, -1, 0);
    return coneGeo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: GAME_COLORS.caveRock,
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true,
      }),
    []
  );

  useEffect(() => {
    if (!instancedMeshRef.current) return;

    decorations.forEach((dec, i) => {
      dummy.position.copy(dec.position);
      dummy.rotation.copy(dec.rotation);
      dummy.scale.setScalar(dec.scale);
      dummy.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [decorations, dummy]);

  if (decorations.length === 0) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, decorations.length]}
      castShadow
      receiveShadow
    />
  );
}
