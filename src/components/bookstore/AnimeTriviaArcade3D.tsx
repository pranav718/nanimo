import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface ArcadeResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createAnimeTriviaArcade(pos: [number, number, number]): ArcadeResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const cabinetMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.3,
        metalness: 0.7,
    });

    const bodyGeo = new THREE.BoxGeometry(1.2, 2.4, 1.1);
    const bodyMesh = new THREE.Mesh(bodyGeo, cabinetMat);
    bodyMesh.position.y = 1.2;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 256;
    screenCanvas.height = 256;
    const ctx = screenCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#050408';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, 244, 244);
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ANIME TRIVIA', 128, 80);
        ctx.fillStyle = '#fbcfe8';
        ctx.font = '18px monospace';
        ctx.fillText('INSERT COIN [E]', 128, 140);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('HIGH SCORE: 9999', 128, 200);
    }
    const screenTexture = new THREE.CanvasTexture(screenCanvas);

    const screenMat = new THREE.MeshStandardMaterial({
        map: screenTexture,
        emissive: new THREE.Color(0xec4899),
        emissiveIntensity: 0.8,
        roughness: 0.2,
    });

    const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.05), screenMat);
    screenMesh.position.set(0, 1.45, 0.56);
    screenMesh.rotation.x = -Math.PI / 16;
    group.add(screenMesh);

    const controlPanel = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.1, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 })
    );
    controlPanel.position.set(0, 0.9, 0.65);
    group.add(controlPanel);

    const joystick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8),
        new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.8 })
    );
    joystick.position.set(-0.25, 1.02, 0.65);
    group.add(joystick);

    const arcadeLight = new THREE.PointLight(0xec4899, 1.5, 6);
    arcadeLight.position.set(0, 1.6, 0.7);
    group.add(arcadeLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        arcadeLight.intensity = 1.4 + Math.sin(time * 5) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.8, 0, pos[2] - 0.8),
            new THREE.Vector3(pos[0] + 0.8, 2.6, pos[2] + 0.8)
        ),
        center: new THREE.Vector3(pos[0], 1.3, pos[2]),
        size: new THREE.Vector3(1.6, 2.6, 1.6),
    };

    return { group, obstacle, update };
}
