
import * as Global from './global';
import { THREE, ExtendedMesh } from 'enable3d'
import { AmmoPhysics } from '@enable3d/ammo-physics';
import { ThreeGraphics } from '@enable3d/three-graphics';
import { DrawSprite } from '@enable3d/three-graphics/dist/flat';

export function movePlayer(player: ExtendedMesh) {
    if (Global.delta.x == 0 && Global.delta.z == 0) {
        player.body.setVelocity(0, 0, 0);
        return;
    }

    const hypot = Math.hypot(Global.delta.x, Global.delta.z);
    const delXNormalized = (Global.delta.x / hypot) * Global.MOVE_SPEED;
    const delZNormalized = (Global.delta.z / hypot) * Global.MOVE_SPEED;

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

// clamp one axis value (x,y,z) of player pos when going through doors
function clampDoorPos(num: number) {
    const doorOffset = 2;   // how far from door the player spawns (so scenes don't flicker forever)

    return (Math.abs(num) >= 10) ? ((num > 0) ? doorOffset - num : -(num + doorOffset)) : num;
}

// door creation function
export function makeDoor(x: number, y: number, z: number, physics: AmmoPhysics, nextRoom: string) {
    const door = physics.add.box({ x: x, y: y, z: z, width: .25, height: 3, depth: 2 }, { lambert: { color: Global.DOOR_COLOR } });

    door.body.on.collision((other: any) => {
        if (other.userData.tag == "player") {
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
    player.userData.tag = "player";
    return player;
}

// draw rectangle function for easy use in drawing inventory
const drawRectangle = ctx => {
    const { width } = ctx.canvas;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(42, 42, 42, 1)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 5;
    ctx.rect(0, 0, width, width);
    ctx.fill();
    ctx.stroke();
}

// draw inventory to hud (scene2d) based on global parameters
export function drawInventory(scene2d: THREE.Scene) {
    for (let i = 0; i < Global.inventorySlots; i++) {
        const inventorySlot = new DrawSprite(Global.inventorySlotSize, Global.inventorySlotSize, drawRectangle);
        inventorySlot.setPosition(window.innerWidth - Global.slotOffset - (Global.inventorySlotSize/2) - ((Global.inventorySlotSize + Global.slotOffset) * i), (Global.inventorySlotSize / 2) + Global.slotOffset);
        scene2d.add(inventorySlot);
    }
}