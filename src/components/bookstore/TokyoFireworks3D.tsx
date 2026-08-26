import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface Fireworks3DResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createTokyoFireworks3D(pos: [number, number, number]): Fireworks3DResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.8,
        roughness: 0.25,
    });

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.8,
    });

    const standGeo = new THREE.BoxGeometry(1.6, 0.35, 1.2);
    const stand = new THREE.Mesh(standGeo, woodMat);
    stand.position.y = 0.175;
    stand.castShadow = true;
    group.add(stand);

    const tubeGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.9, 12);
    [-0.4, -0.13, 0.13, 0.4].forEach((xOffset, i) => {
        const tube = new THREE.Mesh(tubeGeo, brassMat);
        tube.position.set(xOffset, 0.7, 0);
        tube.rotation.x = -Math.PI / 16 + (i % 2 === 0 ? 0.05 : -0.05);
        tube.rotation.z = (i - 1.5) * 0.06;
        tube.castShadow = true;
        group.add(tube);
    });

    const sparkLight = new THREE.PointLight(0xf59e0b, 1.6, 6);
    sparkLight.position.set(0, 1.3, 0);
    group.add(sparkLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        sparkLight.intensity = 1.4 + Math.sin(time * 6) * 0.3;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.0, 0, pos[2] - 0.8),
            new THREE.Vector3(pos[0] + 1.0, 1.6, pos[2] + 0.8)
        ),
        center: new THREE.Vector3(pos[0], 0.8, pos[2]),
        size: new THREE.Vector3(2.0, 1.6, 1.6),
    };

    return { group, obstacle, update };
}
