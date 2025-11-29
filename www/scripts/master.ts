// three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// physics
import { AmmoPhysics, PhysicsLoader } from '@enable3d/ammo-physics';

// flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/dist/flat';

import * as Global from './global';
import { Room11Scene } from './rooms/room11';
import { Room22Scene } from './rooms/room22';
import { Room23Scene } from './rooms/room23';

let currentScene: { scene: THREE.Scene, scene2d: THREE.Scene, sceneUpdate: () => void, initialize: () => void };
let scenes: Record<string, any>;

const MasterScene = () => {
    // sizes
    const width = window.innerWidth;
    const height = window.innerHeight;

    // camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    // HUD
    const camera2d = new THREE.OrthographicCamera(0, width, height, 0, 1, 1000);
    camera2d.position.setZ(10);

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);

    // dpr
    const DPR = window.devicePixelRatio;
    renderer.setPixelRatio(Math.min(2, DPR));

    // orbit controls
    new OrbitControls(camera, renderer.domElement);

    // loop
    const animate = () => {
        if (scenes[Global.getCurrentScene()] !== currentScene) {
            currentScene = scenes[Global.getCurrentScene()];
            currentScene.initialize();
        }

        currentScene.sceneUpdate();

        // you have to clear and call render twice because there are 2 scenes
        // one 3d scene and one 2d scene
        renderer.clear();
        renderer.render(currentScene.scene, camera);
        renderer.clearDepth();
        renderer.render(currentScene.scene2d, camera2d);

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

PhysicsLoader('/ammo', () => {
    scenes = {
        'room11': Room11Scene(),
        'room22': Room22Scene(),
        'room23': Room23Scene()
    };

    Global.setCurrentScene("room11");
    MasterScene();
});