import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface TelescopeResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createCosmicTelescope(pos: [number, number, number]): TelescopeResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.9,
        roughness: 0.2,
    });

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x3d2314,
        roughness: 0.7,
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8,
    });

    const tubeGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.4, 16);
    const tubeMesh = new THREE.Mesh(tubeGeo, brassMat);
    tubeMesh.position.set(0, 1.65, 0);
    tubeMesh.rotation.z = Math.PI / 4;
    tubeMesh.rotation.y = -Math.PI / 6;
    tubeMesh.castShadow = true;
    group.add(tubeMesh);

    const lensGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16);
    const lensMesh = new THREE.Mesh(lensGeo, glassMat);
    lensMesh.position.set(0.5, 2.15, -0.3);
    lensMesh.rotation.z = Math.PI / 4;
    lensMesh.rotation.y = -Math.PI / 6;
    group.add(lensMesh);

    const mountGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const mountMesh = new THREE.Mesh(mountGeo, brassMat);
    mountMesh.position.set(0, 1.35, 0);
    group.add(mountMesh);

    const legGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.4, 8);
    [
        [-0.45, 0.7, 0.45, Math.PI / 7, 0],
        [0.45, 0.7, 0.45, Math.PI / 7, Math.PI / 2],
        [0, 0.7, -0.6, -Math.PI / 7, 0],
    ].forEach((l) => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(l[0], l[1], l[2]);
        leg.rotation.x = l[3];
        leg.rotation.y = l[4];
        leg.castShadow = true;
        group.add(leg);
    });

    const starlight = new THREE.PointLight(0x818cf8, 1.4, 5);
    starlight.position.set(0.5, 2.2, -0.3);
    group.add(starlight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        starlight.intensity = 1.2 + Math.sin(time * 3) * 0.3;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.8, 0, pos[2] - 0.8),
            new THREE.Vector3(pos[0] + 0.8, 2.4, pos[2] + 0.8)
        ),
        center: new THREE.Vector3(pos[0], 1.2, pos[2]),
        size: new THREE.Vector3(1.6, 2.4, 1.6),
    };

    return { group, obstacle, update };
}
