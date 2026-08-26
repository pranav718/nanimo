import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface WindChimePavilionResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createWindChimePavilion3D(pos: [number, number, number]): WindChimePavilionResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.7,
    });

    const roofMat = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.5,
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
    });

    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    [
        [-0.8, -0.8],
        [0.8, -0.8],
        [-0.8, 0.8],
        [0.8, 0.8],
    ].forEach(([x, z]) => {
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(x, 1.1, z);
        post.castShadow = true;
        group.add(post);
    });

    const roofGeo = new THREE.ConeGeometry(1.6, 0.7, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.45;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    const chimes: THREE.Mesh[] = [];
    [
        [-0.5, -0.5],
        [0.5, -0.5],
        [-0.5, 0.5],
        [0.5, 0.5],
    ].forEach(([x, z]) => {
        const bell = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glassMat);
        bell.position.set(x, 2.0, z);
        group.add(bell);
        chimes.push(bell);
    });

    const pavilionLight = new THREE.PointLight(0x38bdf8, 1.4, 5);
    pavilionLight.position.set(0, 1.8, 0);
    group.add(pavilionLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        chimes.forEach((c, idx) => {
            c.position.x += Math.sin(time * 2 + idx) * 0.002;
            c.position.z += Math.cos(time * 2 + idx) * 0.002;
        });
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.2, 0, pos[2] - 1.2),
            new THREE.Vector3(pos[0] + 1.2, 2.6, pos[2] + 1.2)
        ),
        center: new THREE.Vector3(pos[0], 1.3, pos[2]),
        size: new THREE.Vector3(2.4, 2.6, 2.4),
    };

    return { group, obstacle, update };
}
