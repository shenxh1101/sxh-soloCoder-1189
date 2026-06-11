import * as THREE from 'three';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getDistanceXZ(a: THREE.Vector3, b: THREE.Vector3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function getYawToTarget(
  from: THREE.Vector3,
  fromYaw: number,
  target: THREE.Vector3
): number {
  const dx = target.x - from.x;
  const dz = target.z - from.z;
  const targetYaw = Math.atan2(dx, dz);
  let angleDiff = targetYaw - fromYaw;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  return angleDiff;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportGeometryToOBJ(geometry: THREE.BufferGeometry): string {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const uvs = geometry.attributes.uv;
  const index = geometry.index;

  let obj = '# Exported from Cave Explorer\n';
  obj += `# Vertices: ${positions.count}\n`;
  obj += `# Faces: ${index ? index.count / 3 : positions.count / 3}\n\n`;

  for (let i = 0; i < positions.count; i++) {
    obj += `v ${positions.getX(i).toFixed(6)} ${positions.getY(i).toFixed(6)} ${positions.getZ(i).toFixed(6)}\n`;
  }

  if (normals) {
    obj += '\n';
    for (let i = 0; i < normals.count; i++) {
      obj += `vn ${normals.getX(i).toFixed(6)} ${normals.getY(i).toFixed(6)} ${normals.getZ(i).toFixed(6)}\n`;
    }
  }

  if (uvs) {
    obj += '\n';
    for (let i = 0; i < uvs.count; i++) {
      obj += `vt ${uvs.getX(i).toFixed(6)} ${uvs.getY(i).toFixed(6)}\n`;
    }
  }

  obj += '\n';

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i) + 1;
      const b = index.getX(i + 1) + 1;
      const c = index.getX(i + 2) + 1;
      if (normals && uvs) {
        obj += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`;
      } else if (normals) {
        obj += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
      } else if (uvs) {
        obj += `f ${a}/${a} ${b}/${b} ${c}/${c}\n`;
      } else {
        obj += `f ${a} ${b} ${c}\n`;
      }
    }
  } else {
    for (let i = 0; i < positions.count; i += 3) {
      const a = i + 1;
      const b = i + 2;
      const c = i + 3;
      obj += `f ${a} ${b} ${c}\n`;
    }
  }

  return obj;
}
