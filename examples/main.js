import * as THREE from 'three';

import { RGBELoader }
from 'three/addons/loaders/RGBELoader.js';

import { GLTFLoader }
from 'three/addons/loaders/GLTFLoader.js';

import { VRButton }
from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory }
from 'three/addons/webxr/XRControllerModelFactory.js';

import { PointerLockControls }
from 'three/addons/controls/PointerLockControls.js';

import { setupLights }
from './lights.js';

import { loadHouse }
from './house.js';

import {
    loadCharacter,
    updateCharacter,
    getCharacter
}
from './player.js';

import { setupKeyboard }
from './keyboard.js';

import { updateCamera }
from './camara.js';

import { setupCollisions }
from './collision.js';

import {
    setupHorror,
    updateHorror
}
from './horrorEvents.js';

import {
    setupFlashlight,
    updateFlashlight
}
from './flashlight.js';

import {
    loadMonster,
    updateMonster
}
from './monster.js';

import {
    setupSanity,
    updateSanity
}
from './sanity.js';

import {
    isFlashlightOn
}
from './flashlight.js';

// -----------------------------------

export let scene;
export let camera;
export let renderer;

const clock =
    new THREE.Clock();

let controller1;
let controller2;

let controls;

// -----------------------------------

init();

renderer.setAnimationLoop(
    animate
);

