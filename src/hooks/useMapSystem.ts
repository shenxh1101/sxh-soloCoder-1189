import { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { MapCell, VentData, GlowStickData, CaveConfig } from '../types';
import { MAP_CONFIG, CAVE_CONFIG } from '../utils/constants';

interface UseMapSystemProps {
  caveConfig?: CaveConfig;
  playerPosition: THREE.Vector3;
  vents: VentData[];
  glowSticks: GlowStickData[];
  sampleVolume: (x: number, y: number, z: number) => number;
}

export function useMapSystem({
  caveConfig = CAVE_CONFIG,
  playerPosition,
  vents,
  glowSticks,
  sampleVolume,
}: UseMapSystemProps) {
  const { size } = caveConfig;
  const gridWidth = size.x;
  const gridHeight = size.z;

  const [mapData, setMapData] = useState<MapCell[][]>(() => {
    const grid: MapCell[][] = [];
    for (let x = 0; x < gridWidth; x++) {
      grid[x] = [];
      for (let z = 0; z < gridHeight; z++) {
        grid[x][z] = {
          explored: false,
          hasWall: false,
          hasVent: false,
          hasGlowStick: false,
        };
      }
    }
    return grid;
  });

  const mapDataRef = useRef(mapData);
  mapDataRef.current = mapData;

  const worldToGrid = useCallback(
    (pos: THREE.Vector3): { x: number; z: number } => {
      const gx = Math.floor(pos.x + size.x / 2);
      const gz = Math.floor(pos.z + size.z / 2);
      return { x: Math.max(0, Math.min(gridWidth - 1, gx)), z: Math.max(0, Math.min(gridHeight - 1, gz)) };
    },
    [size.x, size.z, gridWidth, gridHeight]
  );

  const updateExploredArea = useCallback(() => {
    const { x: px, z: pz } = worldToGrid(playerPosition);
    const radius = MAP_CONFIG.exploreRadius;

    setMapData((prev) => {
      const newMap = prev.map((row) => row.map((cell) => ({ ...cell })));

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const gx = px + dx;
          const gz = pz + dz;

          if (gx >= 0 && gx < gridWidth && gz >= 0 && gz < gridHeight) {
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist <= radius) {
              newMap[gx][gz].explored = true;

              const worldX = gx - size.x / 2;
              const worldZ = gz - size.z / 2;
              let hasWall = false;
              for (let y = 0; y < size.y; y++) {
                const worldY = y - size.y / 2;
                if (sampleVolume(worldX, worldY, worldZ) >= caveConfig.threshold) {
                  hasWall = true;
                  break;
                }
              }
              newMap[gx][gz].hasWall = hasWall;
            }
          }
        }
      }

      vents.forEach((vent) => {
        const { x, z } = worldToGrid(vent.position);
        if (newMap[x] && newMap[x][z]) {
          newMap[x][z].hasVent = true;
        }
      });

      glowSticks.forEach((gs) => {
        if (!gs.isPickedUp) {
          const { x, z } = worldToGrid(gs.position);
          if (newMap[x] && newMap[x][z]) {
            newMap[x][z].hasGlowStick = true;
          }
        }
      });

      return newMap;
    });
  }, [playerPosition, worldToGrid, gridWidth, gridHeight, size, caveConfig.threshold, sampleVolume, vents, glowSticks]);

  useEffect(() => {
    const interval = setInterval(updateExploredArea, 200);
    return () => clearInterval(interval);
  }, [updateExploredArea]);

  const getExploredPercentage = useCallback(() => {
    let explored = 0;
    let total = 0;
    for (let x = 0; x < gridWidth; x++) {
      for (let z = 0; z < gridHeight; z++) {
        if (!mapDataRef.current[x][z].hasWall) {
          total++;
          if (mapDataRef.current[x][z].explored) explored++;
        }
      }
    }
    return total > 0 ? (explored / total) * 100 : 0;
  }, [gridWidth, gridHeight]);

  const resetMap = useCallback(() => {
    const grid: MapCell[][] = [];
    for (let x = 0; x < gridWidth; x++) {
      grid[x] = [];
      for (let z = 0; z < gridHeight; z++) {
        grid[x][z] = {
          explored: false,
          hasWall: false,
          hasVent: false,
          hasGlowStick: false,
        };
      }
    }
    setMapData(grid);
  }, [gridWidth, gridHeight]);

  return {
    mapData,
    worldToGrid,
    getExploredPercentage,
    resetMap,
    gridWidth,
    gridHeight,
  };
}
