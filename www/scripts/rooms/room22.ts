// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics, ExtendedMesh } from '@enable3d/ammo-physics';

// flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/dist/flat';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';
import { delta, switchScheme } from '../controls';

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
            lambert: { color: Global.PUZZLE_COLOR }
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
                        lambert: { color: Global.PUZZLE_WALL_COLOR },
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
        ground.rotation.x = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.x + delta.z));
        ground.rotation.z = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.z - delta.x));
    }

    ThreeUtils.createHand(9.75, 2, 0, "right", ground, factory);
    ThreeUtils.createHand(-9.75, 2, 0, "left", ground, factory);

    // clock
    const clock = new THREE.Clock();

    const initialize = () => {
        switchScheme("rotation");
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