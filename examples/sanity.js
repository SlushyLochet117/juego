import * as THREE from 'three';

let sanity = 100;

let overlay;
let noise;

let heartbeatAudio;
let whisperAudio;

let insanityCooldown = false;

// -----------------------------------
export function setupSanity(camera) {

    // -----------------------------------
    // 🩸 OVERLAY OSCURO
    // -----------------------------------

    overlay =
        document.createElement('div');

    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;

    overlay.style.width = '100%';
    overlay.style.height = '100%';

    overlay.style.pointerEvents = 'none';

    overlay.style.background =
        'rgba(0,0,0,0)';

    overlay.style.transition =
        'background 0.2s';

    overlay.style.zIndex = 8000;

    document.body.appendChild(
        overlay
    );

    // -----------------------------------
    // 📺 NOISE
    // -----------------------------------

    noise =
        document.createElement('div');

    noise.style.position = 'fixed';

    noise.style.top = 0;
    noise.style.left = 0;

    noise.style.width = '100%';
    noise.style.height = '100%';

    noise.style.pointerEvents = 'none';

    noise.style.opacity = 0;

    noise.style.backgroundImage =
        'url(https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGxzNzd5aDI0eWE5NDY1MmZmMXh2dW9kejZ3cTF1Z3ZzOGF4bHd3NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y8a0CT2xsbo9G/giphy.gif)';

    noise.style.mixBlendMode =
        'screen';

    noise.style.zIndex = 8500;

    document.body.appendChild(
        noise
    );

    // -----------------------------------
    // 🔊 AUDIO
    // -----------------------------------

    const listener =
        new THREE.AudioListener();

    camera.add(listener);

    const loader =
        new THREE.AudioLoader();

    heartbeatAudio =
        new THREE.Audio(listener);

    whisperAudio =
        new THREE.Audio(listener);

    loader.load(
        './examples/sounds/heartbeat.mp3',

        (buffer) => {

            heartbeatAudio.setBuffer(
                buffer
            );

            heartbeatAudio.setLoop(true);

            heartbeatAudio.setVolume(0.5);
        }
    );

    loader.load(
        './examples/sounds/teveo.mp3',

        (buffer) => {

            whisperAudio.setBuffer(
                buffer
            );

            whisperAudio.setLoop(true);

            whisperAudio.setVolume(0.4);
        }
    );

    console.log('🫀 Sistema cordura listo');
}

// -----------------------------------
export function updateSanity(
    delta,
    character,
    monster,
    flashlightOn
) {

    if (!character) return;

    // -----------------------------------
    // 🌑 OSCURIDAD
    // -----------------------------------

    if (!flashlightOn) {

        sanity -=
            4 * delta;

    } else {

        sanity +=
            2 * delta;
    }

    // -----------------------------------
    // 👹 CERCA MONSTRUO
    // -----------------------------------

    if (monster) {

        const dist =
            character.position.distanceTo(
                monster.position
            );

        if (dist < 400) {

            sanity -=
                8 * delta;
        }

        if (dist < 200) {

            sanity -=
                15 * delta;
        }
    }

    // límites
    sanity =
        THREE.MathUtils.clamp(
            sanity,
            0,
            100
        );

    // -----------------------------------
    // 🩸 OVERLAY
    // -----------------------------------

    const darkness =
        (100 - sanity) / 100;

    overlay.style.background =
        `rgba(0,0,0,${
            darkness * 0.7
        })`;

    // -----------------------------------
    // 📺 NOISE
    // -----------------------------------

    noise.style.opacity =
        darkness * 0.35;

    // -----------------------------------
    // ❤️ HEARTBEAT
    // -----------------------------------

    if (sanity < 60) {

        if (
            heartbeatAudio &&
            !heartbeatAudio.isPlaying
        ) {

            heartbeatAudio.play();
        }

    } else {

        if (
            heartbeatAudio &&
            heartbeatAudio.isPlaying
        ) {

            heartbeatAudio.stop();
        }
    }

    // -----------------------------------
    // 👂 SUSURROS
    // -----------------------------------

    if (sanity < 35) {

        if (
            whisperAudio &&
            !whisperAudio.isPlaying
        ) {

            whisperAudio.play();
        }

    } else {

        if (
            whisperAudio &&
            whisperAudio.isPlaying
        ) {

            whisperAudio.stop();
        }
    }

    // -----------------------------------
    // 💀 EVENTOS LOCURA
    // -----------------------------------

    if (
        sanity < 20 &&
        !insanityCooldown
    ) {

        insanityCooldown = true;

        fakeJumpscare();

        setTimeout(() => {

            insanityCooldown = false;

        }, 12000);
    }

    // -----------------------------------
    // ☠️ GAME OVER
    // -----------------------------------

    if (sanity <= 0) {

        triggerInsanityDeath();
    }
}

// -----------------------------------
function fakeJumpscare() {

    const img =
        document.createElement('img');

    img.src =
        './examples/textures/scream.jpg';

    img.style.position = 'fixed';

    img.style.top = '50%';

    img.style.left = '50%';

    img.style.transform =
        'translate(-50%, -50%)';

    img.style.width = '400px';

    img.style.zIndex = 99999;

    document.body.appendChild(img);

    const audio =
        new Audio(
            './examples/sounds/scream1.mp3'
        );

    audio.volume = 0.7;

    audio.play();

    setTimeout(() => {

        img.remove();

    }, 300);
}

// -----------------------------------
function triggerInsanityDeath() {

    const text =
        document.createElement('h1');

    text.innerText =
        'YOU LOST YOUR MIND';

    text.style.position =
        'fixed';

    text.style.top = '50%';

    text.style.left = '50%';

    text.style.transform =
        'translate(-50%, -50%)';

    text.style.color = 'white';

    text.style.fontSize = '80px';

    text.style.fontFamily =
        'Arial';

    text.style.zIndex = 99999;

    text.style.textShadow =
        '0 0 20px red';

    document.body.appendChild(text);

    setTimeout(() => {

        location.reload();

    }, 5000);
}

// -----------------------------------
export function getSanity() {

    return sanity;
}