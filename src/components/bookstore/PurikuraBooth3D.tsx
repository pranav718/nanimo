import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface PurikuraBoothResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createPurikuraBooth3D(pos: [number, number, number]): PurikuraBoothResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const boothMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.3,
        metalness: 0.2,
    });

    const curtainMat = new THREE.MeshStandardMaterial({
        color: 0xdb2777,
        roughness: 0.8,
    });

    const neonMat = new THREE.MeshStandardMaterial({
        color: 0xfbcfe8,
        emissive: 0xf472b6,
        emissiveIntensity: 1.2,
    });

    const bodyGeo = new THREE.BoxGeometry(2.0, 2.6, 2.0);
    const body = new THREE.Mesh(bodyGeo, boothMat);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    const curtainGeo = new THREE.BoxGeometry(0.9, 2.0, 0.08);
    const curtain = new THREE.Mesh(curtainGeo, curtainMat);
    curtain.position.set(0, 1.0, 1.02);
    group.add(curtain);

    const marqueeGeo = new THREE.BoxGeometry(1.6, 0.4, 0.2);
    const marquee = new THREE.Mesh(marqueeGeo, neonMat);
    marquee.position.set(0, 2.5, 1.05);
    group.add(marquee);

    const boothLight = new THREE.PointLight(0xf472b6, 1.8, 6);
    boothLight.position.set(0, 2.2, 0.8);
    group.add(boothLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        boothLight.intensity = 1.6 + Math.sin(time * 4) * 0.3;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.1, 0, pos[2] - 1.1),
            new THREE.Vector3(pos[0] + 1.1, 2.6, pos[2] + 1.1)
        ),
        center: new THREE.Vector3(pos[0], 1.3, pos[2]),
        size: new THREE.Vector3(2.2, 2.6, 2.2),
    };

    return { group, obstacle, update };
}
