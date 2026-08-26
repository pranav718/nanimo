import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface KaraokeStageResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createAnimeKaraoke3D(pos: [number, number, number]): KaraokeStageResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const stageMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.3,
        metalness: 0.8,
    });

    const neonMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xec4899,
        emissiveIntensity: 0.9,
    });

    const micMat = new THREE.MeshStandardMaterial({
        color: 0xd4d4d8,
        metalness: 0.9,
        roughness: 0.2,
    });

    const stageGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.25, 24);
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = 0.125;
    stage.castShadow = true;
    group.add(stage);

    const rimGeo = new THREE.TorusGeometry(1.25, 0.04, 8, 24);
    const rim = new THREE.Mesh(rimGeo, neonMat);
    rim.position.y = 0.25;
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    const standGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const micHeadGeo = new THREE.SphereGeometry(0.06, 8, 8);

    [-0.35, 0.35].forEach((xOffset) => {
        const stand = new THREE.Mesh(standGeo, micMat);
        stand.position.set(xOffset, 0.85, 0);
        group.add(stand);

        const head = new THREE.Mesh(micHeadGeo, micMat);
        head.position.set(xOffset, 1.45, 0);
        group.add(head);
    });

    const stageLight = new THREE.PointLight(0xec4899, 1.8, 5);
    stageLight.position.set(0, 1.6, 0);
    group.add(stageLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        stageLight.intensity = 1.6 + Math.sin(time * 4) * 0.3;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.2, 0, pos[2] - 1.2),
            new THREE.Vector3(pos[0] + 1.2, 1.8, pos[2] + 1.2)
        ),
        center: new THREE.Vector3(pos[0], 0.9, pos[2]),
        size: new THREE.Vector3(2.4, 1.8, 2.4),
    };

    return { group, obstacle, update };
}
