import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface ShrineResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    update: (delta: number) => void;
}

export function createOmikujiShrine(pos: [number, number, number]): ShrineResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const vermilionMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.4,
    });

    const roofMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.5,
    });

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.7,
    });

    const baseGeo = new THREE.BoxGeometry(2.0, 0.3, 1.6);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 0.15;
    base.castShadow = true;
    group.add(base);

    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 12);
    [
        [-0.8, 1.15, -0.6],
        [0.8, 1.15, -0.6],
        [-0.8, 1.15, 0.6],
        [0.8, 1.15, 0.6],
    ].forEach((p) => {
        const pil = new THREE.Mesh(pillarGeo, vermilionMat);
        pil.position.set(p[0], p[1], p[2]);
        pil.castShadow = true;
        group.add(pil);
    });

    const boxGeo = new THREE.BoxGeometry(0.9, 0.9, 0.7);
    const shrineBox = new THREE.Mesh(boxGeo, vermilionMat);
    shrineBox.position.set(0, 0.9, 0);
    shrineBox.castShadow = true;
    group.add(shrineBox);

    const roofGeo = new THREE.ConeGeometry(1.6, 0.7, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 2.35, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    const lantern = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.8 })
    );
    lantern.position.set(0, 1.7, 0.5);
    group.add(lantern);

    const shrineLight = new THREE.PointLight(0xf59e0b, 1.6, 6);
    shrineLight.position.set(0, 1.7, 0.5);
    group.add(shrineLight);

    let time = 0;

    const update = (delta: number) => {
        time += delta;
        shrineLight.intensity = 1.6 + Math.sin(time * 3) * 0.2;
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - 1.2, 0, pos[2] - 1.0),
            new THREE.Vector3(pos[0] + 1.2, 2.8, pos[2] + 1.0)
        ),
        center: new THREE.Vector3(pos[0], 1.4, pos[2]),
        size: new THREE.Vector3(2.4, 2.8, 2.0),
    };

    return { group, obstacle, update };
}
