import * as THREE from 'three';
import { keys } from './keyboard.js';
import { getCharacter } from './player.js';

let flashlight;
let isOn = true;

export function setupFlashlight(scene, camera) {

    flashlight = new THREE.SpotLight(
        0xffffff,
        20,
        1000,
        Math.PI / 7,
        0.4,
        1
    );
 flashlight.castShadow = true;

    flashlight.position.set(0, 0, 0);

    flashlight.target.position.set(0, 0, -10);

    controller2.add(flashlight);
    camera.add(flashlight.target);

    scene.add(camera);

    console.log('🔦 Linterna VR lista');
}

export function updateFlashlight() {

    if (!flashlight) return;

    flashlight.target.updateMatrixWorld();

    if (keys.f) {
  isOn = !isOn;

        flashlight.visible = isOn;

        console.log('Linterna:', isOn ? 'ON' : 'OFF');

        keys.f = false;
    }
}