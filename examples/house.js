import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

export function loadHouse(scene) {

    const loader = new GLTFLoader();

    loader.load('examples/models/casa/mansionInterior.glb', function (gltf) {

        const house = gltf.scene;

        house.scale.set(25, 25, 25);
        house.position.set(0, 0, 0);

        house.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(house);
                console.log('Casa cargada');
    });
}