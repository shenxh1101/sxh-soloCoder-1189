import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { usePerlinNoise } from './usePerlinNoise';
import { CAVE_CONFIG } from '../utils/constants';
import { CaveConfig, DecorationData, GlowStickData, VentData } from '../types';
import { generateId } from '../utils/helpers';

interface MarchingCube {
  vertices: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
  vertexCount: number;
}

const EDGE_TABLE = new Uint16Array([
  0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
  0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
  0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
  0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
  0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
  0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
  0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
  0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
  0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
  0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
  0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
  0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
  0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
  0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
  0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0,
]);

const TRI_TABLE = new Int8Array([
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
  3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
  3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
  3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
  9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
  9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
  2, 10, 7, 2, 7, 3, 7, 10, 4, 1, 4, 10, 9, -1, -1, -1,
  8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
  9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, 11, -1, -1, -1,
  8, 4, 7, 3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1,
  1, 11, 4, 1, 4, 2, 2, 4, 7, 1, 11, 10, 8, -1, -1, -1,
  4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
  4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
  5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
  2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, 1, -1, -1, -1,
  9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
  0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
  2, 1, 5, 2, 5, 8, 3, 2, 8, 11, 4, 8, 5, -1, -1, -1,
  10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
  4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, 3, -1, -1, -1,
  5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
  5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
  9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
  0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
  1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
  10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
  8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, 9, -1, -1, -1,
  2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
  7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
  2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
  11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
  5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, 3, -1,
  11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
  11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
  1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
  9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
  5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, 1, -1, -1, -1,
  2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
  5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
  6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
  3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
  6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
  5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
  10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
  6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
  8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
  7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
  3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
  5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
  0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
  9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
  8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
  5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
  0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
  6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
  10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
  10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
  8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
  1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
  0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
  10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
  3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
  6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
  9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
  8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
  3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
  6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
  0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
  10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
  10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
  2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
  7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
  7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
  2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
  1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
  11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
  8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
  0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
  7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
  10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
  2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
  6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
  7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
  2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
  1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
  10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
  10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
  0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
  7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
  6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
  8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
  9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
  6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
  4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
  10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
  8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
  0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
  1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
  8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
  10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
  4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
  10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
  5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
  11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
  9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
  6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
  7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
  3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
  7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
  3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
  6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
  9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
  1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
  4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
  7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
  6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
  3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
  0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
  6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
  0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
  11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
  6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
  5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
  9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
  1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
  1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
  10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
  0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
  5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
  10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
  11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
  9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
  7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
  2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
  8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
  9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
  9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
  1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 5, 8, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 0, 5, 10, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 8, 5, 10, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 10, 9, 10, 4, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 10, 4, 11, 7, 4, 1, 11, 9, 11, 1, 0, 8, 3, -1,
  4, 11, 7, 4, 10, 11, 0, 2, 9, 2, 11, 9, -1, -1, -1, -1,
  2, 4, 11, 2, 9, 4, 2, 11, 9, 3, 11, 8, 4, 8, 9, -1,
  7, 9, 4, 7, 10, 9, 7, 11, 10, 1, 10, 11, -1, -1, -1, -1,
  9, 4, 7, 9, 7, 10, 9, 10, 1, 11, 10, 7, 0, 8, 3, -1,
  11, 7, 10, 11, 10, 8, 7, 10, 4, 8, 10, 0, 0, 10, 2, -1,
  11, 10, 4, 8, 11, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 11, 5, 7, 11, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 4, 11, 5, 7, 11, 4, -1, -1, -1, -1, -1, -1, -1,
  5, 4, 11, 5, 11, 7, 5, 7, 0, 1, 0, 7, 9, -1, -1, -1, -1,
  8, 3, 1, 11, 7, 4, 3, 11, 4, 3, 4, 5, 7, 5, 4, -1,
  2, 5, 10, 2, 4, 5, 4, 7, 5, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 2, 5, 10, 4, 7, 5, -1, -1, -1, -1, -1, -1, -1,
  9, 0, 2, 9, 2, 5, 9, 5, 4, 7, 5, 2, -1, -1, -1, -1,
  9, 4, 5, 9, 5, 2, 8, 3, 2, 3, 5, 2, 7, 5, 2, -1,
  2, 5, 10, 3, 5, 2, 3, 4, 5, 7, 11, 4, -1, -1, -1, -1,
  10, 0, 8, 10, 2, 0, 5, 10, 4, 11, 4, 2, -1, -1, -1, -1,
  0, 1, 9, 3, 4, 5, 3, 5, 2, 5, 4, 11, 11, 4, 7, -1,
  9, 4, 5, 8, 3, 5, 2, 11, 5, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 8, 5, 4, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 8, 4, 11, 7, 4, 1, 11, 0, 11, 1, 9, -1, -1, -1, -1,
  1, 7, 10, 1, 10, 9, 7, 11, 10, -1, -1, -1, -1, -1, -1, -1,
  9, 4, 1, 9, 1, 7, 11, 4, 1, -1, -1, -1, -1, -1, -1, -1,
  3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 9, 10, 9, 4, -1,
  1, 10, 9, 1, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 11, 7, 4, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 11, 7, 5, 4, 7, 1, 9, 8, -1, -1, -1, -1, -1, -1, -1,
  8, 11, 7, 8, 4, 11, 9, 10, 4, 10, 7, 4, -1, -1, -1, -1,
  9, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
]);

