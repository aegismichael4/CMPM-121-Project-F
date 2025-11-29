// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics, ExtendedMesh } from '@enable3d/ammo-physics';

// flat
import { TextTexture, TextSprite, DrawSprite } from '@enable3d/three-graphics/dist/flat';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';

export const Room11Scene = () => {
    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // HUD
    const scene2d = new THREE.Scene();

    /** ADD HUD TEXT ETC HERE */

    // add 2d text
    const text = new TextTexture('welcome to chudville, population: you', { fontWeight: 'bold', fontSize: 48 });
    const sprite = new TextSprite(text);
    const scale = 0.5;
    sprite.setScale(scale);
    sprite.setPosition(0 + (text.width * scale) / 2 + 12, window.innerHeight - (text.height * scale) / 2 - 12);
    scene2d.add(sprite);

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

    const inventorySlotSize = 100;
    const inventorySlots = 3;
    const slotOffset = 10;
    for (let i = 0; i < inventorySlots; i++) {
        const inventorySlot = new DrawSprite(inventorySlotSize, inventorySlotSize, drawRectangle);
        inventorySlot.setPosition(window.innerWidth - slotOffset - (inventorySlotSize/2) - ((inventorySlotSize + slotOffset) * i), (inventorySlotSize / 2) + slotOffset);
        scene2d.add(inventorySlot);
    }

    // light
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0x666666));
    const light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;

    // PLAYER
    let player: ExtendedMesh = ThreeUtils.makePlayer(physics);

    ThreeUtils.makeRoom(physics);
    ThreeUtils.makeDoor(10.25, 2, 0, physics, "room23");

    // clock
    const clock = new THREE.Clock();

    const initialize = () => {
        Global.switchScheme("movement");

        scene.remove(player);
        physics.destroy(player);
        player = ThreeUtils.makePlayer(physics);
    }

    const sceneUpdate = () => {
        ThreeUtils.movePlayer(player);

        physics.update(clock.getDelta() * 1000);
        physics.updateDebugger();
    }
    return { scene, scene2d, sceneUpdate, initialize };
}