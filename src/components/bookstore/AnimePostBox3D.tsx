import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface PostBoxResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createAnimePostBox(pos: [number, number, number]): PostBoxResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const postRedMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.3,
    });

    const ironMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.8,
        roughness: 0.3,
    });

    const postGeo = new THREE.CylinderGeometry(0.35, 0.38, 1.4, 24);
    const postMesh = new THREE.Mesh(postGeo, postRedMat);
    postMesh.position.y = 0.7;
    postMesh.castShadow = true;
    group.add(postMesh);

    const capGeo = new THREE.SphereGeometry(0.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, postRedMat);
    cap.position.y = 1.4;
    group.add(cap);

    const slotGeo = new THREE.BoxGeometry(0.35, 0.06, 0.1);
    const slot = new THREE.Mesh(slotGeo, ironMat);
    slot.position.set(0, 1.05, 0.34);
    group.add(slot);

    const deskGeo = new THREE.BoxGeometry(1.2, 0.75, 0.7);
    const desk = new THREE.Mesh(
        deskGeo,
        new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.7 })
    );
    desk.position.set(1.0, 0.375, 0);
    desk.castShadow = true;
    group.add(desk);

    const lampLight = new THREE.PointLight(0xf43f5e, 1.4, 5);
    lampLight.position.set(0, 1.5, 0);
    group.add(lampLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        lampLight.intensity = 1.3 + Math.sin(time * 4) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 0.7, 0, pos[2] - 0.7),
            new THREE.Vector3(pos[0] + 1.8, 1.8, pos[2] + 0.7)
        ),
        center: new THREE.Vector3(pos[0] + 0.5, 0.9, pos[2]),
        size: new THREE.Vector3(2.5, 1.8, 1.4),
    };

    return { group, obstacle, update };
}
