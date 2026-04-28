import * as THREE from 'three';

import { setupLights } from './lights.js';
import { loadHouse } from './house.js';
import { loadCharacter, updateCharacter } from './player.js';
import { setupKeyboard } from './keyboard.js';
import { updateCamera } from './camara.js';
import { setupCollisions } from './collision.js';

export let scene, camera, renderer;

const clock = new THREE.Clock();

init();
animate();

function init() {

    // ESCENA
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x888888);
   // scene.fog = new THREE.Fog(0xcccccc, 30, 400);

    // CAMARA
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        3000
    );

    camera.position.set(0, 80, 150);

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    document.body.appendChild(
        renderer.domElement
    );

    // PISO
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(3000, 3000),
        new THREE.MeshStandardMaterial({
            color: 0x777777
        })
    );

    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // FUNCIONES
    setupLights(scene);
    loadHouse(scene);
    setupCollisions(scene);
    loadCharacter(scene);
    setupKeyboard();

    // RESPONSIVE
    window.addEventListener(
        'resize',
        onResize
    );
}

function onResize() {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    updateCharacter(delta);
    updateCamera(camera);

    renderer.render(scene, camera);
}