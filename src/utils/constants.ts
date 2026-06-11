import { CaveConfig } from '../types';

export const CAVE_CONFIG: CaveConfig = {
  size: { x: 64, y: 32, z: 64 },
  noiseScale: 0.07,
  threshold: 0.35,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
};

export const PLAYER_CONFIG = {
  moveSpeed: 5,
  sprintSpeed: 10,
  jumpForce: 8,
  gravity: 20,
  mouseSensitivity: 0.002,
  playerRadius: 0.4,
  playerHeight: 1.8,
};

export const OXYGEN_CONFIG = {
  maxOxygen: 100,
  consumptionRate: 0.5,
  warningThreshold: 30,
  ventRadius: 3,
};

export const MAP_CONFIG = {
  cellSize: 1,
  exploreRadius: 5,
};

export const LIGHT_CONFIG = {
  headLightIntensity: 1.5,
  headLightDistance: 30,
  headLightAngle: Math.PI / 4,
  glowStickIntensity: 2,
  glowStickDistance: 20,
  maxDynamicLights: 8,
};

export const GAME_COLORS = {
  caveWall: '#3a3a4a',
  caveRock: '#2a2a3a',
  glowStick: '#00ff88',
  vent: '#4488ff',
  oxygenGood: '#00ffaa',
  oxygenWarning: '#ffaa00',
  oxygenDanger: '#ff4444',
  mapExplored: '#00ff88',
  mapWall: '#444455',
  mapPlayer: '#ff4444',
  mapVent: '#4488ff',
  mapGlowStick: '#00ff88',
};

export const CONTROLS = {
  forward: 'KeyW',
  backward: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  jump: 'Space',
  sprint: 'ShiftLeft',
  pickUp: 'KeyE',
  place: 'KeyQ',
  toggleGodMode: 'KeyV',
  exportObj: 'KeyO',
  regenerate: 'KeyR',
};
