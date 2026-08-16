import { createCarpetTexture, createWoodFloorTexture } from '@/lib/bookstoreMaterials';
import * as THREE from 'three';

export interface EnvironmentBounds {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
}

export function createBookstoreEnvironment(): {
    group: THREE.Group;
    bounds: EnvironmentBounds;
    lights: THREE.Light[];
} {
    const group = new THREE.Group();
    const lights: THREE.Light[] = [];

    const roomWidth = 44;
    const roomLength = 44;
    const roomHeight = 7.5;

    const bounds: EnvironmentBounds = {
        minX: -roomWidth / 2 + 1.5,
        maxX: roomWidth / 2 - 1.5,
        minZ: -roomLength / 2 + 1.5,
        maxZ: roomLength / 2 - 1.5,
    };

    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const floorMat = new THREE.MeshStandardMaterial({
        map: createWoodFloorTexture(),
        roughness: 0.35,
        metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const ceilingMat = new THREE.MeshStandardMaterial({
        color: 0x181412,
        roughness: 0.9,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    group.add(ceiling);

    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x1f1b18,
        roughness: 0.8,
    });
    const trimMat = new THREE.MeshStandardMaterial({
        color: 0x0f0c0a,
        roughness: 0.4,
    });

    const createWall = (width: number, height: number, pos: [number, number, number], rotY: number) => {
        const wallGroup = new THREE.Group();

        const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
        wallMesh.position.set(0, height / 2, 0);
        wallGroup.add(wallMesh);

        const baseboard = new THREE.Mesh(new THREE.BoxGeometry(width, 0.4, 0.2), trimMat);
        baseboard.position.set(0, 0.2, 0.1);
        wallGroup.add(baseboard);

        const crownMolding = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, 0.2), trimMat);
        crownMolding.position.set(0, height - 0.15, 0.1);
        wallGroup.add(crownMolding);

        wallGroup.position.set(...pos);
        wallGroup.rotation.y = rotY;
        group.add(wallGroup);
    };

    createWall(roomWidth, roomHeight, [0, 0, -roomLength / 2], 0);
    createWall(roomWidth, roomHeight, [0, 0, roomLength / 2], Math.PI);
    createWall(roomLength, roomHeight, [-roomWidth / 2, 0, 0], Math.PI / 2);
    createWall(roomLength, roomHeight, [roomWidth / 2, 0, 0], -Math.PI / 2);

    const beamGeo = new THREE.BoxGeometry(roomWidth, 0.5, 0.5);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x140e0a, roughness: 0.6 });
    for (let z = -roomLength / 2 + 6; z < roomLength / 2; z += 7) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(0, roomHeight - 0.25, z);
        group.add(beam);
    }

    const runnerGeo = new THREE.PlaneGeometry(5, roomLength - 6);
    const runnerMat = new THREE.MeshStandardMaterial({
        map: createCarpetTexture('#4a1525', '#2b0c16'),
        roughness: 0.85,
    });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.02, 0);
    runner.receiveShadow = true;
    group.add(runner);

    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    group.add(ambientLight);
    lights.push(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0xfff0dd, 1.2);
    mainSpot.position.set(10, 20, 10);
    mainSpot.castShadow = true;
    group.add(mainSpot);
    lights.push(mainSpot);

    const pointLightPositions: [number, number, number][] = [
        [-12, 5.5, -12],
        [12, 5.5, -12],
        [-12, 5.5, 12],
        [12, 5.5, 12],
        [0, 5.5, 0],
    ];

    pointLightPositions.forEach(([px, py, pz]) => {
        const pLight = new THREE.PointLight(0xffddaa, 1.5, 18, 1.5);
        pLight.position.set(px, py, pz);
        group.add(pLight);
        lights.push(pLight);

        const lanternMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.35, 0.7, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffe6c2,
                emissive: 0xffaa44,
                emissiveIntensity: 1.0,
                roughness: 0.2,
            })
        );
        lanternMesh.position.set(px, py, pz);
        group.add(lanternMesh);
    });

    return { group, bounds, lights };
}
