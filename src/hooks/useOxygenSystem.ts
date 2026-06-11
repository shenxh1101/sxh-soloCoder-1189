import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OXYGEN_CONFIG } from '../utils/constants';
import { VentData } from '../types';
import { getDistanceXZ } from '../utils/helpers';

interface UseOxygenSystemProps {
  vents: VentData[];
  playerPosition: THREE.Vector3;
  isGodMode: boolean;
  onOxygenChange: (oxygen: number) => void;
  onOxygenDepleted?: () => void;
}

export function useOxygenSystem({
  vents,
  playerPosition,
  isGodMode,
  onOxygenChange,
  onOxygenDepleted,
}: UseOxygenSystemProps) {
  const oxygenRef = useRef(OXYGEN_CONFIG.maxOxygen);
  const lastUpdateRef = useRef(performance.now());
  const isNearVentRef = useRef(false);

  const checkNearVent = useCallback(() => {
    return vents.some(
      (vent) => getDistanceXZ(playerPosition, vent.position) < vent.radius + OXYGEN_CONFIG.ventRadius
    );
  }, [vents, playerPosition]);

  useEffect(() => {
    if (isGodMode) {
      oxygenRef.current = OXYGEN_CONFIG.maxOxygen;
      onOxygenChange(OXYGEN_CONFIG.maxOxygen);
      return;
    }

    const interval = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      const nearVent = checkNearVent();
      isNearVentRef.current = nearVent;

      if (nearVent) {
        oxygenRef.current = Math.min(OXYGEN_CONFIG.maxOxygen, oxygenRef.current + dt * 50);
      } else {
        oxygenRef.current = Math.max(0, oxygenRef.current - dt * OXYGEN_CONFIG.consumptionRate);
      }

      onOxygenChange(oxygenRef.current);

      if (oxygenRef.current <= 0 && onOxygenDepleted) {
        onOxygenDepleted();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGodMode, checkNearVent, onOxygenChange, onOxygenDepleted]);

  const getOxygenPercentage = useCallback(() => {
    return (oxygenRef.current / OXYGEN_CONFIG.maxOxygen) * 100;
  }, []);

  const isLow = useCallback(() => {
    return oxygenRef.current < OXYGEN_CONFIG.warningThreshold;
  }, []);

  const isNearVentPublic = useCallback(() => {
    return isNearVentRef.current;
  }, []);

  return {
    getOxygenPercentage,
    isLow,
    isNearVent: isNearVentPublic,
  };
}
