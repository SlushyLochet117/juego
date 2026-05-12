import * as THREE from 'three';
import { getCharacter } from './player.js';

let yaw = 0;
let pitch = 0;

let mouseEnabled = true;

// sensibilidad
const sensitivity = 0.002;

// -----------------------------------
// 🖱️ MOUSE LOOK
// -----------------------------------

document.addEventListener('mousemove', (e) => {

    // 🔥 SI ESTÁ EN VR NO HACER NADA
    if (!mouseEnabled) return;

    yaw -= e.movementX * sensitivity;

    pitch -= e.movementY * sensitivity;

    // límite vertical
    pitch = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, pitch)
    );

});

// click para bloquear mouse
document.addEventListener('click', () => {

    if (mouseEnabled) {
        document.body.requestPointerLock();
    }

});

// -----------------------------------
export function enableMouseLook(state) {

    mouseEnabled = state;
}

// -----------------------------------
export function updateCamera(camera, renderer) {

    const character = getCharacter();

    if (!character) return;

    // 📍 posición cabeza
    const headOffset =
        new THREE.Vector3(0, 40, 0);

    camera.position.copy(
        character.position.clone().add(headOffset)
    );

    // -----------------------------------
    // 🥽 VR
    // -----------------------------------

    if (renderer.xr.isPresenting) {

        // 🔥 EN VR NO CONTROLAMOS ROTACIÓN
        // la controla el headset
        return;
    }

    // -----------------------------------
    // 🖱️ MOUSE LOOK
    // -----------------------------------

    camera.rotation.order = 'YXZ';

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // 🔥 cuerpo sigue la cámara SOLO horizontal
    character.rotation.y = yaw;
}