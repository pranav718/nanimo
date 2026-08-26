import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface BonsaiGardenResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createZenBonsaiGarden(pos: [number, number, number]): BonsaiGardenResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x3f3f46,
        roughness: 0.8,
    });

    const sandMat = new THREE.MeshStandardMaterial({
        color: 0xe4e4e7,
        roughness: 0.95,
    });

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.7,
    });

    const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x166534,
        roughness: 0.6,
    });

    const altarGeo = new THREE.BoxGeometry(2.4, 0.4, 1.8);
    const altar = new THREE.Mesh(altarGeo, stoneMat);
    altar.position.y = 0.2;
    altar.castShadow = true;
    group.add(altar);

    const sandBed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 1.6), sandMat);
    sandBed.position.set(0, 0.42, 0);
    group.add(sandBed);

    const potGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 16);
    const pot = new THREE.Mesh(
        potGeo,
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    pot.position.set(-0.4, 0.55, 0);
    pot.castShadow = true;
    group.add(pot);

    const trunkGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.7, 8);
    const trunk = new THREE.Mesh(trunkGeo, woodMat);
    trunk.position.set(-0.4, 0.95, 0);
    trunk.rotation.z = -Math.PI / 12;
    trunk.castShadow = true;
    group.add(trunk);

    const crown1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), foliageMat);
    crown1.position.set(-0.35, 1.35, 0.05);
    group.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), foliageMat);
    crown2.position.set(-0.55, 1.15, -0.1);
    group.add(crown2);

    const lantern = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.6 })
    );
    lantern.position.set(0.6, 0.68, 0);
    group.add(lantern);

    const zenLight = new THREE.PointLight(0x34d399, 1.4, 5);
    zenLight.position.set(0.6, 1.2, 0);
    group.add(zenLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        zenLight.intensity = 1.3 + Math.sin(time * 2.5) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.4, 0, pos[2] - 1.0),
            new THREE.Vector3(pos[0] + 1.4, 2.0, pos[2] + 1.0)
        ),
        center: new THREE.Vector3(pos[0], 1.0, pos[2]),
        size: new THREE.Vector3(2.8, 2.0, 2.0),
    };

    return { group, obstacle, update };
}
