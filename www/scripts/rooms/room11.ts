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

    // light
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0x666666));

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;

    // PLAYER
    let player: ExtendedMesh = ThreeUtils.makePlayer(physics);

    ThreeUtils.makeRoom(physics);
    ThreeUtils.makeDoor(10, 2, 0, 0, physics, "room23");
    // EXIT DOOR
    ThreeUtils.makeDoor(0, 2, -10, 90, physics, "room23", Global.BLUE);

    const ball = physics.add.sphere({ x: 0, y: 1.2, z: 0, radius: 0.4 }, { lambert: { color: Global.YELLOW } });
    const triggerUpdate = ThreeUtils.createCollectible(ball,physics);

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
        triggerUpdate();

        physics.update(clock.getDelta() * 1000);
        physics.updateDebugger();
    }
    return { scene, sceneUpdate, initialize };
}