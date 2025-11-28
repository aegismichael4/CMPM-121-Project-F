// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics } from '@enable3d/ammo-physics';

// flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/dist/flat';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';

export const Room22Scene = () => {
    // colors
    const YELLOW = 0xffff00;
    const GREEN = 0x449944;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // HUD
    const scene2d = new THREE.Scene();

    /** ADD HUD TEXT ETC HERE */


    // light
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0x666666));
    const light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);

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
            collisionFlags: 0
        },
        {
            lambert: { color: Global.GROUND_COLOR },
            mass: 0
        }
    );
    ground.body.setCollisionFlags(2);

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
                        collisionFlags: 1
                    },
                    {
                        lambert: { color: GREEN },
                        mass: 1
                    }
                );
                ground.add(newCell);
            }
        }
    }

    // rolling ball
    let ball = physics.add.sphere({ x: 0, y: 1.2, z: 0, radius: 0.3 }, { lambert: { color: YELLOW } });

    const updateRotation = () => {
        ground.rotation.x = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.x + Global.delta.z));
        ground.rotation.z = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.z - Global.delta.x));
    }

    let lastBallPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    // prevents clipping
    const limitBallSpeed = (deltaTime: number) => {
        let ballPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
        ball.getWorldPosition(ballPos);

        const ballSpeed = Math.abs(lastBallPos.length() - ballPos.length()) * deltaTime;
        console.log(ballSpeed);

        if (ballSpeed > .2) {
            //physics.destroy(ball);
            //ball.removeFromParent();
            //ball = physics.add.sphere({ x: 0, y: 1.2, z: 0, radius: 0.3 }, { lambert: { color: YELLOW } });
        }

        lastBallPos = ballPos;
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
        limitBallSpeed(deltaTime);

        ground.body.needUpdate = true;

        physics.update(deltaTime);
        physics.updateDebugger();
    }
    return { scene, scene2d, sceneUpdate, initialize };
}