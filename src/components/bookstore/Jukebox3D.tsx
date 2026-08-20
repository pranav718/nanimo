import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface JukeboxResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number, isPlaying: boolean) => void;
}

export function createJukebox(pos: [number, number, number]): JukeboxResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.2,
        metalness: 0.8,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.95,
        roughness: 0.1,
    });

    const width = 2.0;
    const height = 2.8;
    const depth = 1.2;

    const base = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.7, depth), bodyMat);
    base.position.y = (height * 0.7) / 2;
    base.castShadow = true;
    group.add(base);

    const domeGeo = new THREE.CylinderGeometry(width / 2, width / 2, depth, 24);
    const domeMesh = new THREE.Mesh(domeGeo, chromeMat);
    domeMesh.rotation.x = Math.PI / 2;
    domeMesh.position.set(0, height * 0.7, 0);
    group.add(domeMesh);

    const neonArch = new THREE.Mesh(
        new THREE.TorusGeometry(width / 2 + 0.05, 0.06, 16, 24, Math.PI),
        new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: new THREE.Color(0x38bdf8),
            emissiveIntensity: 1.8,
        })
    );
    neonArch.position.set(0, height * 0.7, depth / 2 + 0.02);
    group.add(neonArch);

    const barCount = 12;
    const bars: THREE.Mesh[] = [];
    const barWidth = 0.08;
    const barSpacing = 0.12;

    const visualizerGroup = new THREE.Group();
    visualizerGroup.position.set(0, 1.2, depth / 2 + 0.04);

    for (let i = 0; i < barCount; i++) {
        const bx = -((barCount - 1) * barSpacing) / 2 + i * barSpacing;
        const barGeo = new THREE.BoxGeometry(barWidth, 0.8, 0.04);
        const barMat = new THREE.MeshStandardMaterial({
            color: 0xec4899,
            emissive: new THREE.Color(0xec4899),
            emissiveIntensity: 1.2,
        });
        const barMesh = new THREE.Mesh(barGeo, barMat);
        barMesh.position.set(bx, 0.4, 0);
        visualizerGroup.add(barMesh);
        bars.push(barMesh);
    }
    group.add(visualizerGroup);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 96;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, 256, 96);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 88);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ANIME JUKEBOX', 128, 44);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#f472b6';
        ctx.fillText('LO-FI & CITY POP', 128, 72);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 0.05),
        new THREE.MeshStandardMaterial({
            map: signTexture,
            emissive: new THREE.Color(0x38bdf8),
            emissiveIntensity: 0.6,
        })
    );
    signMesh.position.set(0, height + 0.4, depth / 2);
    group.add(signMesh);

    const glowLight = new THREE.PointLight(0x38bdf8, 1.6, 8);
    glowLight.position.set(0, 1.8, depth / 2 + 0.5);
    group.add(glowLight);

    let time = 0;

    const update = (delta: number, isPlaying: boolean) => {
        time += delta;
        bars.forEach((bar, i) => {
            if (isPlaying) {
                const scale = 0.2 + Math.abs(Math.sin(time * 6 + i * 0.8)) * 0.8;
                bar.scale.y = scale;
                bar.position.y = (scale * 0.8) / 2;
            } else {
                bar.scale.y = 0.15;
                bar.position.y = 0.06;
            }
        });
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - width / 2 - 0.2, 0, pos[2] - depth / 2 - 0.2),
            new THREE.Vector3(pos[0] + width / 2 + 0.2, 3.2, pos[2] + depth / 2 + 0.2)
        ),
        center: new THREE.Vector3(pos[0], 1.6, pos[2]),
        size: new THREE.Vector3(width + 0.4, 3.2, depth + 0.4),
    };

    return { group, obstacle, update };
}
