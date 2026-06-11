import { useCallback } from 'react';
import * as THREE from 'three';
import { exportGeometryToOBJ, downloadFile } from '../utils/helpers';

export function useObjExport() {
  const exportCave = useCallback((geometry: THREE.BufferGeometry | null, filename = 'cave.obj') => {
    if (!geometry) return false;

    try {
      const objContent = exportGeometryToOBJ(geometry);
      downloadFile(objContent, filename, 'model/obj');
      return true;
    } catch (error) {
      console.error('Failed to export OBJ:', error);
      return false;
    }
  }, []);

  return { exportCave };
}
