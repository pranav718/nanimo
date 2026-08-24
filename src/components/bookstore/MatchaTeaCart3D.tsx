import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface TeaCartResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createMatchaTeaCart(pos: [number, number, number]): TeaCartResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.7,
    });

    const ironMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.9,
        roughness: 0.3,
    });

    const cartBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.0), woodMat);
    cartBase.position.y = 0.55;
    cartBase.castShadow = true;
    group.add(cartBase);

    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
    [
        [-0.6, 0.25, 0.55],
        [0.6, 0.25, 0.55],
        [-0.6, 0.25, -0.55],
        [0.6, 0.25, -0.55],
    ].forEach((w) => {
        const wheel = new THREE.Mesh(wheelGeo, ironMat);
        wheel.position.set(w[0], w[1], w[2]);
        wheel.rotation.x = Math.PI / 2;
        group.add(wheel);
    });

    const kettleGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 16);
    const kettle = new THREE.Mesh(kettleGeo, ironMat);
    kettle.position.set(-0.35, 1.1, 0.1);
    group.add(kettle);

    const matchaBowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.08, 0.14, 12),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 })
    );
    matchaBowl.position.set(0.35, 1.02, 0.1);
    group.add(matchaBowl);

    const lantern = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: new THREE.Color(0x84cc16), emissiveIntensity: 0.7 })
    );
    lantern.position.set(0.6, 1.4, -0.3);
    group.add(lantern);

    const cartLight = new THREE.PointLight(0x84cc16, 1.4, 5);
    cartLight.position.set(0.6, 1.4, -0.3);
    group.add(cartLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        cartLight.intensity = 1.3 + Math.sin(time * 3.5) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.0, 0, pos[2] - 0.7),
            new THREE.Vector3(pos[0] + 1.0, 2.0, pos[2] + 0.7)
        ),
        center: new THREE.Vector3(pos[0], 1.0, pos[2]),
        size: new THREE.Vector3(2.0, 2.0, 1.4),
    };

    return { group, obstacle, update };
}
