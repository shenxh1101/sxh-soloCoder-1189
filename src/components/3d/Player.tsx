import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { KeyState } from '../../hooks/useKeyboardControls';
import { PLAYER_CONFIG, CAVE_CONFIG, LIGHT_CONFIG, GAME_COLORS } from '../../utils/constants';
import { clamp } from '../../utils/helpers';

interface PlayerProps {
  keys: KeyState;
  checkCollision: (pos: THREE.Vector3, radius: number) => boolean;
  onPositionChange: (pos: THREE.Vector3) => void;
  onRotationChange: (yaw: number, pitch: number) => void;
  isGodMode: boolean;
  isPointerLocked: boolean;
  spawnPosition: THREE.Vector3;
  onPlaceGlowStick: (position: THREE.Vector3, direction: THREE.Vector3) => void;
}

export function Player({
  keys,
  checkCollision,
  onPositionChange,
  onRotationChange,
  isGodMode,
  isPointerLocked,
  spawnPosition,
  onPlaceGlowStick,
}: PlayerProps) {
  const { camera, gl } = useThree();
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const positionRef = useRef(spawnPosition.clone());
  const onGroundRef = useRef(false);

  useEffect(() => {
    camera.position.copy(spawnPosition);
    camera.position.y += PLAYER_CONFIG.playerHeight * 0.5;
    positionRef.current.copy(camera.position);
  }, [camera, spawnPosition]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPointerLocked) return;

      yawRef.current -= e.movementX * PLAYER_CONFIG.mouseSensitivity;
      pitchRef.current -= e.movementY * PLAYER_CONFIG.mouseSensitivity;
      pitchRef.current = clamp(pitchRef.current, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);

      onRotationChange(yawRef.current, pitchRef.current);
    },
    [isPointerLocked, onRotationChange]
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    direction.set(
      -Math.sin(yawRef.current) * Math.cos(pitchRef.current),
      0,
      -Math.cos(yawRef.current) * Math.cos(pitchRef.current)
    ).normalize();

    right.crossVectors(direction, up).normalize();

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (keys.forward) moveDir.add(direction);
    if (keys.backward) moveDir.sub(direction);
    if (keys.left) moveDir.sub(right);
    if (keys.right) moveDir.add(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    const speed = keys.sprint && !isGodMode ? PLAYER_CONFIG.sprintSpeed : PLAYER_CONFIG.moveSpeed;

    if (isGodMode) {
      const verticalDir = new THREE.Vector3();
      if (keys.jump) verticalDir.y = 1;
      else if (keys.backward && keys.sprint) verticalDir.y = -1;

      const newPos = positionRef.current.clone();
      newPos.x += moveDir.x * speed * dt * 1.5;
      newPos.y += moveDir.y * speed * dt * 1.5 + verticalDir.y * speed * dt * 1.5;
      newPos.z += moveDir.z * speed * dt * 1.5;

      const halfX = CAVE_CONFIG.size.x / 2;
      const halfY = CAVE_CONFIG.size.y / 2;
      const halfZ = CAVE_CONFIG.size.z / 2;
      newPos.x = clamp(newPos.x, -halfX + 1, halfX - 1);
      newPos.y = clamp(newPos.y, -halfY + 1, halfY - 1);
      newPos.z = clamp(newPos.z, -halfZ + 1, halfZ - 1);

      positionRef.current.copy(newPos);
      velocityRef.current.set(0, 0, 0);
    } else {
      velocityRef.current.x = moveDir.x * speed;
      velocityRef.current.z = moveDir.z * speed;

      if (keys.jump && onGroundRef.current) {
        velocityRef.current.y = PLAYER_CONFIG.jumpForce;
        onGroundRef.current = false;
      }

      velocityRef.current.y -= PLAYER_CONFIG.gravity * dt;

      const newPos = positionRef.current.clone();
      const testPosX = newPos.clone();
      testPosX.x += velocityRef.current.x * dt;

      if (!checkCollision(testPosX, PLAYER_CONFIG.playerRadius)) {
        newPos.x = testPosX.x;
      } else {
        velocityRef.current.x = 0;
      }

      const testPosZ = newPos.clone();
      testPosZ.z += velocityRef.current.z * dt;

      if (!checkCollision(testPosZ, PLAYER_CONFIG.playerRadius)) {
        newPos.z = testPosZ.z;
      } else {
        velocityRef.current.z = 0;
      }

      const testPosY = newPos.clone();
      testPosY.y += velocityRef.current.y * dt;

      if (!checkCollision(testPosY, PLAYER_CONFIG.playerRadius)) {
        newPos.y = testPosY.y;
        onGroundRef.current = false;
      } else {
        if (velocityRef.current.y < 0) {
          onGroundRef.current = true;
        }
        velocityRef.current.y = 0;
      }

      positionRef.current.copy(newPos);
    }

    camera.position.copy(positionRef.current);

    const lookTarget = new THREE.Vector3();
    lookTarget.x = camera.position.x + Math.sin(yawRef.current) * Math.cos(pitchRef.current);
    lookTarget.y = camera.position.y + Math.sin(pitchRef.current);
    lookTarget.z = camera.position.z + Math.cos(yawRef.current) * Math.cos(pitchRef.current);

    camera.lookAt(lookTarget);

    onPositionChange(positionRef.current);
  });

  const lightTarget = useRef<THREE.Object3D>(null);

  useFrame(() => {
    if (lightTarget.current) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      lightTarget.current.position.copy(camera.position).add(dir.multiplyScalar(5));
    }
  });

  return (
    <>
      <spotLight
        position={camera.position}
        angle={LIGHT_CONFIG.headLightAngle}
        penumbra={0.3}
        intensity={isGodMode ? 0 : LIGHT_CONFIG.headLightIntensity}
        distance={LIGHT_CONFIG.headLightDistance}
        decay={2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        target={lightTarget.current || undefined}
      />
      <object3D ref={lightTarget} />
      <ambientLight intensity={0.08} color="#223355" />
      <fog attach="fog" args={[GAME_COLORS.caveRock, 10, isGodMode ? 100 : 40]} />
    </>
  );
}
