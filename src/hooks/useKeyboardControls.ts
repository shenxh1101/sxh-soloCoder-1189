import { useState, useEffect, useCallback, useRef } from 'react';
import { CONTROLS } from '../utils/constants';

export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

export function useKeyboardControls() {
  const [keys, setKeys] = useState<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  });

  const keysRef = useRef(keys);
  keysRef.current = keys;

  const onKeyDownCallbacks = useRef<Map<string, () => void>>(new Map());
  const onKeyUpCallbacks = useRef<Map<string, () => void>>(new Map());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case CONTROLS.forward:
        setKeys((k) => ({ ...k, forward: true }));
        break;
      case CONTROLS.backward:
        setKeys((k) => ({ ...k, backward: true }));
        break;
      case CONTROLS.left:
        setKeys((k) => ({ ...k, left: true }));
        break;
      case CONTROLS.right:
        setKeys((k) => ({ ...k, right: true }));
        break;
      case CONTROLS.jump:
        setKeys((k) => ({ ...k, jump: true }));
        break;
      case CONTROLS.sprint:
        setKeys((k) => ({ ...k, sprint: true }));
        break;
      case CONTROLS.pickUp:
        onKeyDownCallbacks.current.get('pickUp')?.();
        break;
      case CONTROLS.place:
        onKeyDownCallbacks.current.get('place')?.();
        break;
      case CONTROLS.toggleGodMode:
        onKeyDownCallbacks.current.get('toggleGodMode')?.();
        break;
      case CONTROLS.exportObj:
        onKeyDownCallbacks.current.get('exportObj')?.();
        break;
      case CONTROLS.regenerate:
        onKeyDownCallbacks.current.get('regenerate')?.();
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case CONTROLS.forward:
        setKeys((k) => ({ ...k, forward: false }));
        break;
      case CONTROLS.backward:
        setKeys((k) => ({ ...k, backward: false }));
        break;
      case CONTROLS.left:
        setKeys((k) => ({ ...k, left: false }));
        break;
      case CONTROLS.right:
        setKeys((k) => ({ ...k, right: false }));
        break;
      case CONTROLS.jump:
        setKeys((k) => ({ ...k, jump: false }));
        break;
      case CONTROLS.sprint:
        setKeys((k) => ({ ...k, sprint: false }));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const onKeyDown = useCallback((action: string, callback: () => void) => {
    onKeyDownCallbacks.current.set(action, callback);
  }, []);

  const onKeyUp = useCallback((action: string, callback: () => void) => {
    onKeyUpCallbacks.current.set(action, callback);
  }, []);

  return {
    keys,
    keysRef,
    onKeyDown,
    onKeyUp,
  };
}
