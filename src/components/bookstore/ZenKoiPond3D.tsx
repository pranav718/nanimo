import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface ZenKoiPondResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createZenKoiPond(pos: [number, number, number]): ZenKoiPondResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.9,
    });

    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85,
    });

    const pondRimGeo = new THREE.TorusGeometry(2.4, 0.35, 12, 24);
    const rimMesh = new THREE.Mesh(pondRimGeo, stoneMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.25;
    rimMesh.castShadow = true;
    group.add(rimMesh);

    const waterGeo = new THREE.CircleGeometry(2.35, 32);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0.22;
    group.add(waterMesh);

    const lilyGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 16);
    const lilyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    [
        [0.8, -0.6],
        [-0.9, 0.5],
        [0.3, 1.1],
    ].forEach((lp) => {
        const lily = new THREE.Mesh(lilyGeo, lilyMat);
        lily.position.set(lp[0], 0.24, lp[1]);
        group.add(lily);
    });

    const koiColors = [0xf97316, 0xef4444, 0xffffff];
    const koiList: { mesh: THREE.Group; angle: number; speed: number; radius: number }[] = [];

    koiColors.forEach((col, idx) => {
        const koiGroup = new THREE.Group();
        const bodyGeo = new THREE.ConeGeometry(0.1, 0.45, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = Math.PI / 2;
        koiGroup.add(body);

        const tailGeo = new THREE.BoxGeometry(0.08, 0.02, 0.18);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.set(0, 0, -0.26);
        koiGroup.add(tail);

        koiGroup.position.y = 0.16;
        group.add(koiGroup);

        koiList.push({
            mesh: koiGroup,
            angle: (idx * Math.PI * 2) / 3,
            speed: 0.6 + idx * 0.2,
            radius: 1.0 + idx * 0.35,
        });
    });

    const pondLight = new THREE.PointLight(0x38bdf8, 1.5, 6);
    pondLight.position.set(0, 0.8, 0);
    group.add(pondLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;

        koiList.forEach((koi) => {
            koi.angle += delta * koi.speed;
            const kx = Math.cos(koi.angle) * koi.radius;
            const kz = Math.sin(koi.angle) * koi.radius;
            koi.mesh.position.x = kx;
            koi.mesh.position.z = kz;
            koi.mesh.rotation.y = -koi.angle + Math.PI / 2 + Math.sin(time * 6) * 0.15;
        });

        waterMesh.position.y = 0.22 + Math.sin(time * 2) * 0.01;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 2.5, 0, pos[2] - 2.5),
            new THREE.Vector3(pos[0] + 2.5, 1.2, pos[2] + 2.5)
        ),
        center: new THREE.Vector3(pos[0], 0.6, pos[2]),
        size: new THREE.Vector3(5.0, 1.2, 5.0),
    };

    return { group, obstacle, update };
}
