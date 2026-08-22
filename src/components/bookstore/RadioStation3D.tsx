import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface RadioStationResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createRadioStation(pos: [number, number, number]): RadioStationResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.2,
    });

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.6,
    });

    const baseGeo = new THREE.BoxGeometry(1.6, 1.2, 0.9);
    const baseMesh = new THREE.Mesh(baseGeo, woodMat);
    baseMesh.position.y = 0.6;
    baseMesh.castShadow = true;
    group.add(baseMesh);

    const dialCanvas = document.createElement('canvas');
    dialCanvas.width = 256;
    dialCanvas.height = 128;
    const ctx = dialCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 256, 128);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 120);
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FM 88.5 - 106.8', 128, 50);
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('LIVE ON AIR', 128, 90);
    }
    const dialTexture = new THREE.CanvasTexture(dialCanvas);
    const dialMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 0.05),
        new THREE.MeshStandardMaterial({
            map: dialTexture,
            emissive: new THREE.Color(0x06b6d4),
            emissiveIntensity: 0.7,
        })
    );
    dialMesh.position.set(0, 0.7, 0.46);
    group.add(dialMesh);

    const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 1.8, 8),
        metalMat
    );
    antenna.position.set(0.6, 2.0, -0.2);
    group.add(antenna);

    const beaconLight = new THREE.PointLight(0xf43f5e, 1.8, 5);
    beaconLight.position.set(0.6, 2.9, -0.2);
    group.add(beaconLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        beaconLight.intensity = 1.2 + Math.abs(Math.sin(time * 3)) * 1.0;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.0, 0, pos[2] - 0.7),
            new THREE.Vector3(pos[0] + 1.0, 3.0, pos[2] + 0.7)
        ),
        center: new THREE.Vector3(pos[0], 1.5, pos[2]),
        size: new THREE.Vector3(2.0, 3.0, 1.4),
    };

    return { group, obstacle, update };
}
