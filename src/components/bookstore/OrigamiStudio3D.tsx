import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface OrigamiStudio3DResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createOrigamiStudio3D(pos: [number, number, number]): OrigamiStudio3DResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.6,
    });

    const paperMatPink = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.5,
    });

    const paperMatCyan = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.5,
    });

    const tableGeo = new THREE.BoxGeometry(1.6, 0.5, 1.2);
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.y = 0.25;
    table.castShadow = true;
    group.add(table);

    const paperStack = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.05, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 })
    );
    paperStack.position.set(-0.4, 0.525, 0.2);
    group.add(paperStack);

    const cranePink = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.2, 4), paperMatPink);
    cranePink.position.set(0.2, 0.6, -0.15);
    cranePink.rotation.y = Math.PI / 4;
    group.add(cranePink);

    const craneCyan = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), paperMatCyan);
    craneCyan.position.set(0.4, 0.58, 0.15);
    craneCyan.rotation.y = -Math.PI / 6;
    group.add(craneCyan);

    const studioLight = new THREE.PointLight(0xf43f5e, 1.4, 5);
    studioLight.position.set(0, 1.2, 0);
    group.add(studioLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        studioLight.intensity = 1.3 + Math.sin(time * 3) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.0, 0, pos[2] - 0.8),
            new THREE.Vector3(pos[0] + 1.0, 1.4, pos[2] + 0.8)
        ),
        center: new THREE.Vector3(pos[0], 0.7, pos[2]),
        size: new THREE.Vector3(2.0, 1.4, 1.6),
    };

    return { group, obstacle, update };
}
