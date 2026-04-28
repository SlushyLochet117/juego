import * as THREE from 'three';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { keys } from './keyboard.js';
import { checkCollision } from './collision.js';

let character;
let mixer;

// acciones
let idleAction;
let walkAction;
let runAction;
let pickAction;
let activeAction;

// velocidades
const moveSpeed = 1.0;
const runSpeed = 2.0;
const rotateSpeed = 0.05;

export function loadCharacter(scene) {

    const loader = new FBXLoader();

    loader.load(
        'examples/models/personaje/idle.fbx',

        function (fbx) {

            character = fbx;

            character.scale.set(
                0.2,
                0.2,
                0.2
            );

            character.position.set(
                0,
                0,
                5
            );

            character.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
 scene.add(character);

            // mixer principal
            mixer = new THREE.AnimationMixer(character);

            // IDLE
            if (fbx.animations.length > 0) {
                idleAction = mixer.clipAction(
                    fbx.animations[0]
                );

                idleAction.play();
                activeAction = idleAction;
            }

            // -----------------------------------
            // CARGAR WALK
            // -----------------------------------

            loader.load(
                'examples/models/personaje/Injured Walking.fbx',

                function (walkAnim) {

                    walkAction = mixer.clipAction(
                        walkAnim.animations[0]
                    );

                    // -----------------------------------
                    // CARGAR RUN
                    // -----------------------------------

                    loader.load(
                        'examples/models/personaje/Slow Run.fbx',

                        function (runAnim) {

                            runAction = mixer.clipAction(
                                runAnim.animations[0]
                            );

                            // -----------------------------------
                            // CARGAR PICK ACTION
                            // -----------------------------------

                            loader.load(
                                'examples/models/personaje/Picking Up.fbx',

                                function (pickAnim) {

                                    pickAction = mixer.clipAction(
                                        pickAnim.animations[0]
                                    );

                                    console.log(
                                        "Todas las animaciones cargadas correctamente"
                                    );
                                }
                            );
                        }
                    );
                }
            );

            console.log("Personaje cargado");
        },

        undefined,

        function (error) {
            console.error(
                "Error cargando personaje:",
                error
            );
        }
    );
}

// --------------------------------------------------
// CAMBIAR ANIMACIÓN SUAVEMENTE
// --------------------------------------------------

function switchAnimation(newAction) {

    if (!newAction) return;
    if (activeAction === newAction) return;

    activeAction.fadeOut(0.3);

    newAction
        .reset()
        .fadeIn(0.3)
        .play();

    activeAction = newAction;
}

// --------------------------------------------------
// ACTUALIZAR PERSONAJE
// --------------------------------------------------

export function updateCharacter(delta) {

    if (!character) return;

    const previousPosition = character.position.clone();

    // actualizar mixer
    if (mixer) {
        mixer.update(delta);
    }

    let moving = false;
    let speed = keys.shift
        ? runSpeed
        : moveSpeed;

    // -----------------------------------
    // MOVIMIENTO
    // -----------------------------------

    // avanzar
    if (keys.w) {
        character.translateZ(
            speed * delta * 50
        );
        moving = true;
    }

    // retroceder
    if (keys.s) {
        character.translateZ(
            -speed * delta * 50
        );
        moving = true;
    }

    // girar izquierda
    if (keys.a) {
        character.rotation.y += rotateSpeed;
    }

    // girar derecha
    if (keys.d) {
        character.rotation.y -= rotateSpeed;
    }
    if (checkCollision(character)) {
    character.position.copy(previousPosition);
}

    // -----------------------------------
    // CAMBIO DE ANIMACIÓN
    // -----------------------------------

    // acción especial con E
    if (keys.e && pickAction) {

        switchAnimation(pickAction);
        return;
    }

    // correr
    if (moving && keys.shift && runAction) {

        switchAnimation(runAction);
        return;
    }

    // caminar
    if (moving && walkAction) {

        switchAnimation(walkAction);
        return;
    }

    // idle
    if (idleAction) {

        switchAnimation(idleAction);
    }
}

// --------------------------------------------------
// OBTENER PERSONAJE (para cámara)
// --------------------------------------------------

export function getCharacter() {
    return character;
}