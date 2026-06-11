import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import * as THREE from 'three';
import { GameState, GameAction, HUDState, MapCell } from '../types';

const initialHudState: HUDState = {
  oxygen: 100,
  isOxygenLow: false,
  isNearVent: false,
  playerPosition: new THREE.Vector3(0, 0, 0),
  playerYaw: 0,
  spawnPosition: new THREE.Vector3(0, 0, 0),
  glowSticks: 0,
  isGodMode: false,
  isPointerLocked: false,
  isGenerating: true,
  generationProgress: 0,
  mapData: [] as MapCell[][],
  gridWidth: 0,
  gridHeight: 0,
  exploredPercentage: 0,
};

const initialState: GameState = {
  caveGeometry: null,
  isPointerLocked: false,
  isGenerating: false,
  generationProgress: 0,
  hud: initialHudState,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CAVE_GEOMETRY':
      return { ...state, caveGeometry: action.payload };
    case 'SET_POINTER_LOCKED':
      return {
        ...state,
        isPointerLocked: action.payload,
        hud: { ...state.hud, isPointerLocked: action.payload },
      };
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload,
        hud: { ...state.hud, isGenerating: action.payload },
      };
    case 'SET_GENERATION_PROGRESS':
      return {
        ...state,
        generationProgress: action.payload,
        hud: { ...state.hud, generationProgress: action.payload },
      };
    case 'UPDATE_HUD':
      return {
        ...state,
        hud: { ...state.hud, ...action.payload },
      };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
