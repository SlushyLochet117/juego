import * as THREE from 'three';

let horrorEvents = [];

// 🔦 acceso a linterna (opcional)
let flashlightRef = null;
export function setFlashlight(ref) {
    flashlightRef = ref;
}

export function setupHorror(scene) {

    const listener = new THREE.AudioListener();
    scene.add(listener);

    const audioLoader = new THREE.AudioLoader();

    const whisper = new THREE.Audio(listener);

    audioLoader.load('./examples/sounds/whisper.mp3', (buffer) => {
        whisper.setBuffer(buffer);
        whisper.setVolume(0.5);
    });

    horrorEvents.push({
        position: new THREE.Vector3(-150, 0, -600),
        radius: 120,
        triggered: false,
        sound: whisper
    });

    console.log("👻 Eventos de terror listos");
}

// -----------------------------------
export function updateHorror(character, scene) {

    if (!character) return;

    horrorEvents.forEach(e => {

        const dist = character.position.distanceTo(e.position);

        if (dist < e.radius && !e.triggered) {

            e.triggered = true;

            console.log("💀 EVENTO ACTIVADO");

            // 🔊 SONIDO
            if (e.sound && !e.sound.isPlaying) {
                e.sound.play();
            }

            // 👻 SOMBRA
            spawnShadow(scene, character);

            // 🚪 CERRAR PUERTAS
            closeDoors(scene);

            // 🔦 PARPADEO LINTERNA
            flickerFlashlight();
        }
    });
}

//
// 👻 SOMBRA DETRÁS DEL JUGADOR
//
function spawnShadow(scene, character) {

    const geometry = new THREE.BoxGeometry(20, 60, 20);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000
    });

    const shadow = new THREE.Mesh(geometry, material);

    // 📍 detrás del jugador
    const direction = new THREE.Vector3(0, 0, 1)
        .applyQuaternion(character.quaternion);

    shadow.position.copy(
        character.position.clone().add(direction.multiplyScalar(60))
    );

    scene.add(shadow);

    console.log("👻 SOMBRA APARECE");

    // desaparecer
    setTimeout(() => {
        scene.remove(shadow);
        console.log("👻 SOMBRA DESAPARECE");
    }, 1500);
}

