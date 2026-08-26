import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface VendingMachine3DResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createAnimeVendingMachine3D(pos: [number, number, number]): VendingMachine3DResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        metalness: 0.5,
        roughness: 0.4,
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
    });

    const lightMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.7,
        roughness: 0.2,
    });

    const bodyGeo = new THREE.BoxGeometry(1.2, 2.2, 0.9);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    group.add(body);

    const displayWindow = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.1), glassMat);
    displayWindow.position.set(0, 1.4, 0.46);
    group.add(displayWindow);

    const innerLight = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.05), lightMat);
    innerLight.position.set(0, 1.4, 0.43);
    group.add(innerLight);

    const slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.25, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    slot.position.set(0, 0.35, 0.46);
    group.add(slot);

    const vendLight = new THREE.PointLight(0x38bdf8, 1.6, 5);
    vendLight.position.set(0, 1.5, 0.8);
    group.add(vendLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        vendLight.intensity = 1.5 + Math.sin(time * 3) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.8, 0, pos[2] - 0.6),
            new THREE.Vector3(pos[0] + 0.8, 2.4, pos[2] + 0.6)
        ),
        center: new THREE.Vector3(pos[0], 1.2, pos[2]),
        size: new THREE.Vector3(1.6, 2.4, 1.2),
    };

    return { group, obstacle, update };
}
