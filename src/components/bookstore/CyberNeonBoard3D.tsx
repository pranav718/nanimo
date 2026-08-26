import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface NeonBoard3DResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createCyberNeonBoard3D(pos: [number, number, number]): NeonBoard3DResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const frameMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        metalness: 0.9,
        roughness: 0.2,
    });

    const neonMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.2,
        roughness: 0.1,
    });

    const boardGeo = new THREE.BoxGeometry(4.2, 1.2, 0.15);
    const board = new THREE.Mesh(boardGeo, frameMat);
    group.add(board);

    const tubeGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.8, 12);
    const tubeTop = new THREE.Mesh(tubeGeo, neonMat);
    tubeTop.rotation.z = Math.PI / 2;
    tubeTop.position.set(0, 0.4, 0.1);
    group.add(tubeTop);

    const tubeBottom = new THREE.Mesh(tubeGeo, neonMat);
    tubeBottom.rotation.z = Math.PI / 2;
    tubeBottom.position.set(0, -0.4, 0.1);
    group.add(tubeBottom);

    const neonLight = new THREE.PointLight(0x06b6d4, 2.0, 7);
    neonLight.position.set(0, 0, 0.6);
    group.add(neonLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        neonLight.intensity = 1.8 + Math.sin(time * 5) * 0.4;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 2.2, pos[1] - 0.7, pos[2] - 0.5),
            new THREE.Vector3(pos[0] + 2.2, pos[1] + 0.7, pos[2] + 0.5)
        ),
        center: new THREE.Vector3(pos[0], pos[1], pos[2]),
        size: new THREE.Vector3(4.4, 1.4, 1.0),
    };

    return { group, obstacle, update };
}
