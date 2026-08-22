import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface SoundboardResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createAnimeSoundboard(pos: [number, number, number]): SoundboardResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.9,
        roughness: 0.15,
    });

    const deskGeo = new THREE.BoxGeometry(2.4, 1.1, 1.2);
    const deskMesh = new THREE.Mesh(deskGeo, metalMat);
    deskMesh.position.y = 0.55;
    deskMesh.castShadow = true;
    group.add(deskMesh);

    const padColors = [0xf43f5e, 0x06b6d4, 0x10b981, 0xfbbf24, 0xa855f7, 0xec4899, 0x38bdf8, 0xf97316];
    const padGroup = new THREE.Group();
    padGroup.position.set(0, 1.12, 0);

    const pads: THREE.Mesh[] = [];

    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
            const idx = r * 4 + c;
            const px = -0.75 + c * 0.5;
            const pz = -0.25 + r * 0.5;

            const padMat = new THREE.MeshStandardMaterial({
                color: padColors[idx],
                emissive: new THREE.Color(padColors[idx]),
                emissiveIntensity: 0.8,
                roughness: 0.3,
            });

            const padMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), padMat);
            padMesh.position.set(px, 0, pz);
            padGroup.add(padMesh);
            pads.push(padMesh);
        }
    }
    group.add(padGroup);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 96;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#05070d';
        ctx.fillRect(0, 0, 256, 96);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 88);
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ANIME SFX CONSOLE', 128, 44);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('効果音卓 • SOUNDBOARD', 128, 72);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 0.05),
        new THREE.MeshStandardMaterial({
            map: signTexture,
            emissive: new THREE.Color(0x06b6d4),
            emissiveIntensity: 0.6,
        })
    );
    signMesh.position.set(0, 2.6, 0);
    group.add(signMesh);

    const deskLight = new THREE.PointLight(0x06b6d4, 1.4, 7);
    deskLight.position.set(0, 1.8, 0.2);
    group.add(deskLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        pads.forEach((pad, i) => {
            const mat = pad.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.5 + Math.abs(Math.sin(time * 4 + i * 0.8)) * 0.6;
        });
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.4, 0, pos[2] - 0.8),
            new THREE.Vector3(pos[0] + 1.4, 2.8, pos[2] + 0.8)
        ),
        center: new THREE.Vector3(pos[0], 1.4, pos[2]),
        size: new THREE.Vector3(2.8, 2.8, 1.6),
    };

    return { group, obstacle, update };
}
