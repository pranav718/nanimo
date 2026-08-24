import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface VinylDJResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createVinylDJBooth(pos: [number, number, number]): VinylDJResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.8,
        roughness: 0.2,
    });

    const vinylMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        metalness: 0.9,
        roughness: 0.1,
    });

    const deskGeo = new THREE.BoxGeometry(2.2, 0.9, 1.1);
    const deskMesh = new THREE.Mesh(deskGeo, metalMat);
    deskMesh.position.y = 0.45;
    deskMesh.castShadow = true;
    group.add(deskMesh);

    const platterGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
    const deck1 = new THREE.Mesh(platterGeo, vinylMat);
    deck1.position.set(-0.6, 0.92, 0);
    group.add(deck1);

    const deck2 = new THREE.Mesh(platterGeo, vinylMat);
    deck2.position.set(0.6, 0.92, 0);
    group.add(deck2);

    const mixerGeo = new THREE.BoxGeometry(0.45, 0.05, 0.6);
    const mixerMesh = new THREE.Mesh(
        mixerGeo,
        new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4 })
    );
    mixerMesh.position.set(0, 0.93, 0);
    group.add(mixerMesh);

    const djLight = new THREE.PointLight(0xa855f7, 1.6, 6);
    djLight.position.set(0, 1.4, 0);
    group.add(djLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        deck1.rotation.y += delta * 3;
        deck2.rotation.y += delta * 3;
        djLight.intensity = 1.4 + Math.sin(time * 6) * 0.25;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.3, 0, pos[2] - 0.7),
            new THREE.Vector3(pos[0] + 1.3, 2.0, pos[2] + 0.7)
        ),
        center: new THREE.Vector3(pos[0], 1.0, pos[2]),
        size: new THREE.Vector3(2.6, 2.0, 1.4),
    };

    return { group, obstacle, update };
}