// -----------------------------------
function init() {

    // 🌍 ESCENA
    scene =
        new THREE.Scene();

    // 🎥 CAMARA
    camera =
        new THREE.PerspectiveCamera(

            45,

            window.innerWidth /
            window.innerHeight,

            1,

            3000
        );

    camera.position.set(
        0,
        60,
        400
    );

    // 🖥️ RENDER
    renderer =
        new THREE.WebGLRenderer({

            antialias: true
        });

    renderer.setSize(

        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled =
        true;

    renderer.xr.enabled =
        true;

    // 🔥 MÁS LUZ
    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.2;

    document.body.appendChild(
        renderer.domElement
    );

    // 🥽 VR BUTTON
    document.body.appendChild(

        VRButton.createButton(
            renderer
        )
    );

    // -----------------------------------
    // 🖱️ MOUSE LOOK
    // -----------------------------------

    controls =
        new PointerLockControls(

            camera,
            document.body
        );

    document.addEventListener(

        'click',

        () => {

            controls.lock();
        }
    );

    console.log(
        '🖱️ Mouse Look listo'
    );

    // 💡 LUCES
    setupLights(scene);

    // 💀 EVENTOS
    setupHorror(scene);

    // -----------------------------------
    // 🖐 CONTROLADORES VR
    // -----------------------------------

    const controllerModelFactory =
        new XRControllerModelFactory();

    // 🖐 IZQUIERDO
    controller1 =
        renderer.xr.getController(0);

    scene.add(controller1);

    const grip1 =
        renderer.xr.getControllerGrip(0);

    grip1.add(

        controllerModelFactory
            .createControllerModel(grip1)
    );

    scene.add(grip1);

    // 🖐 DERECHO
    controller2 =
        renderer.xr.getController(1);

    scene.add(controller2);

    const grip2 =
        renderer.xr.getControllerGrip(1);

    grip2.add(

        controllerModelFactory
            .createControllerModel(grip2)
    );

    scene.add(grip2);

    console.log(
        '🖐 Controladores listos'
    );

    // -----------------------------------
    // 🎮 BOTONES VR
    // -----------------------------------

    // 🔦 GATILLO DERECHO
    controller2.addEventListener(

        'selectstart',

        () => {

            updateFlashlight(true);

            console.log(
                '🔦 Linterna VR'
            );
        }
    );

    // ✋ INTERACTUAR
    controller1.addEventListener(

        'selectstart',

        () => {

            document.dispatchEvent(

                new KeyboardEvent(

                    'keydown',

                    { key: 'x' }
                )
            );

            console.log(
                '✋ Interacción VR'
            );
        }
    );

    // 🔦 LINTERNA
    setupFlashlight(

        scene,
        camera,
        controller2
    );

    // -----------------------------------
    // 🌲 BOSQUE
    // -----------------------------------

    const gltfLoader =
        new GLTFLoader();

    gltfLoader.load(

        './examples/models/casa/bosque.glb',

        (gltf) => {

            const bosque =
                gltf.scene;

            bosque.scale.set(
                50,
                50,
                50
            );

            bosque.position.set(
                0,
                -10,
                -30
            );

            bosque.traverse(obj => {

                if (obj.isMesh) {

                    obj.castShadow =
                        false;

                    obj.receiveShadow =
                        false;

                    if (obj.material) {

                        obj.material.depthWrite =
                            false;
                    }
                }
            });

            scene.add(bosque);

            console.log(
                '🌲 Bosque cargado'
            );
        }
    );

    // 👹 MONSTRUO
    loadMonster(
        scene,
        camera
    );

    // 🧠 CORDURA
    setupSanity(camera);

    // -----------------------------------
    // 🌙 HDR
    // -----------------------------------

    const rgbeLoader =
        new RGBELoader();

    rgbeLoader.load(

        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rogland_clear_night_4k.hdr',

        (texture) => {

            const pmremGenerator =
                new THREE.PMREMGenerator(
                    renderer
                );

            const envMap =

                pmremGenerator
                    .fromEquirectangular(texture)
                    .texture;

            scene.environment =
                envMap;

            scene.background =
                new THREE.Color(
                    0x050505
                );

            scene.fog =
                new THREE.FogExp2(
                    0x000000,
                    0.002
                );

            texture.dispose();

            pmremGenerator.dispose();
        }
    );

    // 🧱 PAREDES
    createWalls(scene);

    // 🏠 CASA
    loadHouse(

        scene,

        (house) => {

            setupCollisions(

                scene,
                house
            );

            loadCharacter(

                scene,
                house
            );
        }
    );

    // ⌨️ KEYBOARD
    setupKeyboard();

    // 🔊 MÚSICA
    const listener =
        new THREE.AudioListener();

    camera.add(listener);

    const audioLoader =
        new THREE.AudioLoader();

    const bgMusic =
        new THREE.Audio(listener);

    audioLoader.load(

        './examples/sounds/fondo.mp3',

        (buffer) => {

            bgMusic.setBuffer(
                buffer
            );

            bgMusic.setLoop(true);

            bgMusic.setVolume(0.3);

            bgMusic.play();
        }
    );

    // 📱 RESIZE
    window.addEventListener(
        'resize',
        onResize
    );
}

// -----------------------------------
// 🧱 WALLS
// -----------------------------------

function createWalls(scene) {

    const size = 3000;
    const height = 500;

    const material =
        new THREE.MeshBasicMaterial({

            transparent: true,
            opacity: 0
        });

    const positions = [

        [0, height / 2, -1500],
        [0, height / 2, 1500],
        [-1500, height / 2, 0],
        [1500, height / 2, 0]
    ];

    positions.forEach((p, i) => {

        const wall =
            new THREE.Mesh(

                i < 2

                    ? new THREE.BoxGeometry(
                        size,
                        height,
                        50
                    )

                    : new THREE.BoxGeometry(
                        50,
                        height,
                        size
                    ),

                material
            );

        wall.position.set(
            p[0],
            p[1],
            p[2]
        );

        scene.add(wall);
    });

    console.log(
        '🧱 Mapa cerrado'
    );
}

// -----------------------------------
// 📱 RESIZE
// -----------------------------------

function onResize() {

    camera.aspect =

        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(

        window.innerWidth,
        window.innerHeight
    );
}

// -----------------------------------
// 🥽 MOVIMIENTO VR
// -----------------------------------

function updateVRMovement(delta) {

    const session =
        renderer.xr.getSession();

    if (!session) return;

    const character =
        getCharacter();

    if (!character) return;

    const moveSpeed =
        120 * delta;

    // dirección cámara
    const forward =
        new THREE.Vector3();

    camera.getWorldDirection(
        forward
    );

    forward.y = 0;

    forward.normalize();

    // lateral
    const right =
        new THREE.Vector3();

    right.crossVectors(

        forward,

        new THREE.Vector3(
            0,
            1,
            0
        )
    );

    right.normalize();

    // 🎮 INPUTS
    for (const source of session.inputSources) {

        if (!source.gamepad)
            continue;

        const axes =
            source.gamepad.axes;

        let x =
            axes[2] ??
            axes[0] ??
            0;

        let y =
            axes[3] ??
            axes[1] ??
            0;

        // deadzone
        if (Math.abs(x) < 0.15)
            x = 0;

        if (Math.abs(y) < 0.15)
            y = 0;

        // 🚶 movimiento
        if (y !== 0) {

            character.position.add(

                forward.clone()
                    .multiplyScalar(
                        -y * moveSpeed
                    )
            );
        }

        // ↔ lateral
        if (x !== 0) {

            character.position.add(

                right.clone()
                    .multiplyScalar(
                        x * moveSpeed
                    )
            );
        }

        // 👤 rotación cuerpo
        const targetRotation =

            Math.atan2(
                forward.x,
                forward.z
            );

        character.rotation.y =
            THREE.MathUtils.lerp(

                character.rotation.y,

                targetRotation,

                0.1
            );
    }
}

// -----------------------------------
// 🎮 GAME LOOP
// -----------------------------------

function animate() {

    const delta =
        clock.getDelta();

    // 🎮 PLAYER
    updateCharacter(delta);

    // 🥽 VR
    updateVRMovement(delta);

    // 🎥 PC
    if (!renderer.xr.isPresenting) {

        updateCamera(
            camera,
            renderer
        );
    }

    const character =
        getCharacter();

    // 💀 EVENTOS
    if (character) {

        updateHorror(
            character,
            scene
        );

        updateMonster(
            character,
            camera
        );

        updateSanity(

            delta,

            character,

            null,

            isFlashlightOn()
        );
    }

    // 🔦 LINTERNA
    updateFlashlight(renderer);

    // 🖥️ RENDER
    renderer.render(
        scene,
        camera
    );
}