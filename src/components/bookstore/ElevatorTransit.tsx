import { FloorLevel } from '@/types';
import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface ElevatorResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    doorLeft: THREE.Mesh;
    doorRight: THREE.Mesh;
    light: THREE.PointLight;
}

export function createElevator(floor: FloorLevel): ElevatorResult {
    const group = new THREE.Group();

    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0x222226,
        metalness: 0.9,
        roughness: 0.15,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.6,
    });

    const width = 4.0;
    const height = 4.2;
    const depth = 3.6;

    const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.3, depth),
        chromeMat
    );
    baseMesh.position.y = 0.15;
    group.add(baseMesh);

    const roofMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.3, depth),
        chromeMat
    );
    roofMesh.position.y = height - 0.15;
    group.add(roofMesh);

    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, height, 12);
    const postPositions = [
        [-width / 2 + 0.1, height / 2, -depth / 2 + 0.1],
        [width / 2 - 0.1, height / 2, -depth / 2 + 0.1],
        [-width / 2 + 0.1, height / 2, depth / 2 - 0.1],
        [width / 2 - 0.1, height / 2, depth / 2 - 0.1],
    ];

    postPositions.forEach(([px, py, pz]) => {
        const post = new THREE.Mesh(postGeo, chromeMat);
        post.position.set(px, py, pz);
        group.add(post);
    });

    const backGlass = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.2, height - 0.6, 0.05),
        glassMat
    );
    backGlass.position.set(0, height / 2, -depth / 2 + 0.1);
    group.add(backGlass);

    const leftGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, height - 0.6, depth - 0.2),
        glassMat
    );
    leftGlass.position.set(-width / 2 + 0.1, height / 2, 0);
    group.add(leftGlass);

    const rightGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, height - 0.6, depth - 0.2),
        glassMat
    );
    rightGlass.position.set(width / 2 - 0.1, height / 2, 0);
    group.add(rightGlass);

    const doorGeo = new THREE.BoxGeometry(width / 2 - 0.15, height - 0.6, 0.05);
    const doorMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        metalness: 0.3,
        roughness: 0.1,
        transmission: 0.85,
        transparent: true,
        opacity: 0.7,
    });

    const doorLeft = new THREE.Mesh(doorGeo, doorMat);
    doorLeft.position.set(-width / 4 + 0.05, height / 2, depth / 2 - 0.1);
    group.add(doorLeft);

    const doorRight = new THREE.Mesh(doorGeo, doorMat);
    doorRight.position.set(width / 4 - 0.05, height / 2, depth / 2 - 0.1);
    group.add(doorRight);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 128);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 120);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 56px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${floor}F ELEVATOR`, 128, 64);
    }
    const indicatorTexture = new THREE.CanvasTexture(canvas);
    const indicatorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.8),
        new THREE.MeshStandardMaterial({
            map: indicatorTexture,
            emissive: new THREE.Color(0x38bdf8),
            emissiveIntensity: 0.8,
        })
    );
    indicatorMesh.position.set(0, height + 0.5, depth / 2 - 0.05);
    group.add(indicatorMesh);

    const light = new THREE.PointLight(0x7dd3fc, 1.8, 10, 1.5);
    light.position.set(0, height - 0.5, 0);
    group.add(light);

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(-width / 2 - 0.2, 0, -depth / 2 - 0.2),
            new THREE.Vector3(width / 2 + 0.2, height, depth / 2 + 0.2)
        ),
        center: new THREE.Vector3(0, height / 2, 0),
        size: new THREE.Vector3(width + 0.4, height, depth + 0.4),
    };

    return { group, obstacle, doorLeft, doorRight, light };
}
