import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadHouse(scene, onLoad) {

    const loader = new GLTFLoader();

    loader.load('./examples/models/casa/mansionInterior.glb', (gltf) => {

        const house = gltf.scene;

        house.scale.set(25, 25, 25);
        house.position.set(235, 0, 15);
        house.name = "CASA";

        scene.add(house);

        if (onLoad) onLoad(house);

        // -----------------------------------
        // OBJETOS
        // -----------------------------------

        // 🪑 MESA
        loadItem(scene,
            './examples/models/objetos/mesa_de_centro.glb',
            new THREE.Vector3(-45, 0, -430),
            0.3,
            "MESA"
        );

        // 🃏 CARTA
        loadItem(scene,
            './examples/models/objetos/carta_fbx.glb',
            new THREE.Vector3(-177.5, -35, -616.6),
            0.8,
            "CARTA"
        );

        // 🔑 LLAVE
        loadItem(scene,
            './examples/models/objetos/llave_antigua__ancient_key.glb',
            new THREE.Vector3(26, 0, -573),
            3,
            "LLAVE"            
        );

        // 📚 LIBRERO
        loadItem(scene,
            './examples/models/objetos/old_bookcase__miscellaneous.glb',
            new THREE.Vector3(-49, 0, -423),
            5,
            "LIBRERO",
            Math.PI
        );

        // 🚪 PUERTA 1
        loadItem(scene,
            './examples/models/objetos/puerta.glb',
            new THREE.Vector3(10, 0, -520),
            0.25,
            "PUERTA",
            Math.PI / 2
        );

        // 🚪 PUERTA 2 (ejemplo)
        loadItem(scene,
            './examples/models/objetos/puerta.glb',
            new THREE.Vector3(-230, 0, -345),
            0.25,
            "PUERTA",
                        Math.PI / 2
            
        );

        console.log("Casa y objetos cargados 🔥");

    }, undefined, (error) => {
        console.error("Error cargando casa:", error);
    });
}

// -----------------------------------
// FUNCION GENERAL PARA CARGAR OBJETOS
// -----------------------------------

function loadItem(scene, path, worldPosition, scale, name, rotY = 0) {

    const loader = new GLTFLoader();

    loader.load(path, (gltf) => {

        const obj = gltf.scene;

        obj.scale.set(scale, scale, scale);
        obj.rotation.y = rotY;

        // calcular tamaño
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);

        // -----------------------------------
        // 🚪 PUERTA CON BISAGRA REAL
        // -----------------------------------
        if (name === "PUERTA") {

            const pivot = new THREE.Group();

            pivot.position.set(
                worldPosition.x,
                worldPosition.y + (size.y / 2),
                worldPosition.z
            );

            obj.position.set(-size.x / 2, 0, 0);

            pivot.add(obj);

            pivot.name = "PUERTA";
            pivot.userData.open = false;
            pivot.userData.isDoor = true;

            scene.add(pivot);

        } else {

            // 📍 posición normal
            obj.position.set(
                worldPosition.x,
                worldPosition.y + (size.y / 2),
                worldPosition.z
            );

            obj.name = name;

            // -----------------------------------
            // 🔥 LLAVE BRILLANTE
            // -----------------------------------
            if (name === "LLAVE") {

                // 💡 luz tipo glow
                const light = new THREE.PointLight(0xffd700, 2, 120);
                light.position.set(0, size.y / 2, 0);
                obj.add(light);

                // ✨ material emissive (brillo propio)
                obj.traverse(child => {
                    if (child.isMesh) {

                        child.material.emissive = new THREE.Color(0xffd700);
                        child.material.emissiveIntensity = 1.5;

                    }
                });

                console.log("✨ Llave brillante activada");
            }

            scene.add(obj);
        }

    }, undefined, () => {
        console.error("Error cargando:", path);
    });
}