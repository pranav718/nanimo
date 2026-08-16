import * as THREE from 'three';

export interface BookshelfSlot {
    shelfIndex: number;
    position: THREE.Vector3;
    rotationY: number;
}

export interface BookshelfObstacle {
    box: THREE.Box3;
    center: THREE.Vector3;
    size: THREE.Vector3;
}

export function createBookshelfUnit(options?: {
    width?: number;
    height?: number;
    depth?: number;
    shelvesCount?: number;
}): {
    mesh: THREE.Group;
    slots: BookshelfSlot[];
    obstacle: BookshelfObstacle;
} {
    const width = options?.width || 4.2;
    const height = options?.height || 3.4;
    const depth = options?.depth || 0.85;
    const shelvesCount = options?.shelvesCount || 4;

    const group = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x3d2314,
        roughness: 0.5,
        metalness: 0.05,
    });

    const trimMat = new THREE.MeshStandardMaterial({
        color: 0x22130b,
        roughness: 0.4,
        metalness: 0.1,
    });

    const sideThickness = 0.08;
    const sideGeo = new THREE.BoxGeometry(sideThickness, height, depth);

    const leftSide = new THREE.Mesh(sideGeo, woodMat);
    leftSide.position.set(-width / 2 + sideThickness / 2, height / 2, 0);
    leftSide.castShadow = true;
    group.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, woodMat);
    rightSide.position.set(width / 2 - sideThickness / 2, height / 2, 0);
    rightSide.castShadow = true;
    group.add(rightSide);

    const middleSide = new THREE.Mesh(sideGeo, woodMat);
    middleSide.position.set(0, height / 2, 0);
    middleSide.castShadow = true;
    group.add(middleSide);

    const backGeo = new THREE.BoxGeometry(width, height, 0.04);
    const backPanel = new THREE.Mesh(backGeo, woodMat);
    backPanel.position.set(0, height / 2, 0);
    group.add(backPanel);

    const baseGeo = new THREE.BoxGeometry(width + 0.1, 0.25, depth + 0.1);
    const baseMesh = new THREE.Mesh(baseGeo, trimMat);
    baseMesh.position.set(0, 0.125, 0);
    group.add(baseMesh);

    const topGeo = new THREE.BoxGeometry(width + 0.15, 0.2, depth + 0.15);
    const topMesh = new THREE.Mesh(topGeo, trimMat);
    topMesh.position.set(0, height - 0.1, 0);
    group.add(topMesh);

    const shelfThickness = 0.05;
    const shelfGeo = new THREE.BoxGeometry(width - sideThickness * 2, shelfThickness, depth - 0.05);

    const slots: BookshelfSlot[] = [];
    const usableHeight = height - 0.5;
    const shelfSpacing = usableHeight / shelvesCount;

    for (let i = 0; i < shelvesCount; i++) {
        const shelfY = 0.3 + i * shelfSpacing;
        const shelfMesh = new THREE.Mesh(shelfGeo, woodMat);
        shelfMesh.position.set(0, shelfY, 0);
        shelfMesh.castShadow = true;
        shelfMesh.receiveShadow = true;
        group.add(shelfMesh);

        const booksPerSide = 6;
        for (let side = -1; side <= 1; side += 2) {
            const zOffset = (side * (depth / 4));
            for (let b = 0; b < booksPerSide; b++) {
                const xOffset = -width / 2 + 0.4 + (b * ((width - 0.8) / (booksPerSide - 1)));
                slots.push({
                    shelfIndex: i,
                    position: new THREE.Vector3(xOffset, shelfY + 0.22, zOffset),
                    rotationY: side === 1 ? 0 : Math.PI,
                });
            }
        }
    }

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(-width / 2 - 0.2, 0, -depth / 2 - 0.2),
            new THREE.Vector3(width / 2 + 0.2, height, depth / 2 + 0.2)
        ),
        center: new THREE.Vector3(0, height / 2, 0),
        size: new THREE.Vector3(width + 0.4, height, depth + 0.4),
    };

    return { mesh: group, slots, obstacle };
}
