import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { setupLights } from './lights.js';
import { loadHouse } from './house.js';
import {
    loadCharacter,
    updateCharacter,
    getCharacter
} from './player.js';

import { setupKeyboard } from './keyboard.js';
import { updateCamera } from './camara.js';
import { setupCollisions } from './collision.js';
import { setupHorror, updateHorror } from './horrorEvents.js';
import { setupFlashlight, updateFlashlight } from './flashlight.js';

// 🥽 VR
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

export let scene, camera, renderer;

const clock = new THREE.Clock();

let controller1;
let controller2;

// -----------------------------------
// 🚀 INICIO
// -----------------------------------
init();

// 🔥 IMPORTANTE PARA VR
renderer.setAnimationLoop(animate);

// -----------------------------------
function init() {

    // 🌍 ESCENA
    scene = new THREE.Scene();

    // 🎥 CÁMARA
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        3000
    );

    camera.position.set(0, 60, 400);

    // 🖥️ RENDER
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    // 🥽 ACTIVAR XR
    renderer.xr.enabled = true;

    document.body.appendChild(renderer.domElement);

    // 🥽 BOTÓN VR
    document.body.appendChild(
        VRButton.createButton(renderer)
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
    controller1 = renderer.xr.getController(0);
    scene.add(controller1);

    const grip1 = renderer.xr.getControllerGrip(0);

    grip1.add(
        controllerModelFactory.createControllerModel(grip1)
    );

    scene.add(grip1);

    // 🖐 DERECHO
    controller2 = renderer.xr.getController(1);
    scene.add(controller2);

    const grip2 = renderer.xr.getControllerGrip(1);

    grip2.add(
        controllerModelFactory.createControllerModel(grip2)
    );

    scene.add(grip2);

    console.log('🖐 Controladores VR listos');

    // -----------------------------------
    // 🌲 MODELO BOSQUE
    // -----------------------------------

    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
        './examples/models/casa/bosque.glb',

        (gltf) => {

            const bosque = gltf.scene;

            bosque.scale.set(50, 50, 50);

            bosque.position.set(
                0,
                -10,
                -30
            );

            bosque.traverse(obj => {

                if (obj.isMesh) {

                    obj.castShadow = false;
                    obj.receiveShadow = false;

                    // 🔥 evita bugs visuales
                    if (obj.material) {
                        obj.material.depthWrite = false;
                    }
                }
            });

            scene.add(bosque);

            console.log('🌲 Bosque cargado');
        }
    );

    // -----------------------------------
    // 🌙 HDR + NIEBLA
    // -----------------------------------

    const rgbeLoader = new RGBELoader();

    rgbeLoader.load(
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rogland_clear_night_4k.hdr',

        (texture) => {

            const pmremGenerator =
                new THREE.PMREMGenerator(renderer);

            const envMap =
                pmremGenerator
                    .fromEquirectangular(texture)
                    .texture;

            scene.environment = envMap;

            // 🌑 FONDO OSCURO
            scene.background =
                new THREE.Color(0x000000);

            // 🌫 NIEBLA
            scene.fog =
                new THREE.FogExp2(
                    0x000000,
                    0.003
                );

            texture.dispose();
            pmremGenerator.dispose();
        }
    );

    // -----------------------------------
    // 🧱 CERRAR MAPA
    // -----------------------------------

    createWalls(scene);

    // -----------------------------------
    // 🏠 CASA + PLAYER
    // -----------------------------------

    loadHouse(scene, (house) => {

        setupCollisions(scene, house);

        loadCharacter(scene, house);

        // 🔦 LINTERNA
        setTimeout(() => {

            setupFlashlight(scene);

        }, 500);
    });

    // ⌨️ TECLADO
    setupKeyboard();

    // -----------------------------------
    // 🔊 MÚSICA
    // -----------------------------------

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

            bgMusic.setBuffer(buffer);

            bgMusic.setLoop(true);

            bgMusic.setVolume(0.3);

            bgMusic.play();
        }
    );

    // 🔄 RESPONSIVE
    window.addEventListener(
        'resize',
        onResize
    );
}

// -----------------------------------
// 🧱 PAREDES INVISIBLES
// -----------------------------------

function createWalls(scene) {

    const size = 3000;
    const height = 500;

    const material =
        new THREE.MeshBasicMaterial({

            transparent: true,
            opacity: 0
        });

    // ATRÁS
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(
            size,
            height,
            50
        ),
        material
    );

    back.position.set(
        0,
        height / 2,
        -1500
    );

    scene.add(back);

    // FRENTE
    const front = new THREE.Mesh(
        new THREE.BoxGeometry(
            size,
            height,
            50
        ),
        material
    );

    front.position.set(
        0,
        height / 2,
        1500
    );

    scene.add(front);

    // IZQUIERDA
    const left = new THREE.Mesh(
        new THREE.BoxGeometry(
            50,
            height,
            size
        ),
        material
    );

    left.position.set(
        -1500,
        height / 2,
        0
    );

    scene.add(left);

    // DERECHA
    const right = new THREE.Mesh(
        new THREE.BoxGeometry(
            50,
            height,
            size
        ),
        material
    );

    right.position.set(
        1500,
        height / 2,
        0
    );

    scene.add(right);

    console.log('🧱 Mapa cerrado');
}

// -----------------------------------
// 📱 RESPONSIVE
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

    for (const source of session.inputSources) {

        if (!source.gamepad) continue;

        const axes =
            source.gamepad.axes;

        // 🎮 JOYSTICK
        const x = axes[2] || 0;
        const y = axes[3] || 0;

        const speed =
            120 * delta;

        // 🚶 ADELANTE / ATRÁS
        if (Math.abs(y) > 0.15) {

            character.translateZ(
                -y * speed
            );
        }

        // 🔄 GIRAR
        if (Math.abs(x) > 0.15) {

            character.rotation.y -=
                x * 0.04;
        }
    }
}

// -----------------------------------
// 🎮 GAME LOOP
// -----------------------------------

function animate() {

    const delta =
        clock.getDelta();

    // 🎮 PLAYER NORMAL
    updateCharacter(delta);

    // 🥽 VR
    updateVRMovement(delta);

    // 🎥 SOLO MODO NORMAL
    if (!renderer.xr.isPresenting) {

        updateCamera(camera);
    }

    // 💀 EVENTOS
    const character =
        getCharacter();

    if (character) {

        updateHorror(
            character,
            scene
        );
    }

    // 🔦 LINTERNA
    updateFlashlight();

    // 🖥️ RENDER
    renderer.render(
        scene,
        camera
    );
}