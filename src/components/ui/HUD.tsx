import * as THREE from 'three';
import { MapCell } from '../../types';
import { OxygenBar } from './OxygenBar';
import { Compass } from './Compass';
import { SpawnIndicator } from './SpawnIndicator';
import { MiniMap } from './MiniMap';
import { Inventory } from './Inventory';
import { ControlsHint } from './ControlsHint';
import { Crosshair } from './Crosshair';
import { OxygenWarning } from './OxygenWarning';
import { LoadingScreen } from './LoadingScreen';
import { InteractHint } from './InteractHint';

interface HUDProps {
  oxygen: number;
  isOxygenLow: boolean;
  isNearVent: boolean;
  playerPosition: THREE.Vector3;
  playerYaw: number;
  spawnPosition: THREE.Vector3;
  glowSticks: number;
  isGodMode: boolean;
  isPointerLocked: boolean;
  isGenerating: boolean;
  generationProgress: number;
  mapData: MapCell[][];
  gridWidth: number;
  gridHeight: number;
  exploredPercentage: number;
  nearestGlowStickAvailable: boolean;
  isOxygenDepleted: boolean;
}

export function HUD({
  oxygen,
  isOxygenLow,
  isNearVent,
  playerPosition,
  playerYaw,
  spawnPosition,
  glowSticks,
  isGodMode,
  isPointerLocked,
  isGenerating,
  generationProgress,
  mapData,
  gridWidth,
  gridHeight,
  exploredPercentage,
  nearestGlowStickAvailable,
  isOxygenDepleted,
}: HUDProps) {
  return (
    <>
      <LoadingScreen progress={generationProgress} isGenerating={isGenerating} />
      <OxygenWarning show={(isOxygenLow || isOxygenDepleted) && !isGodMode} isDepleted={isOxygenDepleted} />
      <Crosshair visible={isPointerLocked && !isGodMode && !isOxygenDepleted} />

      {!isGodMode && (
        <OxygenBar oxygen={oxygen} isLow={isOxygenLow} isNearVent={isNearVent} isDepleted={isOxygenDepleted} />
      )}

      <Compass playerYaw={playerYaw} />

      <SpawnIndicator
        playerPosition={playerPosition}
        playerYaw={playerYaw}
        spawnPosition={spawnPosition}
      />

      <MiniMap
        mapData={mapData}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        playerPosition={playerPosition}
        playerYaw={playerYaw}
        exploredPercentage={exploredPercentage}
      />

      <Inventory glowSticks={glowSticks} isGodMode={isGodMode} />

      {nearestGlowStickAvailable && !isGodMode && !isOxygenDepleted && (
        <InteractHint text="Press E to pick up glow stick" />
      )}

      {isOxygenDepleted && !isGodMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-red-900/90 backdrop-blur-md px-10 py-8 rounded-xl border-2 border-red-500 text-center max-w-md">
            <div className="text-4xl font-mono font-bold text-red-400 mb-4 tracking-wider">
              OXYGEN DEPLETED
            </div>
            <div className="text-gray-200 font-mono text-sm mb-2">
              You have been teleported back to spawn point.
            </div>
            <div className="text-yellow-400 font-mono text-sm animate-pulse">
              Find a ventilation vent to restore oxygen!
            </div>
          </div>
        </div>
      )}

      <ControlsHint isPointerLocked={isPointerLocked} />

      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <h1 className="font-mono text-lg tracking-[0.3em] text-gray-500/70">
          CAVE EXPLORER
        </h1>
      </div>

      <div className="absolute top-4 right-4 mt-40 text-right">
        <div className="font-mono text-[10px] text-gray-600">
          POS: {playerPosition.x.toFixed(1)}, {playerPosition.y.toFixed(1)}, {playerPosition.z.toFixed(1)}
        </div>
      </div>
    </>
  );
}
