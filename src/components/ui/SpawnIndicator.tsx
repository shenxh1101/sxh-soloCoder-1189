import { useMemo } from 'react';
import * as THREE from 'three';
import { getYawToTarget } from '../../utils/helpers';

interface SpawnIndicatorProps {
  playerPosition: THREE.Vector3;
  playerYaw: number;
  spawnPosition: THREE.Vector3;
}

export function SpawnIndicator({ playerPosition, playerYaw, spawnPosition }: SpawnIndicatorProps) {
  const angle = useMemo(() => {
    return getYawToTarget(playerPosition, playerYaw, spawnPosition);
  }, [playerPosition, playerYaw, spawnPosition]);

  const distance = useMemo(() => {
    return playerPosition.distanceTo(spawnPosition);
  }, [playerPosition, spawnPosition]);

  const clampedAngle = useMemo(() => {
    const maxDisplay = Math.PI / 3;
    return Math.max(-maxDisplay, Math.min(maxDisplay, angle));
  }, [angle]);

  const isOffScreen = Math.abs(angle) > Math.PI / 4;
  const arrowOpacity = isOffScreen ? 1 : 0.8;

  return (
    <div className="absolute top-4 right-36 w-32 h-14">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm rounded-lg border border-gray-700/60 overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative w-full h-8 flex items-center justify-center">
              <div className="absolute w-full h-full overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 128 32" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="spawnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#666666" stopOpacity="0" />
                      <stop offset="30%" stopColor="#888888" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#aaaaaa" stopOpacity="0.5" />
                      <stop offset="70%" stopColor="#888888" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#666666" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="24" x2="128" y2="24" stroke="url(#spawnGrad)" strokeWidth="1" />
                </svg>
              </div>

              <div
                className="absolute top-0 transition-all duration-150 ease-out"
                style={{
                  transform: `translateX(${clampedAngle * 40}px) translateY(-2px)`,
                  opacity: arrowOpacity,
                }}
              >
                <svg width="20" height="24" viewBox="0 0 20 24">
                  <polygon
                    points="10,0 20,16 15,16 15,24 5,24 5,16 0,16"
                    fill="#ffaa00"
                    style={{ filter: `drop-shadow(0 0 ${isOffScreen ? '8px' : '4px'} #ffaa0080)` }}
                  />
                </svg>
              </div>

              <div className="absolute left-0.5 top-1/2 -translate-y-1/2">
                {angle < -Math.PI / 4 && (
                  <svg width="12" height="16" viewBox="0 0 12 16" className="animate-pulse">
                    <polygon points="12,0 12,16 0,8" fill="#ffaa00" style={{ filter: 'drop-shadow(0 0 4px #ffaa00)' }} />
                  </svg>
                )}
              </div>

              <div className="absolute right-0.5 top-1/2 -translate-y-1/2">
                {angle > Math.PI / 4 && (
                  <svg width="12" height="16" viewBox="0 0 12 16" className="animate-pulse">
                    <polygon points="0,0 0,16 12,8" fill="#ffaa00" style={{ filter: 'drop-shadow(0 0 4px #ffaa00)' }} />
                  </svg>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ boxShadow: '0 0 6px #ffaa00' }} />
              <span className="text-[10px] font-mono text-amber-400 tracking-wide">
                SPAWN: {distance.toFixed(1)}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
