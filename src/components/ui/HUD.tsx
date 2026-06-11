import * as THREE from 'three';
import { MapCell } from '../../types';
import { OxygenBar } from './OxygenBar';
import { Compass } from './Compass';
import { MiniMap } from './MiniMap';
import { Inventory } from './Inventory';
import { ControlsHint } from './ControlsHint';
import { Crosshair } from './Crosshair';
import { OxygenWarning } from './OxygenWarning';
import { LoadingScreen } from './LoadingScreen';

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
}: HUDProps) {
  return (
    <>
      <LoadingScreen progress={generationProgress} isGenerating={isGenerating} />
      <OxygenWarning show={isOxygenLow && !isGodMode} />
      <Crosshair visible={isPointerLocked && !isGodMode} />

      {!isGodMode && (
        <OxygenBar oxygen={oxygen} isLow={isOxygenLow} isNearVent={isNearVent} />
      )}

      <Compass
        playerPosition={playerPosition}
        playerYaw={playerYaw}
        targetPosition={spawnPosition}
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

      <ControlsHint isPointerLocked={isPointerLocked} />

      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <h1 className="font-mono text-lg tracking-[0.3em] text-gray-500/70">
          CAVE EXPLORER
        </h1>
      </div>

      <div className="absolute top-4 right-4 mt-16 text-right">
        <div className="font-mono text-[10px] text-gray-600">
          POS: {playerPosition.x.toFixed(1)}, {playerPosition.y.toFixed(1)}, {playerPosition.z.toFixed(1)}
        </div>
      </div>
    </>
  );
}
