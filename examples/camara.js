import * as THREE from 'three';
import { getCharacter } from './player.js';

export function updateCamera(camera) {

    const character = getCharacter();
    if (!character) return;

    const offset = new THREE.Vector3(
        0,
        80,
        -150
    );

    offset.applyQuaternion(character.quaternion);

    camera.position.copy(
        character.position.clone().add(offset)
    );

    camera.lookAt(
        character.position.x,
        character.position.y + 40,
        character.position.z
    );
}