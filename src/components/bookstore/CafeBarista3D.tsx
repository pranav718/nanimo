import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface CafeBaristaResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createCafeBarista(pos: [number, number, number]): CafeBaristaResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.5 });
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });

    const counterWidth = 3.6;
    const counterHeight = 1.1;
    const counterDepth = 1.2;

    const counterBase = new THREE.Mesh(new THREE.BoxGeometry(counterWidth, counterHeight, counterDepth), woodMat);
    counterBase.position.y = counterHeight / 2;
    counterBase.castShadow = true;
    group.add(counterBase);

    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(counterWidth + 0.2, 0.08, counterDepth + 0.2), marbleMat);
    topSlab.position.y = counterHeight + 0.04;
    group.add(topSlab);

    const espressoMachine = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.65, 0.6), chromeMat);
    espressoMachine.position.set(0.9, counterHeight + 0.36, 0);
    group.add(espressoMachine);

    for (let i = -1; i <= 1; i++) {
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.14, 16), ceramicMat);
        mug.position.set(i * 0.4, counterHeight + 0.15, 0.25);
        group.add(mug);
    }

    const baristaGroup = new THREE.Group();
    baristaGroup.position.set(0, 0, -0.7);

    const baristaTorso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.26), apronMat);
    baristaTorso.position.y = 1.0;
    baristaTorso.castShadow = true;
    baristaGroup.add(baristaTorso);

    const baristaHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.32), skinMat);
    baristaHead.position.set(0, 1.48, 0);
    baristaGroup.add(baristaHead);

    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.36), hairMat);
    hairMesh.position.set(0, 1.62, 0);
    baristaGroup.add(hairMesh);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), skinMat);
    leftArm.position.set(-0.32, 0.95, 0.2);
    leftArm.rotation.x = -Math.PI / 4;
    baristaGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), skinMat);
    rightArm.position.set(0.32, 0.95, 0.2);
    rightArm.rotation.x = -Math.PI / 4;
    baristaGroup.add(rightArm);

    group.add(baristaGroup);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 96;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 256, 96);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 88);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CAFE NANIMO', 128, 42);
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('喫茶ナニモ • BARISTA', 128, 72);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.75, 0.06),
        new THREE.MeshStandardMaterial({
            map: signTexture,
            emissive: new THREE.Color(0x10b981),
            emissiveIntensity: 0.7,
        })
    );
    signMesh.position.set(0, 3.4, 0);
    group.add(signMesh);

    const pendant = new THREE.PointLight(0xfef08a, 1.4, 6);
    pendant.position.set(0, 2.6, 0);
    group.add(pendant);

    let idleTime = 0;

    const update = (delta: number) => {
        idleTime += delta;
        baristaHead.position.y = 1.48 + Math.sin(idleTime * 2) * 0.015;
        baristaTorso.position.y = 1.0 + Math.sin(idleTime * 2) * 0.008;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - counterWidth / 2 - 0.2, 0, pos[2] - counterDepth / 2 - 1.2),
            new THREE.Vector3(pos[0] + counterWidth / 2 + 0.2, 3.0, pos[2] + counterDepth / 2 + 0.2)
        ),
        center: new THREE.Vector3(pos[0], 1.5, pos[2] - 0.5),
        size: new THREE.Vector3(counterWidth + 0.4, 3.0, counterDepth + 1.4),
    };

    return { group, obstacle, update };
}
