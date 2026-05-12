import * as THREE from 'three';

import { GLTFLoader }
from 'three/addons/loaders/GLTFLoader.js';

import { isFlashlightOn }
from './flashlight.js';

// -----------------------------------
let monster;
let monsterSound;

// estados IA
let chaseMode = false;
let searchMode = false;

let scareCooldown = false;

// puntos patrulla
const patrolPoints = [

    new THREE.Vector3(-300, 0, -900),
    new THREE.Vector3(400, 0, -700),
    new THREE.Vector3(200, 0, 300),
    new THREE.Vector3(-500, 0, 200)

];

let currentPatrol = 0;

// timers
let lastTeleport = 0;
let aggression = 1;

// -----------------------------------
export function loadMonster(scene, camera) {

    // 🔊 AUDIO 3D
    const listener =
        new THREE.AudioListener();

    camera.add(listener);

    const audioLoader =
        new THREE.AudioLoader();

    monsterSound =
        new THREE.PositionalAudio(listener);

    audioLoader.load(
        './examples/sounds/monster.mp3',

        (buffer) => {

            monsterSound.setBuffer(buffer);

            monsterSound.setLoop(true);

            monsterSound.setVolume(2);

            monsterSound.setRefDistance(40);

            monsterSound.setRolloffFactor(2);

            monsterSound.setMaxDistance(600);

            monsterSound.setDistanceModel(
                'exponential'
            );
        }
    );

    // 👹 MODELO
    const loader =
        new GLTFLoader();

    loader.load(
        './examples/models/personaje/moster.glb',

        (gltf) => {

            monster =
                gltf.scene;

            monster.scale.set(
                4,
                4,
                4
            );

            monster.position.set(
                -300,
                0,
                -900
            );

            monster.visible = false;

            monster.traverse(obj => {

                if (obj.isMesh) {

                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            });

            monster.add(monsterSound);

            scene.add(monster);

            console.log('👹 IA monstruo lista');
        }
    );
}

// -----------------------------------
export function updateMonster(
    character,
    camera
) {

    if (
        !monster ||
        !character ||
        !camera
    ) return;

    // -----------------------------------
    // 📏 DISTANCIA
    // -----------------------------------

    const dist =
        character.position.distanceTo(
            monster.position
        );

    // -----------------------------------
    // 🔦 DETECCIÓN LINTERNA
    // -----------------------------------

    const flashlightBonus =
        isFlashlightOn()
            ? 250
            : 0;

    const detectionRange =
        250 + flashlightBonus;

    // -----------------------------------
    // 👁️ DETECTAR PLAYER
    // -----------------------------------

    if (dist < detectionRange) {

        chaseMode = true;
        searchMode = false;

    } else {

        if (chaseMode) {

            searchMode = true;

            setTimeout(() => {

                searchMode = false;

            }, 6000);
        }

        chaseMode = false;
    }

    // -----------------------------------
    // 👁️ VISIBILIDAD
    // -----------------------------------

    monster.visible =
        dist < 700;

    // 🔊 AUDIO
    if (
        monster.visible &&
        monsterSound &&
        !monsterSound.isPlaying
    ) {

        monsterSound.play();
    }

    if (
        !monster.visible &&
        monsterSound &&
        monsterSound.isPlaying
    ) {

        monsterSound.stop();
    }

    // -----------------------------------
    // 🏃 CHASE MODE
    // -----------------------------------

    if (chaseMode) {

        const dir =
            new THREE.Vector3()
                .subVectors(
                    character.position,
                    monster.position
                )
                .normalize();

        const speed =
            0.9 * aggression;

        monster.position.add(
            dir.multiplyScalar(speed)
        );
    }

    // -----------------------------------
    // 🔍 SEARCH MODE
    // -----------------------------------

    else if (searchMode) {

        const dir =
            new THREE.Vector3()
                .subVectors(
                    character.position,
                    monster.position
                )
                .normalize();

        monster.position.add(
            dir.multiplyScalar(0.25)
        );
    }

    // -----------------------------------
    // 🚶 PATRULLA
    // -----------------------------------

    else {

        const target =
            patrolPoints[currentPatrol];

        const dir =
            new THREE.Vector3()
                .subVectors(
                    target,
                    monster.position
                );

        if (dir.length() < 20) {

            currentPatrol++;

            if (
                currentPatrol >=
                patrolPoints.length
            ) {

                currentPatrol = 0;
            }

        } else {

            dir.normalize();

            monster.position.add(
                dir.multiplyScalar(0.2)
            );
        }
    }

    // -----------------------------------
    // 👀 MIRAR JUGADOR
    // -----------------------------------

    monster.lookAt(
        character.position
    );

    // -----------------------------------
    // 💀 TELEPORT RANDOM
    // -----------------------------------

    const now = performance.now();

    if (
        now - lastTeleport > 20000 &&
        dist > 500
    ) {

        lastTeleport = now;

        const angle =
            Math.random() * Math.PI * 2;

        const radius =
            250 + Math.random() * 200;

        monster.position.set(

            character.position.x +
            Math.cos(angle) * radius,

            0,

            character.position.z +
            Math.sin(angle) * radius
        );

        console.log(
            '👁️ El monstruo cambió posición'
        );
    }

    // -----------------------------------
    // 😈 AGRESIVIDAD DINÁMICA
    // -----------------------------------

    aggression += 0.00005;

    aggression =
        Math.min(
            aggression,
            3
        );

    // -----------------------------------
    // 💀 JUMPSCARE
    // -----------------------------------

    if (
        dist < 35 &&
        !scareCooldown
    ) {

        scareCooldown = true;

        triggerJumpscare();

        setTimeout(() => {

            scareCooldown = false;

        }, 10000);
    }
}

// -----------------------------------
function triggerJumpscare() {

    console.log('💀 GAME OVER');

    const flash =
        document.createElement('div');

    flash.style.position = 'fixed';
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = '100%';
    flash.style.height = '100%';

    flash.style.background = 'red';

    flash.style.opacity = 0.9;

    flash.style.zIndex = 9999;

    document.body.appendChild(flash);

    const text =
        document.createElement('h1');

    text.innerText =
        '💀 GAME OVER 💀';

    text.style.position = 'fixed';

    text.style.top = '50%';

    text.style.left = '50%';

    text.style.transform =
        'translate(-50%, -50%)';

    text.style.color = 'white';

    text.style.fontSize = '90px';

    text.style.fontFamily = 'Arial';

    text.style.zIndex = 10000;

    text.style.textShadow =
        '0 0 30px black';

    document.body.appendChild(text);

    const audio =
        new Audio(
            './examples/sounds/scream.mp3'
        );

    audio.volume = 1;

    audio.play();

    setTimeout(() => {

        location.reload();

    }, 5000);
}