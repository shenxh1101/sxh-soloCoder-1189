import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { MapCell } from '../../types';
import { GAME_COLORS, CAVE_CONFIG } from '../../utils/constants';

interface MiniMapProps {
  mapData: MapCell[][];
  gridWidth: number;
  gridHeight: number;
  playerPosition: THREE.Vector3;
  playerYaw: number;
  exploredPercentage: number;
}

export function MiniMap({
  mapData,
  gridWidth,
  gridHeight,
  playerPosition,
  playerYaw,
  exploredPercentage,
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180;
  const cellSize = size / Math.max(gridWidth, gridHeight);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, size, size);

    for (let x = 0; x < gridWidth; x++) {
      for (let z = 0; z < gridHeight; z++) {
        const cell = mapData[x]?.[z];
        if (!cell || !cell.explored) continue;

        const px = x * cellSize;
        const py = z * cellSize;

        if (cell.hasWall) {
          ctx.fillStyle = GAME_COLORS.mapWall;
        } else {
          ctx.fillStyle = GAME_COLORS.mapExplored + '30';
        }

        ctx.fillRect(px, py, cellSize, cellSize);

        if (cell.hasVent && !cell.hasWall) {
          ctx.fillStyle = GAME_COLORS.mapVent;
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        if (cell.hasGlowStick && !cell.hasWall) {
          ctx.fillStyle = GAME_COLORS.mapGlowStick;
          ctx.fillRect(px + cellSize * 0.3, py + cellSize * 0.3, cellSize * 0.4, cellSize * 0.4);
        }
      }
    }

    const playerGridX = Math.floor(playerPosition.x + CAVE_CONFIG.size.x / 2);
    const playerGridZ = Math.floor(playerPosition.z + CAVE_CONFIG.size.z / 2);
    const playerPx = playerGridX * cellSize + cellSize / 2;
    const playerPy = playerGridZ * cellSize + cellSize / 2;

    ctx.save();
    ctx.translate(playerPx, playerPy);
    ctx.rotate(playerYaw);

    ctx.fillStyle = GAME_COLORS.mapPlayer;
    ctx.beginPath();
    ctx.moveTo(0, -cellSize * 1.5);
    ctx.lineTo(cellSize * 0.8, cellSize * 0.8);
    ctx.lineTo(-cellSize * 0.8, cellSize * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = GAME_COLORS.mapPlayer;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#00ff8840';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);
  }, [mapData, gridWidth, gridHeight, playerPosition, playerYaw, cellSize, size]);

  return (
    <div className="absolute bottom-4 right-4 w-[180px] h-[210px]">
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded border border-gray-700 bg-gray-900/80"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute -top-1 left-0 text-[10px] font-mono text-gray-500">
          MINER MAP
        </div>
        <div className="absolute -bottom-2 left-0 text-[10px] font-mono text-gray-400">
          EXPLORED: {exploredPercentage.toFixed(1)}%
        </div>
        <div className="absolute -bottom-2 right-0 text-[9px] font-mono text-gray-500">
          <span className="inline-block w-2 h-2 bg-red-500 mr-1" /> YOU
          <span className="inline-block w-2 h-2 bg-blue-500 ml-2 mr-1" /> VENT
        </div>
      </div>
    </div>
  );
}
