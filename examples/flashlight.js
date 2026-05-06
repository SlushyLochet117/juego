import * as THREE from 'three';
import { keys } from './keyboard.js';
import { getCharacter } from './player.js';

let flashlight;
let isOn = true;
let isReady = false;

export function setupFlashlight(scene) {

    // ⏳ esperar a que el personaje exista
    const wait = setInterval(() => {

        const character = getCharacter();

        if (!character) return;

        clearInterval(wait);

        // 🔦 crear linterna
        flashlight = new THREE.SpotLight(0xffffff, 50, 1600, Math.PI / 6, 0.5, 1);
        flashlight.castShadow = true;

        // 📍 posición tipo "mano"
        flashlight.position.set(0, 40, 10);

        // 🎯 target REAL (no el default)
        const target = new THREE.Object3D();
        target.position.set(0, 40, -50);

        character.add(flashlight);
        character.add(target);

        flashlight.target = target;

        isReady = true;

        console.log("🔦 Linterna lista (pegada al personaje)");

    }, 100);
}

export function updateFlashlight() {

    if (!flashlight || !isReady) return;

    const character = getCharacter();
    if (!character) return;

    // 👉 dirección del personaje (NO cámara)
    const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(character.quaternion);

    const targetPos = character.position.clone()
        .add(direction.multiplyScalar(100));

    flashlight.target.position.copy(targetPos);

    flashlight.target.updateMatrixWorld();

    // 🔘 toggle
    if (keys.f) {

        isOn = !isOn;
        flashlight.visible = isOn;

        console.log("Linterna:", isOn ? "ON" : "OFF");

        keys.f = false;
    }
}