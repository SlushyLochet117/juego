import * as THREE from 'three';

const collisionBoxes = [];

export function setupCollisions(scene, house) {
    const showHelpers = true;

    const houseBox = new THREE.Box3().setFromObject(house);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    houseBox.getSize(size);
    houseBox.getCenter(center);

    const height = size.y;

    // 🧱 PARED TRASERA
    createCollisionBox(
        scene,
        new THREE.Vector3(center.x, 0, center.z - size.z / 2),
        new THREE.Vector3(size.x, height, 10),
        showHelpers
    );

    // 🧱 IZQUIERDA
    createCollisionBox(
        scene,
        new THREE.Vector3(center.x - size.x / 2, 0, center.z),
        new THREE.Vector3(10, height, size.z),
        showHelpers
    );

    // 🧱 DERECHA (con puerta)
    const doorStartZ = 50;
    const wallDepth = (size.z / 2) + doorStartZ;

    createCollisionBox(
        scene,
        new THREE.Vector3(
            center.x + size.x / 2,
            0,
            center.z + size.z / 2 - wallDepth / 2
        ),
        new THREE.Vector3(
            10,
            height,
            wallDepth
        ),
        showHelpers
    );

    // 🧱 PARED INTERIOR
    const innerWallThickness = 10;
    const innerWallLength = 250;

    const innerOffsetX = size.x / 2 - 120;
    const innerOffsetZ = -50;

    createCollisionBox(
        scene,
        new THREE.Vector3(
            center.x + innerOffsetX,
            0,
            center.z + innerOffsetZ
        ),
        new THREE.Vector3(
            innerWallLength,
            height,
            innerWallThickness
        ),
        showHelpers
    );

    // 🧱 FRENTE
    createCollisionBox(
        scene,
        new THREE.Vector3(center.x, 0, center.z + size.z / 2),
        new THREE.Vector3(size.x, height, 10),
        showHelpers
    );
}

function createCollisionBox(scene, position, size, showHelper) {
    const box = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(position.x, position.y + size.y / 2, position.z),
        size
    );

    collisionBoxes.push(box);

    if (showHelper) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,      // 🔥 completamente invisible
                depthWrite: false
            })
        );

        mesh.position.set(position.x, position.y + size.y / 2, position.z);
        scene.add(mesh);
    }
}

export function checkCollision(character) {
    if (!character) return false;

    const playerBox = new THREE.Box3().setFromCenterAndSize(
        character.position.clone().add(new THREE.Vector3(0, 10, 0)),
        new THREE.Vector3(15, 30, 15)
    );

    return collisionBoxes.some(box => playerBox.intersectsBox(box));
}