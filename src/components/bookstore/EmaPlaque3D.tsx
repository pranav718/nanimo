import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface EmaPlaqueResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createEmaPlaque3D(pos: [number, number, number]): EmaPlaqueResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x7c2d12,
        roughness: 0.8,
    });

    const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.6,
    });

    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
    [-0.8, 0.8].forEach((x) => {
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(x, 1.1, 0);
        post.castShadow = true;
        group.add(post);
    });

    const beamGeo = new THREE.BoxGeometry(1.8, 0.08, 0.08);
    [0.8, 1.4, 2.0].forEach((y) => {
        const beam = new THREE.Mesh(beamGeo, woodMat);
        beam.position.set(0, y, 0);
        group.add(beam);
    });

    const roofGeo = new THREE.ConeGeometry(1.2, 0.4, 4);
    const roof = new THREE.Mesh(roofGeo, woodMat);
    roof.position.set(0, 2.25, 0);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    const plaques: THREE.Mesh[] = [];
    [-0.5, 0, 0.5].forEach((x, idx) => {
        const plaqueGeo = new THREE.BoxGeometry(0.2, 0.25, 0.02);
        const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
        plaque.position.set(x, 1.35 + (idx % 2 === 0 ? 0.05 : -0.05), 0.05);
        group.add(plaque);
        plaques.push(plaque);
    });

    const shrineLight = new THREE.PointLight(0xef4444, 1.4, 4);
    shrineLight.position.set(0, 1.8, 0.5);
    group.add(shrineLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        plaques.forEach((p, idx) => {
            p.rotation.z = Math.sin(time * 2 + idx) * 0.05;
        });
        shrineLight.intensity = 1.3 + Math.sin(time * 3) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.0, 0, pos[2] - 0.4),
            new THREE.Vector3(pos[0] + 1.0, 2.3, pos[2] + 0.4)
        ),
        center: new THREE.Vector3(pos[0], 1.15, pos[2]),
        size: new THREE.Vector3(2.0, 2.3, 0.8),
    };

    return { group, obstacle, update };
}
