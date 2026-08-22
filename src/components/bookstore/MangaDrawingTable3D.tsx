import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface DrawingTableResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createMangaDrawingTable(pos: [number, number, number]): DrawingTableResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x3d2314,
        roughness: 0.7,
    });

    const paperMat = new THREE.MeshStandardMaterial({
        color: 0xfef9c3,
        roughness: 0.3,
    });

    const deskGeo = new THREE.BoxGeometry(2.2, 0.1, 1.4);
    const deskMesh = new THREE.Mesh(deskGeo, woodMat);
    deskMesh.position.set(0, 1.1, 0);
    deskMesh.rotation.x = -Math.PI / 12;
    deskMesh.castShadow = true;
    group.add(deskMesh);

    const legGeo = new THREE.BoxGeometry(0.12, 1.1, 0.12);
    [
        [-0.95, 0.55, -0.55],
        [0.95, 0.55, -0.55],
        [-0.95, 0.55, 0.55],
        [0.95, 0.55, 0.55],
    ].forEach((p) => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(p[0], p[1], p[2]);
        leg.castShadow = true;
        group.add(leg);
    });

    const paperGeo = new THREE.BoxGeometry(1.2, 0.02, 0.9);
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.position.set(0, 1.16, 0);
    paperMesh.rotation.x = -Math.PI / 12;
    group.add(paperMesh);

    const inkBottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.16, 12),
        new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 })
    );
    inkBottle.position.set(0.8, 1.25, -0.3);
    group.add(inkBottle);

    const lampArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    lampArm.position.set(-0.8, 1.45, -0.4);
    lampArm.rotation.z = -Math.PI / 6;
    group.add(lampArm);

    const lampShade = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.22, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    lampShade.position.set(-0.6, 1.7, -0.4);
    lampShade.rotation.z = Math.PI / 3;
    group.add(lampShade);

    const lampLight = new THREE.PointLight(0xfef08a, 1.8, 6);
    lampLight.position.set(-0.5, 1.6, -0.3);
    group.add(lampLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        lampLight.intensity = 1.8 + Math.sin(time * 6) * 0.1;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.3, 0, pos[2] - 0.9),
            new THREE.Vector3(pos[0] + 1.3, 2.0, pos[2] + 0.9)
        ),
        center: new THREE.Vector3(pos[0], 1.0, pos[2]),
        size: new THREE.Vector3(2.6, 2.0, 1.8),
    };

    return { group, obstacle, update };
}
