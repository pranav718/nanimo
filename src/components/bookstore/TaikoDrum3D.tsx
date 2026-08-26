import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface TaikoDrum3DResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createTaikoDrum3D(pos: [number, number, number]): TaikoDrum3DResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const drumBodyMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.4,
    });

    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.8,
    });

    const standMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.7,
    });

    const standGeo = new THREE.BoxGeometry(1.6, 0.8, 1.2);
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = 0.4;
    stand.castShadow = true;
    group.add(stand);

    const drumGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 24);
    const drum = new THREE.Mesh(drumGeo, drumBodyMat);
    drum.rotation.z = Math.PI / 2;
    drum.position.y = 1.3;
    drum.castShadow = true;
    group.add(drum);

    const leftHead = new THREE.Mesh(new THREE.CircleGeometry(0.78, 24), skinMat);
    leftHead.rotation.y = -Math.PI / 2;
    leftHead.position.set(-0.61, 1.3, 0);
    group.add(leftHead);

    const rightHead = new THREE.Mesh(new THREE.CircleGeometry(0.78, 24), skinMat);
    rightHead.rotation.y = Math.PI / 2;
    rightHead.position.set(0.61, 1.3, 0);
    group.add(rightHead);

    const drumLight = new THREE.PointLight(0xef4444, 1.6, 5);
    drumLight.position.set(0, 1.8, 0.5);
    group.add(drumLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        drumLight.intensity = 1.4 + Math.sin(time * 3) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.2, 0, pos[2] - 1.0),
            new THREE.Vector3(pos[0] + 1.2, 2.0, pos[2] + 1.0)
        ),
        center: new THREE.Vector3(pos[0], 1.0, pos[2]),
        size: new THREE.Vector3(2.4, 2.0, 2.0),
    };

    return { group, obstacle, update };
}
