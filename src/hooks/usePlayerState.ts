import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../types';
import { OXYGEN_CONFIG } from '../utils/constants';

export function usePlayerState(initialPosition: THREE.Vector3) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: initialPosition.clone(),
    yaw: 0,
    pitch: 0,
    velocity: new THREE.Vector3(0, 0, 0),
    oxygen: OXYGEN_CONFIG.maxOxygen,
    glowSticks: 3,
    isGodMode: false,
    spawnPosition: initialPosition.clone(),
  });

  const playerStateRef = useRef(playerState);
  playerStateRef.current = playerState;

  const setPosition = useCallback((pos: THREE.Vector3) => {
    setPlayerState((prev) => ({ ...prev, position: pos.clone() }));
  }, []);

  const setRotation = useCallback((yaw: number, pitch: number) => {
    setPlayerState((prev) => ({ ...prev, yaw, pitch }));
  }, []);

  const setVelocity = useCallback((vel: THREE.Vector3) => {
    setPlayerState((prev) => ({ ...prev, velocity: vel.clone() }));
  }, []);

  const setOxygen = useCallback((oxygen: number) => {
    setPlayerState((prev) => ({
      ...prev,
      oxygen: Math.max(0, Math.min(OXYGEN_CONFIG.maxOxygen, oxygen)),
    }));
  }, []);

  const addGlowStick = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, glowSticks: prev.glowSticks + 1 }));
  }, []);

  const removeGlowStick = useCallback((): boolean => {
    if (playerStateRef.current.glowSticks <= 0) return false;
    setPlayerState((prev) => ({ ...prev, glowSticks: prev.glowSticks - 1 }));
    return true;
  }, []);

  const toggleGodMode = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isGodMode: !prev.isGodMode }));
  }, []);

  const reset = useCallback(() => {
    setPlayerState({
      position: initialPosition.clone(),
      yaw: 0,
      pitch: 0,
      velocity: new THREE.Vector3(0, 0, 0),
      oxygen: OXYGEN_CONFIG.maxOxygen,
      glowSticks: 3,
      isGodMode: false,
      spawnPosition: initialPosition.clone(),
    });
  }, [initialPosition]);

  return {
    playerState,
    playerStateRef,
    setPosition,
    setRotation,
    setVelocity,
    setOxygen,
    addGlowStick,
    removeGlowStick,
    toggleGodMode,
    reset,
  };
}
