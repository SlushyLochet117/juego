import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { keys } from './keyboard.js';
import { checkCollision } from './collision.js';

let characterContainer, mixer, characterFBX;

let idleAction, walkAction, runAction, pickupAction;
let activeAction;

let isPicking = false;

// 🔊 AUDIO
let listener;
let sounds = {};

// 🎒 INVENTARIO
const foundItems = {
    MESA: false,
    CARTA: false,
    LLAVE: false
};

export function loadCharacter(scene, house) {

    const loader = new FBXLoader();
    const path = './examples/models/personaje/';

    characterContainer = new THREE.Group();

    loader.load(path + 'idle.fbx', (fbx) => {

        characterFBX = fbx;
        characterFBX.scale.set(0.2, 0.2, 0.2);
        characterFBX.rotation.y = Math.PI;

        characterFBX.traverse(c => {
            if (c.isMesh) {
                c.castShadow = true;
                c.material = new THREE.MeshStandardMaterial({
            map: c.material.map || null,
            color: 0xffffff,
            roughness: 0.7,
            metalness: 0.1
        });
            }
        });

        characterContainer.add(characterFBX);

        // 📍 POSICIÓN
        const houseBox = new THREE.Box3().setFromObject(house);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        houseBox.getSize(size);
        houseBox.getCenter(center);

        characterContainer.position.set(
            center.x + size.x / 2 + 120,
            0,
            center.z
        );

        scene.add(characterContainer);

        // 🎬 ANIMACIONES
        mixer = new THREE.AnimationMixer(characterFBX);

        idleAction = mixer.clipAction(fbx.animations[0]);
        idleAction.play();
        activeAction = idleAction;

        loader.load(path + 'Injured Walking.fbx', a => {
            if (a.animations.length > 0)
                walkAction = mixer.clipAction(a.animations[0]);
        });

        loader.load(path + 'Slow Run.fbx', a => {
            if (a.animations.length > 0)
                runAction = mixer.clipAction(a.animations[0]);
        });

        loader.load(path + 'Picking Up.fbx', a => {
            if (a.animations.length > 0) {
                pickupAction = mixer.clipAction(a.animations[0]);
                pickupAction.setLoop(THREE.LoopOnce);
                pickupAction.clampWhenFinished = true;
            }
        });

        // 🔊 AUDIO
        listener = new THREE.AudioListener();
        characterContainer.add(listener);

        const audioLoader = new THREE.AudioLoader();

        const loadSound = (name, path) => {
            const sound = new THREE.Audio(listener);
            audioLoader.load(path, (buffer) => {
                sound.setBuffer(buffer);
                sound.setVolume(0.7);
            });
            sounds[name] = sound;
        };

        loadSound("mesa", './examples/sounds/table.mp3');
        loadSound("carta", './examples/sounds/paper.mp3');
        loadSound("llave", './examples/sounds/key.mp3');
        loadSound("puerta", './examples/sounds/door_open.mp3');

    });
}

// 🎬 CAMBIO ANIMACIÓN
function switchAnimation(newAction) {
    if (!newAction || activeAction === newAction) return;

    activeAction.fadeOut(0.2);
    newAction.reset().fadeIn(0.2).play();
    activeAction = newAction;
}

// 🎮 UPDATE
export function updateCharacter(delta) {

    if (!characterContainer) return;

    const prevPos = characterContainer.position.clone();

    if (mixer) mixer.update(delta);

    if (isPicking) return;

    let moving = false;
    let speed = keys.shift ? 4.0 : 1.5;

    if (keys.w) { characterContainer.translateZ(-speed * delta * 50); moving = true; }
    if (keys.s) { characterContainer.translateZ(speed * delta * 50); moving = true; }
    if (keys.a) characterContainer.rotation.y += 0.05;
    if (keys.d) characterContainer.rotation.y -= 0.05;

    if (checkCollision(characterContainer)) {
        characterContainer.position.copy(prevPos);
    }

    // 🔥 INTERACTUAR
    if (keys.x) {

        const objects = characterContainer.parent.children;

        for (let obj of objects) {

            if (!obj.name) continue;

            const distance = characterContainer.position.distanceTo(obj.position);

            // -----------------------------------
            // 🎒 OBJETOS
            // -----------------------------------
            if (["MESA", "CARTA", "LLAVE"].includes(obj.name)) {

                if (distance < 80 && !foundItems[obj.name]) {

                    foundItems[obj.name] = true;

                    // 🔊 SONIDO
                    sounds[obj.name.toLowerCase()]?.play();

                    isPicking = true;
                    switchAnimation(pickupAction);

                    setTimeout(() => {
                        obj.visible = false;
                        isPicking = false;
                        switchAnimation(idleAction);
                    }, 1200);

                    updateUI();
                }
            }

            // -----------------------------------
            // 🚪 PUERTAS (MULTIPLES)
            // -----------------------------------
            if (obj.name === "PUERTA") {

                const door = obj; // 🔥 este ya es el pivot desde house.js

                if (distance < 120) {

                    if (!foundItems.LLAVE) {
                        console.log("🔒 Necesitas la llave");
                        continue;
                    }

                    if (!door.userData.open) {

                        sounds.puerta?.play();

                        let rot = door.rotation.y;
                        const target = rot + Math.PI / 3;

                        const interval = setInterval(() => {

                            rot += 0.03;
                            door.rotation.y = rot;

                            if (rot >= target) {
                                clearInterval(interval);
                            }

                        }, 16);

                        door.userData.open = true;
                    }
                }
            }
        }

        keys.x = false;
    }

    // 🎬 ANIMACIONES
    if (!isPicking) {
        if (moving) {
            if (keys.shift && runAction) switchAnimation(runAction);
            else if (walkAction) switchAnimation(walkAction);
        } else {
            switchAnimation(idleAction);
        }
    }
}

// 🎯 UI
function updateUI() {

    const ui = document.getElementById("inventory");
    if (!ui) return;

    ui.innerHTML = `
        <h3>🎒 Objetivos</h3>
        <p style="color:${foundItems.MESA ? 'lime' : 'red'}">
            ${foundItems.MESA ? '✔' : '✖'} Revisar mesa
        </p>
        <p style="color:${foundItems.CARTA ? 'lime' : 'red'}">
            ${foundItems.CARTA ? '✔' : '✖'} Encontrar carta
        </p>
        <p style="color:${foundItems.LLAVE ? 'lime' : 'red'}">
            ${foundItems.LLAVE ? '✔' : '✖'} Obtener llave
        </p>
    `;
}

// 🎥 CÁMARA
export function getCharacter() {
    return characterContainer;
}

setTimeout(updateUI, 1000);