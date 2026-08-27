import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface YukataWardrobeResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createYukataWardrobe3D(pos: [number, number, number]): YukataWardrobeResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x3e2723,
        roughness: 0.7,
    });

    const mirrorMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.1,
    });

    const yukataMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.8,
    });

    const frameGeo = new THREE.BoxGeometry(0.8, 1.8, 0.08);
    const frame = new THREE.Mesh(frameGeo, woodMat);
    frame.position.set(-0.4, 0.95, 0);
    group.add(frame);

    const glassGeo = new THREE.PlaneGeometry(0.65, 1.6);
    const glass = new THREE.Mesh(glassGeo, mirrorMat);
    glass.position.set(-0.4, 0.95, 0.045);
    group.add(glass);

    const rackGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
    const rackBar = new THREE.Mesh(rackGeo, woodMat);
    rackBar.rotation.z = Math.PI / 2;
    rackBar.position.set(0.4, 1.6, 0);
    group.add(rackBar);

    const robeGeo = new THREE.BoxGeometry(0.6, 1.2, 0.1);
    const robe = new THREE.Mesh(robeGeo, yukataMat);
    robe.position.set(0.4, 1.0, 0);
    robe.castShadow = true;
    group.add(robe);

    const softLight = new THREE.PointLight(0xf43f5e, 1.2, 4);
    softLight.position.set(0, 1.5, 0.5);
    group.add(softLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        softLight.intensity = 1.2 + Math.sin(time * 2) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.9, 0, pos[2] - 0.5),
            new THREE.Vector3(pos[0] + 0.9, 1.9, pos[2] + 0.5)
        ),
        center: new THREE.Vector3(pos[0], 0.95, pos[2]),
        size: new THREE.Vector3(1.8, 1.9, 1.0),
    };

    return { group, obstacle, update };
}
