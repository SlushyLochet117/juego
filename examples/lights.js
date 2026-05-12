import * as THREE from 'three';

export function setupLights(scene) {

    // -----------------------------------
    // 🌑 LUZ AMBIENTAL (casi negra)
    // -----------------------------------
    const ambientLight = new THREE.AmbientLight(
         0xffffff,
         0.08 // 🔥 súper bajo
    );
    scene.add(ambientLight);

    // -----------------------------------
    // 🌫 LUZ HEMISFERICA (mínima)
    // -----------------------------------
    const hemiLight = new THREE.HemisphereLight(
        0x222244,
        0x000000,
        0.1 // 🔥 casi nada
    );
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    // -----------------------------------
    // 🌙 LUZ LUNA (direccional tenue)
    // -----------------------------------
    const moonLight = new THREE.DirectionalLight(
        0x8899ff,
        0.6
    );

    moonLight.position.set(100, 300, 100);
    moonLight.castShadow = true;

    // sombras más suaves
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;

    scene.add(moonLight);

    // -----------------------------------
    // 💡 LUZ LOCAL MUY SUAVE (opcional)
    // evita negro total en interiores
    // -----------------------------------
    const dimLight = new THREE.PointLight(
        0x6666aa,
        0.2,
        400
    );

    dimLight.position.set(0, 150, 0);
    scene.add(dimLight);

    console.log("🌑 Luces modo terror PRO activadas");
}