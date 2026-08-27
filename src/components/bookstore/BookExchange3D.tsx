import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface BookExchangeResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createBookExchange3D(pos: [number, number, number]): BookExchangeResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x5c3a21,
        roughness: 0.8,
    });

    const boardMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.9,
    });

    const slipMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.6,
    });

    const cabinetGeo = new THREE.BoxGeometry(1.4, 1.2, 0.8);
    const cabinet = new THREE.Mesh(cabinetGeo, woodMat);
    cabinet.position.y = 0.6;
    cabinet.castShadow = true;
    group.add(cabinet);

    const boardGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 1.6, 0.35);
    group.add(board);

    [-0.3, 0.2, -0.1].forEach((x, idx) => {
        const slipGeo = new THREE.PlaneGeometry(0.25, 0.25);
        const slip = new THREE.Mesh(slipGeo, slipMat);
        slip.position.set(x, 1.6 + (idx % 2 === 0 ? 0.1 : -0.1), 0.38);
        group.add(slip);
    });

    const lampLight = new THREE.PointLight(0xfbbf24, 1.4, 4);
    lampLight.position.set(0, 2.0, 0.5);
    group.add(lampLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        lampLight.intensity = 1.3 + Math.sin(time * 3) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.8, 0, pos[2] - 0.5),
            new THREE.Vector3(pos[0] + 0.8, 2.1, pos[2] + 0.5)
        ),
        center: new THREE.Vector3(pos[0], 1.05, pos[2]),
        size: new THREE.Vector3(1.6, 2.1, 1.0),
    };

    return { group, obstacle, update };
}
