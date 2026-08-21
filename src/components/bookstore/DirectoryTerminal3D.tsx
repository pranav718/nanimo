import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface DirectoryTerminalResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createDirectoryTerminal(pos: [number, number, number]): DirectoryTerminalResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.2,
    });

    const baseGeo = new THREE.BoxGeometry(0.8, 1.1, 0.6);
    const baseMesh = new THREE.Mesh(baseGeo, metalMat);
    baseMesh.position.y = 0.55;
    baseMesh.castShadow = true;
    group.add(baseMesh);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 384;
    const ctx = screenCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, 512, 384);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 496, 368);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FLOOR DIRECTORY', 256, 70);
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('フロア案内タッチパネル', 256, 120);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('1F MANGA • 2F ANIME • 3F ROOFTOP', 256, 200);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '20px sans-serif';
        ctx.fillText('PRESS [E] OR CLICK TO OPEN DIRECTORY', 256, 280);
    }
    const screenTexture = new THREE.CanvasTexture(screenCanvas);

    const screenMat = new THREE.MeshStandardMaterial({
        map: screenTexture,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.6,
        roughness: 0.2,
    });

    const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.75, 0.06), screenMat);
    screenMesh.position.set(0, 1.35, 0.1);
    screenMesh.rotation.x = -Math.PI / 6;
    screenMesh.userData = { isDirectoryTerminal: true };
    group.add(screenMesh);

    const pLight = new THREE.PointLight(0x38bdf8, 1.2, 5);
    pLight.position.set(0, 1.8, 0.3);
    group.add(pLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        pLight.intensity = 1.2 + Math.sin(time * 3) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.6, 0, pos[2] - 0.5),
            new THREE.Vector3(pos[0] + 0.6, 2.0, pos[2] + 0.5)
        ),
        center: new THREE.Vector3(pos[0], 1.0, pos[2]),
        size: new THREE.Vector3(1.2, 2.0, 1.0),
    };

    return { group, obstacle, update };
}
