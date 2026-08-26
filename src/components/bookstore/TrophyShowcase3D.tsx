import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface TrophyCaseResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createTrophyShowcase(pos: [number, number, number]): TrophyCaseResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.85,
        roughness: 0.2,
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.4,
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.1,
    });

    const frameGeo = new THREE.BoxGeometry(1.6, 2.4, 0.8);
    const frame = new THREE.Mesh(frameGeo, glassMat);
    frame.position.y = 1.2;
    group.add(frame);

    const baseGeo = new THREE.BoxGeometry(1.7, 0.25, 0.9);
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = 0.125;
    base.castShadow = true;
    group.add(base);

    const topCap = new THREE.Mesh(baseGeo, metalMat);
    topCap.position.y = 2.35;
    group.add(topCap);

    [0.7, 1.3, 1.9].forEach((shelfY, idx) => {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.7), glassMat);
        shelf.position.y = shelfY;
        group.add(shelf);

        const trophy = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.25, 8),
            goldMat
        );
        trophy.position.set(idx === 1 ? 0 : idx === 0 ? -0.4 : 0.4, shelfY + 0.14, 0);
        trophy.castShadow = true;
        group.add(trophy);
    });

    const caseLight = new THREE.PointLight(0xf59e0b, 1.8, 5);
    caseLight.position.set(0, 2.2, 0);
    group.add(caseLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        caseLight.intensity = 1.6 + Math.sin(time * 3) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.0, 0, pos[2] - 0.6),
            new THREE.Vector3(pos[0] + 1.0, 2.6, pos[2] + 0.6)
        ),
        center: new THREE.Vector3(pos[0], 1.3, pos[2]),
        size: new THREE.Vector3(2.0, 2.6, 1.2),
    };

    return { group, obstacle, update };
}