function processCubeFast(
  cornerValues: number[],
  cornerX: number[],
  cornerY: number[],
  cornerZ: number[],
  threshold: number,
  mc: MarchingCube,
  offsetX: number,
  offsetY: number,
  offsetZ: number
): void {
  let cubeIndex = 0;
  for (let i = 0; i < 8; i++) {
    if (cornerValues[i] < threshold) cubeIndex |= 1 << i;
  }

  const edgeFlags = EDGE_TABLE[cubeIndex];
  if (edgeFlags === 0) return;

  const ex = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3];
  const ey = [1, 2, 3, 0, 5, 6, 7, 4, 4, 5, 6, 7];
  const evx: number[] = new Array(12);
  const evy: number[] = new Array(12);
  const evz: number[] = new Array(12);
  const evValid: boolean[] = new Array(12).fill(false);

  for (let ei = 0; ei < 12; ei++) {
    if (!(edgeFlags & (1 << ei))) continue;
    const i = ex[ei];
    const j = ey[ei];
    const vi = cornerValues[i];
    const vj = cornerValues[j];
    let t = 0.5;
    if (Math.abs(vj - vi) > 1e-8) {
      t = (threshold - vi) / (vj - vi);
    }
    evx[ei] = (cornerX[i] + t * (cornerX[j] - cornerX[i])) + offsetX;
    evy[ei] = (cornerY[i] + t * (cornerY[j] - cornerY[i])) + offsetY;
    evz[ei] = (cornerZ[i] + t * (cornerZ[j] - cornerZ[i])) + offsetZ;
    evValid[ei] = true;
  }

  let triIndex = 0;
  const startIdx = cubeIndex * 16;
  for (let iter = 0; iter < 16; iter++) {
    const idx0 = TRI_TABLE[startIdx + triIndex];
    if (idx0 === -1 || idx0 === undefined) break;
    const idx1 = TRI_TABLE[startIdx + triIndex + 1];
    const idx2 = TRI_TABLE[startIdx + triIndex + 2];

    if (
      typeof idx0 !== 'number' || typeof idx1 !== 'number' || typeof idx2 !== 'number' ||
      idx0 < 0 || idx0 >= 12 || idx1 < 0 || idx1 >= 12 || idx2 < 0 || idx2 >= 12 ||
      !evValid[idx0] || !evValid[idx1] || !evValid[idx2]
    ) {
      triIndex += 3;
      continue;
    }

    const vIdx0 = mc.vertexCount++;
    const vIdx1 = mc.vertexCount++;
    const vIdx2 = mc.vertexCount++;

    const ax = evx[idx0], ay = evy[idx0], az = evz[idx0];
    const bx = evx[idx1], by = evy[idx1], bz = evz[idx1];
    const cx = evx[idx2], cy = evy[idx2], cz = evz[idx2];

    mc.vertices.push(ax, ay, az, bx, by, bz, cx, cy, cz);

    const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
    let nx = e1y * e2z - e1z * e2y;
    let ny = e1z * e2x - e1x * e2z;
    let nz = e1x * e2y - e1y * e2x;
    const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= nlen; ny /= nlen; nz /= nlen;

    for (let k = 0; k < 3; k++) {
      mc.normals.push(nx, ny, nz);
    }

    mc.uvs.push(0, 0, 1, 0, 0.5, 1);
    mc.indices.push(vIdx0, vIdx1, vIdx2);

    triIndex += 3;
  }
}

