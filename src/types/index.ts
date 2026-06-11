import * as THREE from 'three';

export interface CaveConfig {
  size: { x: number; y: number; z: number };
  noiseScale: number;
  threshold: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
}

export interface PlayerState {
  position: THREE.Vector3;
  yaw: number;
  pitch: number;
  velocity: THREE.Vector3;
  oxygen: number;
  glowSticks: number;
  isGodMode: boolean;
  spawnPosition: THREE.Vector3;
}

export interface MapCell {
  explored: boolean;
  hasWall: boolean;
  hasVent: boolean;
  hasGlowStick: boolean;
}

export interface GlowStickData {
  id: string;
  position: THREE.Vector3;
  isPickedUp: boolean;
  intensity: number;
}

export interface VentData {
  id: string;
  position: THREE.Vector3;
  radius: number;
}

export interface DecorationData {
  id: string;
  position: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
  type: 'stalactite' | 'stalagmite';
}

export interface HUDState {
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

export interface GameState {
  caveGeometry: THREE.BufferGeometry | null;
  isPointerLocked: boolean;
  isGenerating: boolean;
  generationProgress: number;
  hud: HUDState;
}

export type GameAction =
  | { type: 'SET_CAVE_GEOMETRY'; payload: THREE.BufferGeometry | null }
  | { type: 'SET_POINTER_LOCKED'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_GENERATION_PROGRESS'; payload: number }
  | { type: 'UPDATE_HUD'; payload: Partial<HUDState> };
