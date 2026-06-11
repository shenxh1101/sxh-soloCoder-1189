import { useState, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameProvider, useGame } from './context/GameContext';
import { useCaveGenerator } from './hooks/useCaveGenerator';
import { usePlayerState } from './hooks/usePlayerState';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useOxygenSystem } from './hooks/useOxygenSystem';
import { useMapSystem } from './hooks/useMapSystem';
import { useObjExport } from './hooks/useObjExport';
import { CAVE_CONFIG, OXYGEN_CONFIG } from './utils/constants';
import { generateId } from './utils/helpers';
import { Cave } from './components/3d/Cave';
import { Player } from './components/3d/Player';
import { Decorations } from './components/3d/Decorations';
import { GlowSticks } from './components/3d/GlowStick';
import { Vents } from './components/3d/Vent';
import { GodViewCamera } from './components/3d/GodViewCamera';
import { HUD } from './components/ui/HUD';
import { DecorationData, GlowStickData, VentData } from './types';

const PICKUP_DISTANCE = 2.0;

function findNearestGlowStick(
  glowSticks: GlowStickData[],
  playerPos: THREE.Vector3
): { id: string | null; distance: number } {
  let nearest: string | null = null;
  let minDist = Infinity;
  for (const gs of glowSticks) {
    if (gs.isPickedUp) continue;
    const d = playerPos.distanceTo(gs.position);
    if (d < minDist && d <= PICKUP_DISTANCE) {
      minDist = d;
      nearest = gs.id;
    }
  }
  return { id: nearest, distance: minDist };
}

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
  const [nearestStickId, setNearestStickId] = useState<string | null>(null);
  const [isOxygenDepleted, setIsOxygenDepleted] = useState(false);

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

  const handleOxygenDepleted = useCallback(() => {
    if (!isOxygenDepleted) {
      setIsOxygenDepleted(true);
      setPosition(spawnPos);
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  }, [isOxygenDepleted, setPosition, spawnPos]);

  const { isLow, isNearVent } = useOxygenSystem({
    vents,
    playerPosition: playerState.position,
    isGodMode: playerState.isGodMode,
    onOxygenChange: (oxygen: number) => {
      setOxygen(oxygen);
      if (oxygen <= 0 && !playerState.isGodMode) {
        handleOxygenDepleted();
      }
      if (isOxygenDepleted && oxygen > OXYGEN_CONFIG.warningThreshold) {
        setIsOxygenDepleted(false);
      }
    },
  });

  const { mapData, getExploredPercentage, gridWidth, gridHeight } = useMapSystem({
    playerPosition: playerState.position,
    vents,
    glowSticks,
    sampleVolume,
  });

  const { gl } = useThree();

  useFrame(() => {
    const { id } = findNearestGlowStick(glowSticks, playerState.position);
    setNearestStickId((prev) => (prev !== id ? id : prev));
  });

  useEffect(() => {
    dispatch({
      type: 'UPDATE_HUD',
      payload: {
        oxygen: playerState.oxygen,
        isOxygenLow: isLow() || isOxygenDepleted,
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
        nearestGlowStickAvailable: nearestStickId !== null,
        isOxygenDepleted,
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
    nearestStickId,
    isOxygenDepleted,
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

  const handlePickUpGlowStick = useCallback(() => {
    if (!nearestStickId) return false;
    setGlowSticks((prev) =>
      prev.map((gs) => (gs.id === nearestStickId ? { ...gs, isPickedUp: true } : gs))
    );
    addGlowStick();
    return true;
  }, [nearestStickId, addGlowStick]);

  const handlePlaceGlowStick = useCallback(() => {
    if (!removeGlowStick()) return;

    const { position, yaw } = playerStateRef.current;
    const direction = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
    const placePos = position.clone().add(direction.multiplyScalar(1.5));
    placePos.y -= 0.8;

    const newGs: GlowStickData = {
      id: generateId(),
      position: placePos,
      isPickedUp: false,
      intensity: 1.5 + Math.random(),
    };

    setGlowSticks((prev) => [...prev, newGs]);
  }, [removeGlowStick, playerStateRef]);

  const pickUpAction = useCallback(() => {
    if (isOxygenDepleted || playerState.isGodMode) return;
    handlePickUpGlowStick();
  }, [handlePickUpGlowStick, isOxygenDepleted, playerState.isGodMode]);

  const placeAction = useCallback(() => {
    if (isOxygenDepleted || playerState.isGodMode) return;
    handlePlaceGlowStick();
  }, [handlePlaceGlowStick, isOxygenDepleted, playerState.isGodMode]);

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
    setIsOxygenDepleted(false);
    generateWorld();
  }, [generateWorld]);

  const toggleGodModeAction = useCallback(() => {
    toggleGodMode();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    dispatch({ type: 'SET_POINTER_LOCKED', payload: false });
  }, [toggleGodMode, dispatch]);

  useEffect(() => {
    onKeyDown('pickUp', pickUpAction);
    onKeyDown('place', placeAction);
    onKeyDown('toggleGodMode', toggleGodModeAction);
    onKeyDown('exportObj', exportAction);
    onKeyDown('regenerate', regenerateAction);
  }, [onKeyDown, pickUpAction, placeAction, toggleGodModeAction, exportAction, regenerateAction]);

  const onPlayerPositionChange = useCallback(
    (pos: THREE.Vector3) => {
      if (isOxygenDepleted) return;
      setPosition(pos);
    },
    [setPosition, isOxygenDepleted]
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
        isGodMode={playerState.isGodMode}
        nearestStickId={nearestStickId}
      />

      {!playerState.isGodMode ? (
        <Player
          keys={isOxygenDepleted ? { forward: false, backward: false, left: false, right: false, jump: false, sprint: false } : keys}
          checkCollision={checkCollision}
          onPositionChange={onPlayerPositionChange}
          onRotationChange={onPlayerRotationChange}
          isGodMode={playerState.isGodMode}
          isPointerLocked={state.isPointerLocked}
          spawnPosition={spawnPos}
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
        nearestGlowStickAvailable={state.hud.nearestGlowStickAvailable}
        isOxygenDepleted={state.hud.isOxygenDepleted}
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
