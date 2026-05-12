import * as THREE from 'three';

import { GLTFLoader }
from 'three/addons/loaders/GLTFLoader.js';

import {
    isFlashlightOn,
    getFlashlightDirection,
    getFlashlightPosition
}
from './flashlight.js';

// -----------------------------------
let monster;
let monsterSound;

// IA
let chaseMode = false;
let scareCooldown = false;

let stunned = false;
let stunTimer = 0;

let aggression = 1;

// patrulla
const patrolPoints = [

    new THREE.Vector3(-300, 0, -900),
    new THREE.Vector3(400, 0, -700),
    new THREE.Vector3(200, 0, 300),
    new THREE.Vector3(-500, 0, 200)

];

let currentPatrol = 0;

// teleport
let lastTeleport = 0;

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

            monsterSound.setVolume(1.5);

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

            console.log('👹 Monstruo listo');
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
    // 🔦 DETECCIÓN DE LINTERNA
    // -----------------------------------

    let flashlightHit = false;

    if (isFlashlightOn()) {

        const lightPos =
            getFlashlightPosition();

        const lightDir =
            getFlashlightDirection();

        if (lightPos && lightDir) {

            const toMonster =
                new THREE.Vector3()
                    .subVectors(
                        monster.position,
                        lightPos
                    )
                    .normalize();

            const angle =
                lightDir.dot(toMonster);

            const lightDistance =
                lightPos.distanceTo(
                    monster.position
                );

            // 🔥 luz pegando directo
            if (
                angle > 0.90 &&
                lightDistance < 350
            ) {

                flashlightHit = true;
            }
        }
    }

    // -----------------------------------
    // 💥 STUN CON LINTERNA
    // -----------------------------------

    if (
        flashlightHit &&
        !stunned
    ) {

        stunned = true;

        stunTimer = performance.now();

        chaseMode = false;

        console.log('💡 Monstruo cegado');
    }

    // salir de stun
    if (stunned) {

        const elapsed =
            performance.now() - stunTimer;

        // retroceder
        const escapeDir =
            new THREE.Vector3()
                .subVectors(
                    monster.position,
                    character.position
                )
                .normalize();

        monster.position.add(
            escapeDir.multiplyScalar(1.5)
        );

        // efecto visual
        monster.visible =
            Math.sin(performance.now() * 0.02) > 0;

        if (monsterSound) {

            monsterSound.setVolume(0.3);
        }

        // terminar stun
        if (elapsed > 2500) {

            stunned = false;

            monster.visible = true;

            if (monsterSound) {

                monsterSound.setVolume(1.5);
            }
        }

        return;
    }

    // -----------------------------------
    // 👁️ DETECCIÓN
    // -----------------------------------

    const detectionRange =
        isFlashlightOn()
            ? 500
            : 250;

    if (dist < detectionRange) {

        chaseMode = true;

    } else if (dist > 600) {

        chaseMode = false;
    }

    // -----------------------------------
    // 👁️ VISIBILIDAD
    // -----------------------------------

    monster.visible =
        dist < 700;

    // -----------------------------------
    // 🔊 AUDIO
    // -----------------------------------

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
    // 🏃 PERSECUCIÓN
    // -----------------------------------

    if (chaseMode) {

        const dir =
            new THREE.Vector3()
                .subVectors(
                    character.position,
                    monster.position
                )
                .normalize();

        // 🔥 velocidad más balanceada
        const speed =
            0.12 * aggression;

        monster.position.add(
            dir.multiplyScalar(speed)
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
                dir.multiplyScalar(0.08)
            );
        }
    }

    // -----------------------------------
    // 👀 MIRAR PLAYER
    // -----------------------------------

    monster.lookAt(
        character.position
    );

    // -----------------------------------
    // 👁️ TELEPORT
    // -----------------------------------

    const now = performance.now();

    if (
        now - lastTeleport > 25000 &&
        dist > 500
    ) {

        lastTeleport = now;

        const angle =
            Math.random() *
            Math.PI * 2;

        const radius =
            250 +
            Math.random() * 150;

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
    // 😈 AGRESIVIDAD
    // -----------------------------------

    aggression += 0.00001;

    aggression =
        Math.min(
            aggression,
            2
        );

    // -----------------------------------
    // 💀 JUMPSCARE
    // -----------------------------------

    if (
        dist < 18 &&
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