export function useCaveGenerator() {
  const { fbm3D } = usePerlinNoise();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const volumeDataRef = useRef<Float32Array | null>(null);

  const generateCave = useCallback(
    async (config: CaveConfig = CAVE_CONFIG): Promise<THREE.BufferGeometry> => {
      setIsGenerating(true);
      setProgress(0);

      const { size, noiseScale, threshold, octaves, persistence, lacunarity } = config;
      const totalVoxels = size.x * size.y * size.z;
      const volume = new Float32Array(totalVoxels);

      for (let y = 0; y < size.y; y++) {
        for (let x = 0; x < size.x; x++) {
          for (let z = 0; z < size.z; z++) {
            const idx = y * size.x * size.z + x * size.z + z;
            const value = fbm3D(x, y, z, {
              scale: noiseScale,
              octaves,
              persistence,
              lacunarity,
            });

            const centerDist = Math.sqrt(
              Math.pow((x - size.x / 2) / (size.x / 2), 2) +
                Math.pow((y - size.y / 2) / (size.y / 2), 2) +
                Math.pow((z - size.z / 2) / (size.z / 2), 2)
            );
            const boundaryFactor = Math.max(0, 1 - centerDist * 0.8);
            volume[idx] = value * boundaryFactor;
          }
        }
        setProgress(((y + 1) / size.y) * 50);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      volumeDataRef.current = volume;

      const mc: MarchingCube = {
        vertices: [],
        normals: [],
        uvs: [],
        indices: [],
        vertexCount: 0,
      };

      const cornerOffsets = [
        [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1],
        [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1],
      ];

      const totalCubes = (size.x - 1) * (size.y - 1) * (size.z - 1);
      let cubesProcessed = 0;
      let cubeCounter = 0;
      const cornerX = new Array(8);
      const cornerY = new Array(8);
      const cornerZ = new Array(8);
      const cornerValues = new Array(8);

      for (let y = 0; y < size.y - 1; y++) {
        for (let x = 0; x < size.x - 1; x++) {
          for (let z = 0; z < size.z - 1; z++) {
            for (let ci = 0; ci < 8; ci++) {
              const [ox, oy, oz] = cornerOffsets[ci];
              const px = x + ox;
              const py = y + oy;
              const pz = z + oz;
              cornerX[ci] = px;
              cornerY[ci] = py;
              cornerZ[ci] = pz;
              cornerValues[ci] = volume[py * size.x * size.z + px * size.z + pz];
            }

            processCubeFast(cornerValues, cornerX, cornerY, cornerZ, threshold, mc, 0, 0, 0);

            cubesProcessed++;
            cubeCounter++;
            if (cubeCounter >= 500) {
              cubeCounter = 0;
              const progress = 50 + (cubesProcessed / totalCubes) * 50;
              setProgress(Math.min(99, progress));
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
        }
        const progress = 50 + (cubesProcessed / totalCubes) * 50;
        setProgress(Math.min(99, progress));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setProgress(99.1);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const geometry = new THREE.BufferGeometry();
      setProgress(99.2);
      await new Promise((resolve) => setTimeout(resolve, 0));

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(mc.vertices, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(mc.normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(mc.uvs, 2));
      geometry.setIndex(mc.indices);
      setProgress(99.4);
      await new Promise((resolve) => setTimeout(resolve, 0));

      geometry.computeVertexNormals();
      setProgress(99.7);
      await new Promise((resolve) => setTimeout(resolve, 0));

      geometry.computeBoundingBox();
      geometry.center();

      setIsGenerating(false);
      setProgress(100);

      return geometry;
    },
    [fbm3D]
  );

  const findSpawnPosition = useCallback(
    (config: CaveConfig = CAVE_CONFIG): THREE.Vector3 => {
      const { size } = config;
      const volume = volumeDataRef.current;
      if (!volume) return new THREE.Vector3(0, 0, 0);

      const centerX = Math.floor(size.x / 2);
      const centerY = Math.floor(size.y / 2);
      const centerZ = Math.floor(size.z / 2);

      for (let radius = 0; radius < Math.min(size.x, size.y, size.z) / 2; radius++) {
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
              const x = centerX + dx;
              const y = centerY + dy;
              const z = centerZ + dz;
              if (x < 1 || x >= size.x - 1 || y < 1 || y >= size.y - 1 || z < 1 || z >= size.z - 1) continue;

              const idx = y * size.x * size.z + x * size.z + z;
              const idxAbove = (y + 1) * size.x * size.z + x * size.z + z;
              const idxBelow = (y - 1) * size.x * size.z + x * size.z + z;

              if (volume[idx] < config.threshold && volume[idxAbove] < config.threshold && volume[idxBelow] > config.threshold) {
                return new THREE.Vector3(x - size.x / 2, y - size.y / 2 + 1, z - size.z / 2);
              }
            }
          }
        }
      }
      return new THREE.Vector3(0, 0, 0);
    },
    []
  );

  const generateDecorations = useCallback(
    (config: CaveConfig = CAVE_CONFIG, count = 200): DecorationData[] => {
      const { size } = config;
      const volume = volumeDataRef.current;
      if (!volume) return [];

      const decorations: DecorationData[] = [];
      const halfX = size.x / 2;
      const halfY = size.y / 2;
      const halfZ = size.z / 2;

      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * (size.x - 2)) + 1;
        const z = Math.floor(Math.random() * (size.z - 2)) + 1;

        let ceilingY = -1;
        let floorY = -1;

        for (let y = size.y - 2; y > 0; y--) {
          const idx = y * size.x * size.z + x * size.z + z;
          const idxAbove = (y + 1) * size.x * size.z + x * size.z + z;
          if (volume[idx] >= config.threshold && volume[idxAbove] < config.threshold) {
            ceilingY = y;
            break;
          }
        }

        for (let y = 1; y < size.y - 1; y++) {
          const idx = y * size.x * size.z + x * size.z + z;
          const idxBelow = (y - 1) * size.x * size.z + x * size.z + z;
          if (volume[idx] >= config.threshold && volume[idxBelow] < config.threshold) {
            floorY = y;
            break;
          }
        }

        if (ceilingY > 0 && Math.random() > 0.5) {
          decorations.push({
            id: generateId(),
            position: new THREE.Vector3(x - halfX, ceilingY - halfY, z - halfZ),
            scale: 0.5 + Math.random() * 1.5,
            rotation: new THREE.Euler(Math.PI, Math.random() * Math.PI * 2, 0),
            type: 'stalactite',
          });
        }

        if (floorY > 0 && Math.random() > 0.5) {
          decorations.push({
            id: generateId(),
            position: new THREE.Vector3(x - halfX, floorY - halfY + 1, z - halfZ),
            scale: 0.5 + Math.random() * 1.5,
            rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
            type: 'stalagmite',
          });
        }
      }

      return decorations;
    },
    []
  );

  const generateVents = useCallback(
    (config: CaveConfig = CAVE_CONFIG, count = 5): VentData[] => {
      const { size } = config;
      const volume = volumeDataRef.current;
      if (!volume) return [];

      const vents: VentData[] = [];
      const halfX = size.x / 2;
      const halfY = size.y / 2;
      const halfZ = size.z / 2;
      const minDist = Math.max(5, size.x / 6);
      const maxIter = count * 300;
      let iter = 0;

      while (vents.length < count && iter < maxIter) {
        iter++;
        const x = Math.floor(Math.random() * (size.x - 4)) + 2;
        const z = Math.floor(Math.random() * (size.z - 4)) + 2;

        for (let y = 1; y < size.y - 1; y++) {
          const idx = y * size.x * size.z + x * size.z + z;
          const idxBelow = (y - 1) * size.x * size.z + x * size.z + z;

          if (volume[idx] < config.threshold && volume[idxBelow] >= config.threshold) {
            const tooClose = vents.some(
              (v) =>
                Math.sqrt(
                  Math.pow(v.position.x - (x - halfX), 2) + Math.pow(v.position.z - (z - halfZ), 2)
                ) < minDist
            );

            if (!tooClose) {
              vents.push({
                id: generateId(),
                position: new THREE.Vector3(x - halfX, y - halfY + 0.1, z - halfZ),
                radius: 2 + Math.random() * 2,
              });
            }
            break;
          }
        }
      }

      return vents;
    },
    []
  );

  const generateGlowSticks = useCallback(
    (config: CaveConfig = CAVE_CONFIG, count = 8): GlowStickData[] => {
      const { size } = config;
      const volume = volumeDataRef.current;
      if (!volume) return [];

      const glowSticks: GlowStickData[] = [];
      const halfX = size.x / 2;
      const halfY = size.y / 2;
      const halfZ = size.z / 2;
      const maxIter = count * 300;
      let iter = 0;

      while (glowSticks.length < count && iter < maxIter) {
        iter++;
        const x = Math.floor(Math.random() * (size.x - 4)) + 2;
        const z = Math.floor(Math.random() * (size.z - 4)) + 2;

        for (let y = 1; y < size.y - 1; y++) {
          const idx = y * size.x * size.z + x * size.z + z;
          const idxBelow = (y - 1) * size.x * size.z + x * size.z + z;

          if (volume[idx] < config.threshold && volume[idxBelow] >= config.threshold) {
            glowSticks.push({
              id: generateId(),
              position: new THREE.Vector3(x - halfX, y - halfY + 0.1, z - halfZ),
              isPickedUp: false,
              intensity: 1.5 + Math.random() * 1,
            });
            break;
          }
        }
      }

      return glowSticks;
    },
    []
  );

  const sampleVolume = useCallback(
    (x: number, y: number, z: number, config: CaveConfig = CAVE_CONFIG): number => {
      const volume = volumeDataRef.current;
      if (!volume) return 1;

      const { size } = config;
      const gx = Math.floor(x + size.x / 2);
      const gy = Math.floor(y + size.y / 2);
      const gz = Math.floor(z + size.z / 2);

      if (gx < 0 || gx >= size.x || gy < 0 || gy >= size.y || gz < 0 || gz >= size.z) {
        return 1;
      }

      return volume[gy * size.x * size.z + gx * size.z + gz];
    },
    []
  );

  const checkCollision = useCallback(
    (pos: THREE.Vector3, radius: number, config: CaveConfig = CAVE_CONFIG): boolean => {
      const steps = 4;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const sample = sampleVolume(
              pos.x + (dx * radius) / steps,
              pos.y + (dy * radius) / steps,
              pos.z + (dz * radius) / steps,
              config
            );
            if (sample >= config.threshold) return true;
          }
        }
      }
      return false;
    },
    [sampleVolume]
  );

  return {
    generateCave,
    findSpawnPosition,
    generateDecorations,
    generateVents,
    generateGlowSticks,
    sampleVolume,
    checkCollision,
    isGenerating,
    progress,
  };
}
