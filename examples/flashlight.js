import * as THREE from 'three';
import { keys } from './keyboard.js';

let flashlight;
let target;

let isOn = true;

let vrController = null;
let mainCamera = null;

// -----------------------------------
export function setupFlashlight(
    scene,
    camera,
    controller
) {

    mainCamera = camera;
    vrController = controller;

    // 🔦 SPOTLIGHT
    flashlight = new THREE.SpotLight(
        0xffffff,
        120, // 🔥 BRILLO
        1200,
        Math.PI / 8,
        0.4,
        1
    );

    flashlight.castShadow = true;

    // 🔥 sombras más fuertes
    flashlight.shadow.mapSize.width = 2048;
    flashlight.shadow.mapSize.height = 2048;

    flashlight.shadow.bias = -0.0001;

    // TARGET
    target = new THREE.Object3D();

    scene.add(target);

    flashlight.target = target;

    scene.add(flashlight);

    console.log('🔦 Linterna lista');
}

// -----------------------------------
export function updateFlashlight(
    renderer
) {

    if (!flashlight || !mainCamera)
        return;

    // -----------------------------------
    // 🥽 VR
    // -----------------------------------

    if (
        renderer.xr.isPresenting &&
        vrController
    ) {

        // posición control VR
        flashlight.position.setFromMatrixPosition(
            vrController.matrixWorld
        );

        // dirección control
        const direction =
            new THREE.Vector3(0, 0, -1);

        direction.applyQuaternion(
            vrController.quaternion
        );

        target.position.copy(
            flashlight.position.clone()
                .add(direction.multiplyScalar(100))
        );
    }

    // -----------------------------------
    // 🖱️ MODO NORMAL
    // -----------------------------------

    else {

        // pegar a cámara
        flashlight.position.copy(
            mainCamera.position
        );

        // dirección cámara
        const direction =
            new THREE.Vector3();

        mainCamera.getWorldDirection(
            direction
        );

        target.position.copy(
            mainCamera.position.clone()
                .add(direction.multiplyScalar(100))
        );
    }

    // actualizar target
    flashlight.target.updateMatrixWorld();

    // -----------------------------------
    // 🔥 TOGGLE
    // -----------------------------------

    if (keys.f) {

        isOn = !isOn;

        flashlight.visible = isOn;

        console.log(
            '🔦 Linterna:',
            isOn ? 'ON' : 'OFF'
        );

        keys.f = false;
    }
}

// -----------------------------------
export function isFlashlightOn() {

    return isOn;
}

export function getFlashlightDirection() {

    if (!mainCamera)
        return null;

    const direction =
        new THREE.Vector3();

    mainCamera.getWorldDirection(
        direction
    );

    return direction;
}

// -----------------------------------
export function getFlashlightPosition() {

    if (!flashlight)
        return null;

    return flashlight.position.clone();
}