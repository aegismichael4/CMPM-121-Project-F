// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics, ExtendedMesh } from '@enable3d/ammo-physics';

// flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/dist/flat';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';

export const Room22Scene = () => {
    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // light
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0x666666));

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;

    // static ground
    const ground = physics.add.box(
        {
            x: 0,
            y: 0,
            z: 0,
            width: 20,
            height: 1,
            depth: 20,
            collisionFlags: 2
        },
        {
            lambert: { color: Global.GROUND_COLOR }
        }
    );

    // invisible ceiling
    const ceiling = physics.add.box(
        {
            x: 0,
            y: 2.25,
            z: 0,
            width: 20,
            height: 1,
            depth: 20,
            collisionFlags: 2
        }
    );
    ceiling.visible = false;
    ground.add(ceiling);

    const mazeMap: number[] =
        [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1,
            1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,
            1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
            1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1,
            1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1,
            1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1,
            1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        ]

    const maze: ExtendedMesh[] = [];
    for (let i: number = 0; i < 16; i++) {
        for (let j: number = 0; j < 16; j++) {
            if (mazeMap[j * 16 + i] == 1) {
                const newCell = physics.add.box(
                    {
                        x: i * 1.25 - 9.375,
                        y: 1,
                        z: j * 1.25 - 9.375,
                        width: 1.25,
                        height: 1,
                        depth: 1.25,
                        collisionFlags: 2
                    },
                    {
                        lambert: { color: Global.GREEN },
                        mass: 1
                    }
                );
                maze.push(newCell);
                ground.add(newCell);
            }
        }
    }

    // rolling ball
    let ball = physics.add.sphere({ x: 0, y: 1.2, z: 0, radius: 0.4 }, { lambert: { color: Global.YELLOW } });

    const updateRotation = () => {
        // rotate ground and arms
        ground.rotation.x = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.x + Global.delta.z));
        ground.rotation.z = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.z - Global.delta.x));
    }

    const createHand = (hand: "left" | "right") => {
        let dir = 1;
        if (hand == "left") { dir = -1; }

        const thumb = factory.add.capsule({ x: 10 * dir, y: .75, z: 1.75, length: 2, radius: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
        thumb.rotation.x = -Math.PI / 2;
        thumb.rotation.z = dir * Math.PI / 3;

        const pointer = factory.add.capsule({ x: 10.5 * dir, y: 1.5, z: .5, length: 3, radius: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
        pointer.rotation.x = -Math.PI / 3;
        pointer.rotation.z = dir * Math.PI / 10;

        const middle = factory.add.capsule({ x: 11.25 * dir, y: 0.5, z: .25, length: 3.5, radius: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
        middle.rotation.x = -Math.PI / 2;

        const pinky = factory.add.capsule({ x: 11.25 * dir, y: -0.5, z: .5, length: 3, radius: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
        pinky.rotation.x = -2 * Math.PI / 3;

        const arm = factory.add.capsule({ x: 11 * dir, y: 0.5, z: 7, length: 10, radius: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
        arm.rotation.x = -Math.PI / 2;

        ground.add(thumb, pointer, middle, pinky, arm);
    }
    createHand("right");
    createHand("left");

    // clock
    const clock = new THREE.Clock();

    const initialize = () => {
        Global.switchScheme("rotation");
    }

    const sceneUpdate = () => {
        const deltaTime = clock.getDelta() * 1000;

        updateRotation();
        ground.body.needUpdate = true;
        ceiling.body.needUpdate = true;
        maze.forEach((cell: ExtendedMesh) => {
            cell.body.needUpdate = true;
        });

        physics.update(deltaTime);
        physics.updateDebugger();
    }
    return { scene, sceneUpdate, initialize };
}