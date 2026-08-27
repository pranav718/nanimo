import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface TeaCeremonyResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createTeaCeremony3D(pos: [number, number, number]): TeaCeremonyResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const tatamiMat = new THREE.MeshStandardMaterial({
        color: 0x854d0e,
        roughness: 0.9,
    });

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.6,
    });

    const ironMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.8,
        roughness: 0.3,
    });

    const greenMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.4,
    });

    const platformGeo = new THREE.BoxGeometry(2.4, 0.15, 2.4);
    const platform = new THREE.Mesh(platformGeo, tatamiMat);
    platform.position.y = 0.075;
    platform.castShadow = true;
    group.add(platform);

    const tableGeo = new THREE.BoxGeometry(1.2, 0.25, 0.8);
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.y = 0.275;
    table.castShadow = true;
    group.add(table);

    const kettleGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.18, 12);
    const kettle = new THREE.Mesh(kettleGeo, ironMat);
    kettle.position.set(-0.3, 0.49, 0);
    group.add(kettle);

    const bowlGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.08, 12);
    const bowl = new THREE.Mesh(bowlGeo, greenMat);
    bowl.position.set(0.2, 0.44, 0);
    group.add(bowl);

    const teaLight = new THREE.PointLight(0x10b981, 1.4, 4);
    teaLight.position.set(0, 0.8, 0);
    group.add(teaLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        teaLight.intensity = 1.3 + Math.sin(time * 3) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.2, 0, pos[2] - 1.2),
            new THREE.Vector3(pos[0] + 1.2, 0.8, pos[2] + 1.2)
        ),
        center: new THREE.Vector3(pos[0], 0.4, pos[2]),
        size: new THREE.Vector3(2.4, 0.8, 2.4),
    };

    return { group, obstacle, update };
}
