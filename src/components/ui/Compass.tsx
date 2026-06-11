import { useMemo } from 'react';
import * as THREE from 'three';
import { getYawToTarget } from '../../utils/helpers';

interface CompassProps {
  playerPosition: THREE.Vector3;
  playerYaw: number;
  targetPosition: THREE.Vector3;
}

export function Compass({ playerPosition, playerYaw, targetPosition }: CompassProps) {
  const angle = useMemo(() => {
    return getYawToTarget(playerPosition, playerYaw, targetPosition);
  }, [playerPosition, playerYaw, targetPosition]);

  const distance = useMemo(() => {
    return playerPosition.distanceTo(targetPosition);
  }, [playerPosition, targetPosition]);

  return (
    <div className="absolute top-4 right-4 w-28 h-28">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full bg-gray-900/80 border-2 border-gray-600 shadow-lg">
          <div className="absolute inset-2 rounded-full border border-gray-700/50" />
          <div className="absolute inset-4 rounded-full border border-gray-700/30" />

          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-500">
            N
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-500">
            S
          </div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-500">
            W
          </div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-500">
            E
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
            style={{ transform: `rotate(${angle}rad)` }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <polygon
                points="30,8 34,28 30,24 26,28"
                fill="#ff4444"
                style={{ filter: 'drop-shadow(0 0 4px #ff444480)' }}
              />
              <polygon
                points="30,52 34,32 30,36 26,32"
                fill="#666666"
              />
            </svg>
          </div>
        </div>

        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-400 whitespace-nowrap">
          SPAWN: {distance.toFixed(1)}m
        </div>
      </div>
    </div>
  );
}
