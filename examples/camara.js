import * as THREE from 'three';
import { getCharacter } from './player.js';

export function updateCamera(camera) {
    const character = getCharacter();
    if (!character) return;

    // Situamos la cámara detrás del jugador
    const offset = new THREE.Vector3(0, 90, 180); 
    offset.applyQuaternion(character.quaternion);
    
    const desiredPosition = character.position.clone().add(offset);
    camera.position.lerp(desiredPosition, 0.1);
    
    camera.lookAt(character.position.x, character.position.y + 45, character.position.z);
}