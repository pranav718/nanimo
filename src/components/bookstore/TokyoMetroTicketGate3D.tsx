import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface MetroGateResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createTokyoMetroTicketGate(pos: [number, number, number]): MetroGateResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        metalness: 0.85,
        roughness: 0.3,
    });

    const sensorMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
        roughness: 0.2,
    });

    const barrierGeo = new THREE.BoxGeometry(0.3, 0.9, 1.6);
    const leftPillar = new THREE.Mesh(barrierGeo, metalMat);
    leftPillar.position.set(-0.5, 0.45, 0);
    leftPillar.castShadow = true;
    group.add(leftPillar);

    const rightPillar = new THREE.Mesh(barrierGeo, metalMat);
    rightPillar.position.set(0.5, 0.45, 0);
    rightPillar.castShadow = true;
    group.add(rightPillar);

    const sensorLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.25), sensorMat);
    sensorLeft.position.set(-0.5, 0.92, 0.3);
    group.add(sensorLeft);

    const sensorRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.25), sensorMat);
    sensorRight.position.set(0.5, 0.92, 0.3);
    group.add(sensorRight);

    const flapGeo = new THREE.BoxGeometry(0.65, 0.3, 0.04);
    const flapMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        transparent: true,
        opacity: 0.7,
        roughness: 0.3,
    });
    const flap = new THREE.Mesh(flapGeo, flapMat);
    flap.position.set(0, 0.5, 0);
    group.add(flap);

    const gateLight = new THREE.PointLight(0x10b981, 1.4, 4);
    gateLight.position.set(0, 1.2, 0);
    group.add(gateLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        gateLight.intensity = 1.3 + Math.sin(time * 3) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.8, 0, pos[2] - 1.0),
            new THREE.Vector3(pos[0] + 0.8, 1.6, pos[2] + 1.0)
        ),
        center: new THREE.Vector3(pos[0], 0.8, pos[2]),
        size: new THREE.Vector3(1.6, 1.6, 2.0),
    };

    return { group, obstacle, update };
}
