import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface FigureShowcaseResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createFigureShowcase3D(pos: [number, number, number]): FigureShowcaseResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        roughness: 0.3,
        metalness: 0.8,
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
    });

    const neonMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.0,
    });

    const baseGeo = new THREE.BoxGeometry(1.6, 0.6, 1.6);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    base.castShadow = true;
    group.add(base);

    const glassGeo = new THREE.BoxGeometry(1.5, 1.6, 1.5);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 1.4;
    group.add(glass);

    const capGeo = new THREE.BoxGeometry(1.6, 0.1, 1.6);
    const cap = new THREE.Mesh(capGeo, baseMat);
    cap.position.y = 2.25;
    group.add(cap);

    const platformGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24);
    const platform = new THREE.Mesh(platformGeo, neonMat);
    platform.position.y = 1.1;
    group.add(platform);

    const caseLight = new THREE.PointLight(0x38bdf8, 1.8, 5);
    caseLight.position.set(0, 2.0, 0);
    group.add(caseLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        platform.rotation.y += delta * 0.8;
        caseLight.intensity = 1.6 + Math.sin(time * 3) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.9, 0, pos[2] - 0.9),
            new THREE.Vector3(pos[0] + 0.9, 2.3, pos[2] + 0.9)
        ),
        center: new THREE.Vector3(pos[0], 1.15, pos[2]),
        size: new THREE.Vector3(1.8, 2.3, 1.8),
    };

    return { group, obstacle, update };
}
