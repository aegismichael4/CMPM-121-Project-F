import * as THREE from 'three';

// colors
export const BACKGROUND_COLOR = 0xf0f0f0;
export const WALL_COLOR = 0x4b9963;
export const GROUND_COLOR = 0x215e34;
export const DOOR_COLOR = 0x67a66e;
export const PLAYER_COLOR = 0xcde01f;
export const BLUE = 0x4782b3;
export const YELLOW = 0xffff00;
export const GREEN = 0x449944;

// tags
export const playerTag = "player";
export const collectibleTag = "collectible";

// tunable gameplay values
export const MOVE_SPEED = 3;
const ROTATION_SPEED = .005;
export const MAX_ROTATION = Math.PI / 15;

// inventory
export const inventorySlotSize = 100;
export const inventorySlots = 3;
export const slotOffset = 10;
export const INVENTORY: (string | null)[] = Array(inventorySlots).fill(null);

// control setup
export const delta = { x: 0, z: 0, del: 1 };
export const keys: Record<string, boolean> = {};
let interact: boolean = false;

// global getter to see if player is holding interact key
export function getInteract() {
    return interact;
}

const createKeybinding = (
    key: string,
    onKeyDown: () => void,
    onKeyUp: () => void = () => { }
) => {

    window.addEventListener('keydown', (e) => {
        if (e.key === key && !keys[key]) {
            onKeyDown();
            keys[key] = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === key && keys[key]) {
            onKeyUp();
            keys[key] = false;
        }
    });
};

export const switchScheme = (scheme: "rotation" | "movement") => {
    for (const key in keys) keys[key] = false;
    delta.x = 0;
    delta.z = 0;

    if (scheme == "rotation") {
        delta.del = ROTATION_SPEED;
    } else {
        delta.del = 1;
    }
};

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

// general-purpose chuddy controls, default del 1 (player movement)
createKeybinding('d', () => delta.x += delta.del, () => delta.x -= delta.del);
createKeybinding('a', () => delta.x -= delta.del, () => delta.x += delta.del);
createKeybinding('w', () => delta.z -= delta.del, () => delta.z += delta.del);
createKeybinding('s', () => delta.z += delta.del, () => delta.z -= delta.del);

// PICKUP
createKeybinding('e', () => { interact = true;}, () => { interact = false;});