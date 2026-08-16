import { getGenreColor } from '@/lib/bookstoreMaterials';
import { BookstoreGenre } from '@/types';
import * as THREE from 'three';
import { BookshelfObstacle, BookshelfSlot, createBookshelfUnit } from './BookshelfGeometry';

export interface GenreAisleConfig {
    genre: BookstoreGenre;
    titleEnglish: string;
    titleJapanese: string;
    position: [number, number, number];
    rotationY: number;
}

export interface AisleLayoutResult {
    group: THREE.Group;
    obstacles: BookshelfObstacle[];
    genreSlots: Record<BookstoreGenre, BookshelfSlot[]>;
    aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[];
}

export function createNeonSignTexture(english: string, japanese: string, colorHex: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#0a0808';
    ctx.fillRect(0, 0, 512, 160);

    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 144);

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, 484, 132);

    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 18;

    ctx.fillStyle = colorHex;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(english.toUpperCase(), 256, 56);

    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(japanese, 256, 108);

    return new THREE.CanvasTexture(canvas);
}

export function createAisleOverheadSign(
    english: string,
    japanese: string,
    genre: BookstoreGenre
): THREE.Group {
    const signGroup = new THREE.Group();
    const { hex, threeColor } = getGenreColor(genre);

    const texture = createNeonSignTexture(english, japanese, hex);
    const signGeo = new THREE.BoxGeometry(3.2, 1.0, 0.12);
    const signMat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: threeColor,
        emissiveIntensity: 0.7,
        roughness: 0.2,
    });

    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.y = 0;
    signGroup.add(signMesh);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8);

    const leftPole = new THREE.Mesh(poleGeo, poleMat);
    leftPole.position.set(-1.4, 0.9, 0);
    signGroup.add(leftPole);

    const rightPole = new THREE.Mesh(poleGeo, poleMat);
    rightPole.position.set(1.4, 0.9, 0);
    signGroup.add(rightPole);

    const pointLight = new THREE.PointLight(threeColor, 1.2, 8, 1.5);
    pointLight.position.set(0, -0.5, 0.5);
    signGroup.add(pointLight);

    return signGroup;
}

export function createMangaFloorLayout(): AisleLayoutResult {
    const group = new THREE.Group();
    const obstacles: BookshelfObstacle[] = [];
    const aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[] = [];

    const genreSlots: Record<BookstoreGenre, BookshelfSlot[]> = {
        Romance: [],
        Action: [],
        Fantasy: [],
        'Sci-Fi': [],
        Mystery: [],
        'Slice of Life': [],
    };

    const aisles: GenreAisleConfig[] = [
        { genre: 'Romance', titleEnglish: 'Romance', titleJapanese: '恋愛', position: [-13, 0, 10], rotationY: 0 },
        { genre: 'Slice of Life', titleEnglish: 'Slice of Life', titleJapanese: '日常', position: [-13, 0, 0], rotationY: 0 },
        { genre: 'Mystery', titleEnglish: 'Mystery / Seinen', titleJapanese: '推理', position: [-13, 0, -10], rotationY: 0 },
        { genre: 'Action', titleEnglish: 'Action / Shonen', titleJapanese: '少年', position: [13, 0, 10], rotationY: 0 },
        { genre: 'Fantasy', titleEnglish: 'Fantasy / Isekai', titleJapanese: '異世界', position: [13, 0, 0], rotationY: 0 },
        { genre: 'Sci-Fi', titleEnglish: 'Sci-Fi / Cyber', titleJapanese: 'SF', position: [13, 0, -10], rotationY: 0 },
    ];

    aisles.forEach((aisle) => {
        const [ax, ay, az] = aisle.position;
        const aisleGroup = new THREE.Group();
        aisleGroup.position.set(ax, ay, az);

        aislePositions.push({
            genre: aisle.genre,
            position: new THREE.Vector3(ax, ay, az),
        });

        const shelfSpacingZ = 2.4;

        const shelf1 = createBookshelfUnit();
        shelf1.mesh.position.set(0, 0, -shelfSpacingZ / 2);
        shelf1.mesh.rotation.y = aisle.rotationY;
        aisleGroup.add(shelf1.mesh);

        const shelf1WorldObstacle: BookshelfObstacle = {
            box: new THREE.Box3(
                new THREE.Vector3(ax - 2.3, 0, az - shelfSpacingZ / 2 - 0.6),
                new THREE.Vector3(ax + 2.3, 3.5, az - shelfSpacingZ / 2 + 0.6)
            ),
            center: new THREE.Vector3(ax, 1.7, az - shelfSpacingZ / 2),
            size: new THREE.Vector3(4.6, 3.4, 1.2),
        };
        obstacles.push(shelf1WorldObstacle);

        shelf1.slots.forEach((s) => {
            genreSlots[aisle.genre].push({
                ...s,
                position: s.position.clone().add(new THREE.Vector3(ax, ay, az - shelfSpacingZ / 2)),
            });
        });

        const shelf2 = createBookshelfUnit();
        shelf2.mesh.position.set(0, 0, shelfSpacingZ / 2);
        shelf2.mesh.rotation.y = aisle.rotationY;
        aisleGroup.add(shelf2.mesh);

        const shelf2WorldObstacle: BookshelfObstacle = {
            box: new THREE.Box3(
                new THREE.Vector3(ax - 2.3, 0, az + shelfSpacingZ / 2 - 0.6),
                new THREE.Vector3(ax + 2.3, 3.5, az + shelfSpacingZ / 2 + 0.6)
            ),
            center: new THREE.Vector3(ax, 1.7, az + shelfSpacingZ / 2),
            size: new THREE.Vector3(4.6, 3.4, 1.2),
        };
        obstacles.push(shelf2WorldObstacle);

        shelf2.slots.forEach((s) => {
            genreSlots[aisle.genre].push({
                ...s,
                position: s.position.clone().add(new THREE.Vector3(ax, ay, az + shelfSpacingZ / 2)),
            });
        });

        const overheadSign = createAisleOverheadSign(aisle.titleEnglish, aisle.titleJapanese, aisle.genre);
        overheadSign.position.set(0, 4.4, 0);
        aisleGroup.add(overheadSign);

        group.add(aisleGroup);
    });

    return { group, obstacles, genreSlots, aislePositions };
}
