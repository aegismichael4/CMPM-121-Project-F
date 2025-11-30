import { DrawSprite } from '@enable3d/three-graphics/dist/flat';
import * as THREE from 'three';

// sizes
export const width = window.innerWidth;
export const height = window.innerHeight;

// HUD SCENE (shared across all scenes)
export const scene2d = new THREE.Scene();

// colors
export const BACKGROUND_COLOR = 0xf0f0f0;
export const WALL_COLOR = 0x4b9963;
export const GROUND_COLOR = 0x215e34;
export const DOOR_COLOR = 0x67a66e;
export const PLAYER_COLOR = 0xcde01f;
export const BLUE = 0x4782b3;
export const YELLOW = 0xffff00;
export const GREEN = 0x449944;
export const PUZZLE_COLOR = 0x36291e;
export const PUZZLE_WALL_COLOR = 0x47382a;

// tags
export const playerTag = "player";
export const collectibleTag = "collectible";

// tunable gameplay values
export const MOVE_SPEED = 3;
export const ROTATION_SPEED = .005;
export const MAX_ROTATION = Math.PI / 15;

// inventory
export const inventorySlotSize = 100;
export const inventorySlots = 3;
export const slotOffset = 10;
export const INVENTORY: (string | null)[] = Array(inventorySlots).fill(null);

// SCENE HANDLING
let currentSceneName: string = "";

export function getCurrentScene() {
    return currentSceneName;
}

export function setCurrentScene(newSceneName: string) {
    currentSceneName = newSceneName;
}

// player position
// this is for scene changes (so you enter a room from the side you entered) and for saving progress!
let playerPosition: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

export function getPlayerPosition() {
    return playerPosition;
}

export function setPlayerPosition(x: number, y: number, z: number) {
    playerPosition.set(x, y, z);
}

