import * as THREE from 'three';
import { getCharacter } from './player.js';

export function updateCamera(camera) {

    const character = getCharacter();

    if (!character) return;

    // posición cabeza
    const offset = new THREE.Vector3(0, 60, 0);

    camera.position.copy(character.position.clone().add(offset));

    camera.rotation.y = character.rotation.y;
}