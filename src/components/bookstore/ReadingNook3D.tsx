import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface ReadingNookResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createReadingNook(pos: [number, number, number]): ReadingNookResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const rugGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.04, 32);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.position.y = 0.02;
    group.add(rug);

    const beanbagMat1 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });
    const beanbagMat2 = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.8 });

    const beanbag1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), beanbagMat1);
    beanbag1.scale.set(1.2, 0.6, 1.2);
    beanbag1.position.set(-0.8, 0.35, -0.4);
    beanbag1.castShadow = true;
    group.add(beanbag1);

    const beanbag2 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), beanbagMat2);
    beanbag2.scale.set(1.2, 0.6, 1.2);
    beanbag2.position.set(0.8, 0.35, -0.4);
    beanbag2.castShadow = true;
    group.add(beanbag2);

    const tableGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.5 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.2, 0.4);
    table.castShadow = true;
    group.add(table);

    const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.14, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    cup.position.set(0, 0.44, 0.4);
    group.add(cup);

    const nookLight = new THREE.PointLight(0xfde047, 1.4, 6);
    nookLight.position.set(0, 1.2, 0);
    group.add(nookLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        nookLight.intensity = 1.4 + Math.sin(time * 4) * 0.15;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.8, 0, pos[2] - 1.8),
            new THREE.Vector3(pos[0] + 1.8, 1.5, pos[2] + 1.8)
        ),
        center: new THREE.Vector3(pos[0], 0.75, pos[2]),
        size: new THREE.Vector3(3.6, 1.5, 3.6),
    };

    return { group, obstacle, update };
}
