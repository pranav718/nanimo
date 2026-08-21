import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface QuizKioskResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createQuizKiosk(pos: [number, number, number]): QuizKioskResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.2,
    });

    const holoMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: new THREE.Color(0xf472b6),
        emissiveIntensity: 0.8,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.85,
    });

    const pedestalGeo = new THREE.CylinderGeometry(0.8, 1.1, 1.2, 8);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, metalMat);
    pedestalMesh.position.y = 0.6;
    pedestalMesh.castShadow = true;
    group.add(pedestalMesh);

    const crystalGeo = new THREE.IcosahedronGeometry(0.55, 0);
    const crystalMesh = new THREE.Mesh(crystalGeo, holoMat);
    crystalMesh.position.y = 1.9;
    group.add(crystalMesh);

    const ringGeo = new THREE.TorusGeometry(0.9, 0.04, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 1.5,
    }));
    ringMesh.position.y = 1.9;
    group.add(ringMesh);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 96;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, 256, 96);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 88);
        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ANIME SOUL QUIZ', 128, 44);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('魂の適性診断 • TEST', 128, 72);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 0.05),
        new THREE.MeshStandardMaterial({
            map: signTexture,
            emissive: new THREE.Color(0xf472b6),
            emissiveIntensity: 0.6,
        })
    );
    signMesh.position.set(0, 2.8, 0);
    group.add(signMesh);

    const pLight = new THREE.PointLight(0xf472b6, 1.8, 7);
    pLight.position.set(0, 2.0, 0);
    group.add(pLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        crystalMesh.rotation.y += delta * 1.2;
        crystalMesh.rotation.x = Math.sin(time * 2) * 0.2;
        crystalMesh.position.y = 1.9 + Math.sin(time * 3) * 0.08;

        ringMesh.rotation.x = time * 0.8;
        ringMesh.rotation.y = time * 1.1;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.2, 0, pos[2] - 1.2),
            new THREE.Vector3(pos[0] + 1.2, 3.0, pos[2] + 1.2)
        ),
        center: new THREE.Vector3(pos[0], 1.5, pos[2]),
        size: new THREE.Vector3(2.4, 3.0, 2.4),
    };

    return { group, obstacle, update };
}
