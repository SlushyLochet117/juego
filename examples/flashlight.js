import * as THREE from 'three';
import { keys } from './keyboard.js';

 export function isFlashlightOn() {
    return isOn;
}

let flashlight;
let isOn = true;

export function setupFlashlight(scene, controller) {

    flashlight = new THREE.SpotLight(
        0xffffff,
        20,
        1000,
        Math.PI / 7,
        0.4,
        1
    );

    flashlight.castShadow = true;

    // 📍 posición relativa al control VR
    flashlight.position.set(0, 0, 0);

    // 🎯 target
    flashlight.target.position.set(
        0,
        0,
        -10
    );

    // 🔥 PEGAR AL CONTROL
    controller.add(flashlight);

    controller.add(flashlight.target);

    scene.add(controller);

    console.log('🔦 Linterna VR lista');
}

export function updateFlashlight() {

    if (!flashlight) return;

    flashlight.target.updateMatrixWorld();

    // ⌨️ tecla F
    if (keys.f) {

        isOn = !isOn;

        flashlight.visible = isOn;

        console.log(
            'Linterna:',
            isOn ? 'ON' : 'OFF'
        );

        keys.f = false;
    }

}