// collision.js

import * as THREE from 'three';

// aquí guardamos todas las cajas de colisión
const collisionBoxes = [];

// --------------------------------------------------
// CREAR COLISIONES INVISIBLES
// --------------------------------------------------

export function setupCollisions(scene) {

    // helper visual temporal (true = mostrar cajas)
    const showHelpers = true;

    // --------------------------------------------------
    // EJEMPLO 1 → MESA CENTRAL
    // --------------------------------------------------

    /*createCollisionBox(
        scene,
        new THREE.Vector3(0, 0, 0),      // posición
        new THREE.Vector3(60, 40, 60),   // tamaño
        showHelpers
    );
*/
    // --------------------------------------------------
    // EJEMPLO 2 → CAMA
    // --------------------------------------------------

    createCollisionBox(
        scene,
        new THREE.Vector3(120, 0, -80),
        new THREE.Vector3(80, 40, 120),
        showHelpers
    );

    // --------------------------------------------------
    // EJEMPLO 3 → PUERTA 1
    // --------------------------------------------------

    createCollisionBox(
        scene,
        new THREE.Vector3(-150, 0, 50),
        new THREE.Vector3(40, 80, 10),
        showHelpers
    );

    // --------------------------------------------------
    // EJEMPLO 4 → PUERTA 2
    // --------------------------------------------------

    createCollisionBox(
        scene,
        new THREE.Vector3(180, 0, 120),
        new THREE.Vector3(40, 80, 10),
        showHelpers
    );

    // --------------------------------------------------
    // EJEMPLO 5 → SOFÁ / MUEBLE GRANDE
    // --------------------------------------------------

    createCollisionBox(
        scene,
        new THREE.Vector3(-80, 0, -150),
        new THREE.Vector3(100, 50, 50),
        showHelpers
    );

    console.log("Colisiones cargadas correctamente");
}

// --------------------------------------------------
// CREAR CAJA DE COLISIÓN
// --------------------------------------------------

function createCollisionBox(scene, position, size, showHelper) {

    // caja matemática para colisión
    const box = new THREE.Box3().setFromCenterAndSize(
        position,
        size
    );

    collisionBoxes.push(box);

    // helper visual (solo para pruebas)
    if (showHelper) {

        const helperGeometry = new THREE.BoxGeometry(
            size.x,
            size.y,
            size.z
        );

        const helperMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        });

        const helperMesh = new THREE.Mesh(
            helperGeometry,
            helperMaterial
        );

        helperMesh.position.copy(position);
        helperMesh.position.y += size.y / 2;

        scene.add(helperMesh);
    }
}

// --------------------------------------------------
// VERIFICAR COLISIÓN DEL PERSONAJE
// --------------------------------------------------

export function checkCollision(character) {

    if (!character) return false;

    // caja del personaje
    const playerBox = new THREE.Box3().setFromObject(character);

    // revisar contra todas las cajas
    for (let i = 0; i < collisionBoxes.length; i++) {

        if (playerBox.intersectsBox(collisionBoxes[i])) {
            return true;
        }
    }

    return false;
}