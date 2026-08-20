import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface GachaponMachineResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    playSpinAnimation: () => void;
    update: (delta: number) => void;
}

export function createGachaponMachine(pos: [number, number, number]): GachaponMachineResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const redMat = new THREE.MeshStandardMaterial({
        color: 0xd92626,
        roughness: 0.3,
        metalness: 0.1,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.95,
        transparent: true,
        opacity: 0.7,
    });

    const baseGeo = new THREE.BoxGeometry(1.6, 1.8, 1.4);
    const baseMesh = new THREE.Mesh(baseGeo, redMat);
    baseMesh.position.y = 0.9;
    baseMesh.castShadow = true;
    group.add(baseMesh);

    const trimGeo = new THREE.BoxGeometry(1.65, 0.15, 1.45);
    const trimMesh = new THREE.Mesh(trimGeo, chromeMat);
    trimMesh.position.y = 1.8;
    group.add(trimMesh);

    const globeGeo = new THREE.SphereGeometry(1.0, 24, 24);
    const globeMesh = new THREE.Mesh(globeGeo, glassMat);
    globeMesh.position.y = 2.8;
    globeMesh.castShadow = true;
    group.add(globeMesh);

    const capsuleColors = [0xf43f5e, 0x06b6d4, 0xfbbf24, 0x10b981, 0xa855f7, 0xec4899];
    const capsuleGroup = new THREE.Group();
    capsuleGroup.position.y = 2.8;

    for (let i = 0; i < 18; i++) {
        const radius = Math.random() * 0.65;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        const cx = radius * Math.sin(phi) * Math.cos(theta);
        const cy = radius * Math.cos(phi);
        const cz = radius * Math.sin(phi) * Math.sin(theta);

        const capColor = capsuleColors[i % capsuleColors.length];
        const capMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.2 });
        const capMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), capMat);
        capMesh.position.set(cx, cy, cz);
        capsuleGroup.add(capMesh);
    }
    group.add(capsuleGroup);

    const crankGroup = new THREE.Group();
    crankGroup.position.set(0, 1.25, 0.72);

    const crankCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16), chromeMat);
    crankCenter.rotation.x = Math.PI / 2;
    crankGroup.add(crankCenter);

    const crankHandle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.08), chromeMat);
    crankHandle.position.z = 0.06;
    crankGroup.add(crankHandle);
    group.add(crankGroup);

    const chuteGeo = new THREE.BoxGeometry(0.65, 0.35, 0.25);
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const chuteMesh = new THREE.Mesh(chuteGeo, chuteMat);
    chuteMesh.position.set(0, 0.45, 0.65);
    group.add(chuteMesh);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d');
    if (sCtx) {
        sCtx.fillStyle = '#0a0a0a';
        sCtx.fillRect(0, 0, 256, 128);
        sCtx.strokeStyle = '#f43f5e';
        sCtx.lineWidth = 6;
        sCtx.strokeRect(4, 4, 248, 120);
        sCtx.fillStyle = '#f43f5e';
        sCtx.font = 'bold 36px sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('GACHAPON', 128, 54);
        sCtx.font = '26px sans-serif';
        sCtx.fillStyle = '#ffffff';
        sCtx.fillText('ガチャポン', 128, 96);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.8, 0.08),
        new THREE.MeshStandardMaterial({
            map: signTexture,
            emissive: new THREE.Color(0xf43f5e),
            emissiveIntensity: 0.8,
            roughness: 0.2,
        })
    );
    signMesh.position.set(0, 4.2, 0);
    group.add(signMesh);

    const pLight = new THREE.PointLight(0xf43f5e, 1.4, 6);
    pLight.position.set(0, 3.2, 0.8);
    group.add(pLight);

    let isSpinning = false;
    let spinTime = 0;

    const playSpinAnimation = () => {
        isSpinning = true;
        spinTime = 0;
    };

    const update = (delta: number) => {
        if (isSpinning) {
            spinTime += delta;
            crankGroup.rotation.z += delta * 15;
            capsuleGroup.rotation.y += delta * 6;
            capsuleGroup.rotation.x = Math.sin(spinTime * 10) * 0.1;

            if (spinTime > 1.2) {
                isSpinning = false;
                crankGroup.rotation.z = 0;
            }
        }
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.0, 0, pos[2] - 0.9),
            new THREE.Vector3(pos[0] + 1.0, 3.5, pos[2] + 0.9)
        ),
        center: new THREE.Vector3(pos[0], 1.75, pos[2]),
        size: new THREE.Vector3(2.0, 3.5, 1.8),
    };

    return { group, obstacle, playSpinAnimation, update };
}
