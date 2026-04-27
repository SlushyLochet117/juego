// lights.js

import * as THREE from 'three';

export function setupLights(scene) {

    // -----------------------------------
    // LUZ AMBIENTAL GENERAL
    // -----------------------------------

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.2
    );

    scene.add(ambientLight);

    // -----------------------------------
    // LUZ HEMISFERICA (tipo ambiente)
    // -----------------------------------

    const hemiLight = new THREE.HemisphereLight(
        0xffffff, // cielo
        0x444444, // suelo
        2
    );

    hemiLight.position.set(
        0,
        200,
        0
    );

    scene.add(hemiLight);

    // -----------------------------------
    // LUZ PRINCIPAL (tipo luna)
    // -----------------------------------

    const moonLight = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    moonLight.position.set(
        100,
        300,
        100
    );

    moonLight.castShadow = true;

    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;

    moonLight.shadow.camera.top = 300;
    moonLight.shadow.camera.bottom = -300;
    moonLight.shadow.camera.left = -300;
    moonLight.shadow.camera.right = 300;

    scene.add(moonLight);

    // -----------------------------------
    // LUZ SUPERIOR (techo / mansión)
    // -----------------------------------

    const topLight = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    topLight.position.set(
        0,
        500,
        0
    );

    topLight.castShadow = true;

    scene.add(topLight);

    // -----------------------------------
    // LUZ DE RELLENO
    // -----------------------------------

    const fillLight = new THREE.DirectionalLight(
        0xffffff,
        1
    );

    fillLight.position.set(
        -100,
        100,
        -100
    );

    scene.add(fillLight);

    console.log("Luces cargadas correctamente");
}