
import * as Global from './global';
import { delta, getInteract } from './controls';
import { THREE, ExtendedMesh } from 'enable3d'
import { AmmoPhysics } from '@enable3d/ammo-physics';
import { ThreeGraphics } from '@enable3d/three-graphics';
import { DrawSprite } from '@enable3d/three-graphics/dist/flat';
import Factories from '@enable3d/common/dist/factories';

export function movePlayer(player: ExtendedMesh) {
    if (delta.x == 0 && delta.z == 0) {
        player.body.setVelocity(0, 0, 0);
        return;
    }

    const hypot = Math.hypot(delta.x, delta.z);
    const delXNormalized = (delta.x / hypot) * Global.MOVE_SPEED;
    const delZNormalized = (delta.z / hypot) * Global.MOVE_SPEED;

    player.body.setVelocity(delXNormalized, 0, delZNormalized);
}

export function makeRoom(physics: AmmoPhysics) {
    // floor
    physics.add.box({ x: 0, y: 0, z: 0, width: 20, height: 1, depth: 20, mass: 0 }, { lambert: { color: Global.GROUND_COLOR } }).body.setCollisionFlags(2);
    // walls
    physics.add.box({ x: 10.5, y: 2, z: 0, width: 1, height: 5, depth: 22, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
    physics.add.box({ x: -10.5, y: 2, z: 0, width: 1, height: 5, depth: 22, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
    physics.add.box({ x: 0, y: 2, z: 10.5, width: 20, height: 5, depth: 1, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
    physics.add.box({ x: 0, y: 2, z: -10.5, width: 20, height: 5, depth: 1, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
}

const doorOffset = 1;   // how far from door the player spawns (so scenes don't flicker forever)
// clamp one axis value (x,y,z) of player pos when going through doors
function clampDoorPos(num: number) {
    return (Math.abs(num) >= 10) ? ((num > 0) ? doorOffset - num : -(num + doorOffset)) : num;
}

// door creation function
export function makeDoor(x: number, y: number, z: number, rotation: number, physics: AmmoPhysics, nextRoom: string, color: number = Global.DOOR_COLOR) {
    const door = physics.add.box({ x: x, y: y, z: z, width: .25, height: 3, depth: 2 }, { lambert: { color: color } });
    door.body.setCollisionFlags(2);
    door.rotation.y = rotation * (Math.PI / 180);
    door.body.needUpdate = true;

    door.body.on.collision((other: any) => {
        if (compareTag(other.userData.tag, Global.playerTag)) {
            let playerX = clampDoorPos(x);
            let playerY = Global.getPlayerPosition().y;
            let playerZ = clampDoorPos(z);

            Global.setPlayerPosition(playerX, playerY, playerZ);
            Global.setCurrentScene(nextRoom);
        }
    });
}

export function makePlayer(physics: AmmoPhysics) {
    const pos = Global.getPlayerPosition();
    const player = physics.add.capsule({ x: pos.x, y: pos.y, z: pos.z, radius: 0.75, length: 1, mass: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
    player.body.setAngularFactor(0, 0, 0);
    player.userData.tag = Global.playerTag;
    return player;
}

// draw rectangle function for easy use in drawing inventory
const drawRectangle = (strokeStyle, fillStyle) => (ctx) => {
    const { width } = ctx.canvas;
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = 5;
    ctx.rect(0, 0, width, width);
    ctx.fill();
    ctx.stroke();
};

export function drawSlot(strokeStyle, fillStyle, i: number) {
    const slot = new DrawSprite(Global.inventorySlotSize, Global.inventorySlotSize, drawRectangle(strokeStyle, fillStyle));
    const inventoryPos = inventoryIndexToScreenPos(i);
    slot.setPosition(inventoryPos.x, inventoryPos.y);
    Global.scene2d.add(slot);
    return slot;
}

// draw inventory to hud (scene2d) based on global parameters
export function drawInventory() {
    for (let i = 0; i < Global.inventorySlots; i++) {
        drawSlot('rgba(42, 42, 42, 1)', 'rgba(0,0,0,0.2)', i);
    }
}

export function compareTag(tag: string, otherTag: string) {
    return tag == otherTag;
}

export function collected(collectible: ExtendedMesh) {
    return collectible.userData.collected;
}

export function createCollectible(collectible: ExtendedMesh, physics: AmmoPhysics, onCollect: Function = () => { }, radius: number = 1) {
    collectible.userData.tag = Global.collectibleTag;
    collectible.userData.collected = false;
    const trigger = physics.add.sphere({ x: 0, y: 0, z: 0, radius: radius, collisionFlags: 6 });
    trigger.visible = false;
    trigger.body.on.collision((other: any) => {
        if (compareTag(other.userData.tag, Global.playerTag) && getInteract() && !collected(collectible)) {
            onCollect();
            addToInventory(collectible);
        }
    });

    const triggerUpdate = () => {
        trigger.position.copy(collectible.position);
        trigger.body.needUpdate = true;
    }
    return triggerUpdate;
}

export function addToInventory(collectible: ExtendedMesh) {
    for (let i = 0; i < Global.inventorySlots; i++) {
        if (Global.INVENTORY[i] == null) {
            collectible.userData.collected = true;

            collectible.visible = false;
            collectible.body.setCollisionFlags(2);
            collectible.position.x = -100;
            collectible.position.z = -100;
            collectible.body.needUpdate = true;

            const item = drawSlot('rgba(42, 42, 42, 1)', 'rgba(0,0,0,0.2)', i);
            Global.INVENTORY[i] = "unga bunga";
            return;
        }
    }
}

function inventoryIndexToScreenPos(i: number) {
    const visualI = Global.inventorySlots - i - 1;
    return { x: window.innerWidth - Global.slotOffset - (Global.inventorySlotSize / 2) - ((Global.inventorySlotSize + Global.slotOffset) * visualI), y: (Global.inventorySlotSize / 2) + Global.slotOffset };
}

// inventory selector (which item is selected)
const inventorySelector = drawSlot('rgba(21, 58, 31, 1)', 'rgba(255, 255, 255, 0)', 0);

export function moveInventorySelector(i: number) {
    // shifts from r->l inventory to l->r
    const inventoryPos = inventoryIndexToScreenPos(i);
    inventorySelector.setPosition(inventoryPos.x, inventoryPos.y);
}

export function makePuzzle(x: number, y: number, z: number, physics: AmmoPhysics) {
    const puzzle = physics.add.box({ x: x, y: y, z: z, width: 1, depth: 1, height: .2 }, { lambert: { color: Global.PUZZLE_COLOR } });
    const triggerUpdate = createCollectible(puzzle, physics, () => {
        Global.setCurrentScene("room22");
    });
    return triggerUpdate;
}

export function createHand(x: number, y: number, z: number, hand: "left" | "right", ground: ExtendedMesh, factory: Factories) {
    const dir = hand === "left" ? -1 : 1;

    const segments = [
        { name: "thumb",   offsetX: 0,      offsetY: 0.25, offsetZ: 1.5,  length: 2,   rotationX: -Math.PI / 2, rotationZ: Math.PI / 3 * dir },
        { name: "pointer", offsetX: 0.5,    offsetY: 0.5,  offsetZ: 0.25, length: 3,   rotationX: -Math.PI / 3, rotationZ: Math.PI / 10 * dir },
        { name: "middle",  offsetX: 1.25,   offsetY: 0,    offsetZ: 0,    length: 3.5, rotationX: -Math.PI / 2, rotationZ: 0 },
        { name: "pinky",   offsetX: 1.25,   offsetY: -1,   offsetZ: 0.25, length: 3,   rotationX: -2 * Math.PI / 3, rotationZ: 0 },
        { name: "arm",     offsetX: 1,      offsetY: 0,    offsetZ: 6.75, length: 10,  rotationX: -Math.PI / 2, rotationZ: 0 },
    ];

    for (const segment of segments) {
        const capsule = factory.add.capsule({
            x: x + segment.offsetX * dir,
            y: y + segment.offsetY,
            z: z + segment.offsetZ,
            length: segment.length,
            radius: 1
        }, { lambert: { color: Global.PLAYER_COLOR } });

        capsule.rotation.x = segment.rotationX;
        capsule.rotation.z = segment.rotationZ;

        ground.add(capsule);
    }
}