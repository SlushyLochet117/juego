import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { setupLights } from './lights.js';
import { loadHouse } from './house.js';
import { loadCharacter, updateCharacter, getCharacter } from './player.js';
import { setupKeyboard } from './keyboard.js';
import { updateCamera } from './camara.js';
import { setupCollisions } from './collision.js';
import { setupHorror, updateHorror } from './horrorEvents.js';
import { setupFlashlight, updateFlashlight } from './flashlight.js';

export let scene, camera, renderer;
const clock = new THREE.Clock();

init();
animate();

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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    // 💡 LUCES
    setupLights(scene);

    // 💀 EVENTOS
    setupHorror(scene);

    // 🌲 LOADER (🔥 CORREGIDO)
    const gltfLoader = new GLTFLoader();



    // 🌲 BOSQUE
    gltfLoader.load('./examples/models/casa/bosque.glb', (gltf) => {

        const bosque = gltf.scene;

        bosque.scale.set(50, 50, 50);
        bosque.position.set(0, -10, -30);

        bosque.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = false;
                obj.receiveShadow = false;

                // 🔥 evita que opaque la escena
                if (obj.material) obj.material.depthWrite = false;
            }
        });

        scene.add(bosque);

        console.log("🌲 Bosque cargado");
    });

    // 🌙 HDR + NIEBLA
    const rgbeLoader = new RGBELoader();

    rgbeLoader.load(
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rogland_clear_night_4k.hdr',
        (texture) => {

            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.environment = envMap;

            // 🔥 fondo oscuro
            scene.background = new THREE.Color(0x000000);
            scene.fog = new THREE.FogExp2(0x000000, 0.003);

            texture.dispose();
            pmremGenerator.dispose();
        }
    );

    // 🧱 PAREDES INVISIBLES
    createWalls(scene);

    // 🏠 CASA + PERSONAJE
    loadHouse(scene, (house) => {

        setupCollisions(scene, house);
        loadCharacter(scene, house);

        // 🔦 LINTERNA (🔥 ya con personaje cargado)
        setTimeout(() => {
            setupFlashlight(scene);
        }, 500);
    });

    // ⌨️ TECLADO
    setupKeyboard();

    // 🔊 MÚSICA DE FONDO
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();
    const bgMusic = new THREE.Audio(listener);

    audioLoader.load('./examples/sounds/fondo.mp3', (buffer) => {
        bgMusic.setBuffer(buffer);
        bgMusic.setLoop(true);
        bgMusic.setVolume(0.3);
        bgMusic.play();
    });

    // 🔄 RESPONSIVE
    window.addEventListener('resize', onResize);
}

// -----------------------------------
// 🧱 CERRAR MAPA
// -----------------------------------
function createWalls(scene) {

    const size = 3000;
    const height = 500;

    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0
    });

    const back = new THREE.Mesh(
        new THREE.BoxGeometry(size, height, 50),
        material
    );
    back.position.set(0, height / 2, -1500);
    scene.add(back);

    const front = new THREE.Mesh(
        new THREE.BoxGeometry(size, height, 50),
        material
    );
    front.position.set(0, height / 2, 1500);
    scene.add(front);

    const left = new THREE.Mesh(
        new THREE.BoxGeometry(50, height, size),
        material
    );
    left.position.set(-1500, height / 2, 0);
    scene.add(left);

    const right = new THREE.Mesh(
        new THREE.BoxGeometry(50, height, size),
        material
    );
    right.position.set(1500, height / 2, 0);
    scene.add(right);

    console.log("🧱 Mapa cerrado");
}

// -----------------------------------
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// -----------------------------------
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    updateCharacter(delta);
    updateCamera(camera);

    const character = getCharacter();
    if (character) {
        updateHorror(character, scene);
    }

    updateFlashlight(camera); // 🔥 CORREGIDO

    renderer.render(scene, camera);
}