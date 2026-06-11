import { useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GameProvider, useGame } from './context/GameContext';
import { useCaveGenerator } from './hooks/useCaveGenerator';
import { usePlayerState } from './hooks/usePlayerState';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useOxygenSystem } from './hooks/useOxygenSystem';
import { useMapSystem } from './hooks/useMapSystem';
import { useObjExport } from './hooks/useObjExport';
import { CAVE_CONFIG } from './utils/constants';
import { generateId } from './utils/helpers';
import { Cave } from './components/3d/Cave';
import { Player } from './components/3d/Player';
import { Decorations } from './components/3d/Decorations';
import { GlowSticks } from './components/3d/GlowStick';
import { Vents } from './components/3d/Vent';
import { GodViewCamera } from './components/3d/GodViewCamera';
import { HUD } from './components/ui/HUD';
import { DecorationData, GlowStickData, VentData } from './types';

function GameScene() {
  const { state, dispatch } = useGame();
  const {
    generateCave,
    findSpawnPosition,
    generateDecorations,
    generateVents,
    generateGlowSticks,
    checkCollision,
    sampleVolume,
    isGenerating,
    progress,
  } = useCaveGenerator();

  const [spawnPos, setSpawnPos] = useState(new THREE.Vector3(0, 0, 0));
  const [decorations, setDecorations] = useState<DecorationData[]>([]);
  const [vents, setVents] = useState<VentData[]>([]);
  const [glowSticks, setGlowSticks] = useState<GlowStickData[]>([]);

  const {
    playerState,
    playerStateRef,
    setPosition,
    setRotation,
    setOxygen,
    addGlowStick,
    removeGlowStick,
    toggleGodMode,
  } = usePlayerState(spawnPos);

  const { keys, onKeyDown } = useKeyboardControls();
  const { exportCave } = useObjExport();

  const { isLow, isNearVent } = useOxygenSystem({
    vents,
    playerPosition: playerState.position,
    isGodMode: playerState.isGodMode,
    onOxygenChange: setOxygen,
  });

  const { mapData, getExploredPercentage, gridWidth, gridHeight } = useMapSystem({
    playerPosition: playerState.position,
    vents,
    glowSticks,
    sampleVolume,
  });

  const { gl } = useThree();

  useEffect(() => {
    dispatch({
      type: 'UPDATE_HUD',
      payload: {
        oxygen: playerState.oxygen,
        isOxygenLow: isLow(),
        isNearVent: isNearVent(),
        playerPosition: playerState.position,
        playerYaw: playerState.yaw,
        spawnPosition: playerState.spawnPosition,
        glowSticks: playerState.glowSticks,
        isGodMode: playerState.isGodMode,
        mapData,
        gridWidth,
        gridHeight,
        exploredPercentage: getExploredPercentage(),
      },
    });
  }, [
    dispatch,
    playerState.oxygen,
    playerState.position,
    playerState.yaw,
    playerState.spawnPosition,
    playerState.glowSticks,
    playerState.isGodMode,
    isLow,
    isNearVent,
    mapData,
    gridWidth,
    gridHeight,
    getExploredPercentage,
  ]);

  const generateWorld = useCallback(async () => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_GENERATION_PROGRESS', payload: 0 });

    const geometry = await generateCave(CAVE_CONFIG);
    dispatch({ type: 'SET_CAVE_GEOMETRY', payload: geometry });

    const spawn = findSpawnPosition(CAVE_CONFIG);
    setSpawnPos(spawn);
    dispatch({ type: 'UPDATE_HUD', payload: { spawnPosition: spawn } });

    const decos = generateDecorations(CAVE_CONFIG, 250);
    setDecorations(decos);

    const ventList = generateVents(CAVE_CONFIG, 6);
    setVents(ventList);

    const gsList = generateGlowSticks(CAVE_CONFIG, 10);
    setGlowSticks(gsList);

    dispatch({ type: 'SET_GENERATING', payload: false });
  }, [dispatch, generateCave, findSpawnPosition, generateDecorations, generateVents, generateGlowSticks]);

  useEffect(() => {
    generateWorld();
  }, [generateWorld]);

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      dispatch({ type: 'SET_GENERATION_PROGRESS', payload: progress });
    }
  }, [progress, dispatch]);

  useEffect(() => {
    if (isGenerating) return;

    const handleClick = () => {
      if (!playerState.isGodMode) {
        gl.domElement.requestPointerLock?.();
      }
    };

    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === gl.domElement;
      dispatch({ type: 'SET_POINTER_LOCKED', payload: isLocked });
    };

    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gl, dispatch, isGenerating, playerState.isGodMode]);

  const handlePickUpGlowStick = useCallback((id: string) => {
    setGlowSticks((prev) =>
      prev.map((gs) => (gs.id === id ? { ...gs, isPickedUp: true } : gs))
    );
    addGlowStick();
  }, [addGlowStick]);

  const handlePlaceGlowStick = useCallback(
    (position: THREE.Vector3, direction: THREE.Vector3) => {
      if (!removeGlowStick()) return;

      const placePos = position.clone().add(direction.multiplyScalar(2));
      placePos.y -= 0.5;

      const newGs: GlowStickData = {
        id: generateId(),
        position: placePos,
        isPickedUp: false,
        intensity: 1.5 + Math.random(),
      };

      setGlowSticks((prev) => [...prev, newGs]);
    },
    [removeGlowStick]
  );

  const placeStickAction = useCallback(() => {
    const { position, yaw, pitch } = playerStateRef.current;
    const direction = new THREE.Vector3(
      -Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      -Math.cos(yaw) * Math.cos(pitch)
    ).normalize();
    handlePlaceGlowStick(position, direction);
  }, [handlePlaceGlowStick, playerStateRef]);

  const exportAction = useCallback(() => {
    const success = exportCave(state.caveGeometry);
    if (success) {
      console.log('OBJ exported successfully');
    }
  }, [exportCave, state.caveGeometry]);

  const regenerateAction = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    generateWorld();
  }, [generateWorld]);

  useEffect(() => {
    onKeyDown('pickUp', () => {
      console.log('Pickup pressed');
    });
    onKeyDown('place', placeStickAction);
    onKeyDown('toggleGodMode', () => {
      toggleGodMode();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      dispatch({ type: 'SET_POINTER_LOCKED', payload: false });
    });
    onKeyDown('exportObj', exportAction);
    onKeyDown('regenerate', regenerateAction);
  }, [onKeyDown, placeStickAction, toggleGodMode, exportAction, regenerateAction, dispatch]);

  const onPlayerPositionChange = useCallback(
    (pos: THREE.Vector3) => {
      setPosition(pos);
    },
    [setPosition]
  );

  const onPlayerRotationChange = useCallback(
    (yaw: number, pitch: number) => {
      setRotation(yaw, pitch);
    },
    [setRotation]
  );

  return (
    <>
      <Cave geometry={state.caveGeometry} />
      <Decorations decorations={decorations} />
      <Vents vents={vents} isGodMode={playerState.isGodMode} />
      <GlowSticks
        glowSticks={glowSticks}
        onPickUp={handlePickUpGlowStick}
        playerPosition={playerState.position}
        isGodMode={playerState.isGodMode}
      />

      {!playerState.isGodMode ? (
        <Player
          keys={keys}
          checkCollision={checkCollision}
          onPositionChange={onPlayerPositionChange}
          onRotationChange={onPlayerRotationChange}
          isGodMode={playerState.isGodMode}
          isPointerLocked={state.isPointerLocked}
          spawnPosition={spawnPos}
          onPlaceGlowStick={handlePlaceGlowStick}
        />
      ) : (
        <GodViewCamera isActive={playerState.isGodMode} />
      )}
    </>
  );
}

function AppContent() {
  const { state } = useGame();

  return (
    <div className="w-full h-screen bg-gray-950 overflow-hidden relative">
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 500, position: [0, 5, 0] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <GameScene />
      </Canvas>
      <HUD
        oxygen={state.hud.oxygen}
        isOxygenLow={state.hud.isOxygenLow}
        isNearVent={state.hud.isNearVent}
        playerPosition={state.hud.playerPosition}
        playerYaw={state.hud.playerYaw}
        spawnPosition={state.hud.spawnPosition}
        glowSticks={state.hud.glowSticks}
        isGodMode={state.hud.isGodMode}
        isPointerLocked={state.hud.isPointerLocked}
        isGenerating={state.hud.isGenerating}
        generationProgress={state.hud.generationProgress}
        mapData={state.hud.mapData}
        gridWidth={state.hud.gridWidth}
        gridHeight={state.hud.gridHeight}
        exploredPercentage={state.hud.exploredPercentage}
      />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
