import { getCoverTexture } from '@/lib/bookstoreMaterials';
import { AnimeMedia, BookstoreGenre } from '@/types';
import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface RooftopLayoutResult {
    group: THREE.Group;
    obstacles: BookshelfObstacle[];
    aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[];
    updateRooftopMedia: (trendingAnime: AnimeMedia[], trendingManga: AnimeMedia[]) => void;
    updateSakura: (delta: number) => void;
}

export function createRooftopFloorLayout(): RooftopLayoutResult {
    const group = new THREE.Group();
    const obstacles: BookshelfObstacle[] = [];
    const aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[] = [];
    const podiumMeshes: { mesh: THREE.Mesh; index: number; isManga: boolean }[] = [];

    const roomWidth = 44;
    const roomLength = 44;

    const deckGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const deckMat = new THREE.MeshStandardMaterial({
        color: 0x2e1c14,
        roughness: 0.6,
        metalness: 0.05,
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.rotation.x = -Math.PI / 2;
    deck.receiveShadow = true;
    group.add(deck);

    const stonePathGeo = new THREE.PlaneGeometry(6, roomLength - 8);
    const stonePathMat = new THREE.MeshStandardMaterial({
        color: 0x3f3f46,
        roughness: 0.9,
    });
    const stonePath = new THREE.Mesh(stonePathGeo, stonePathMat);
    stonePath.rotation.x = -Math.PI / 2;
    stonePath.position.set(0, 0.02, 0);
    group.add(stonePath);

    const railMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.6,
    });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 });

    const createRailing = (length: number, pos: [number, number, number], rotY: number) => {
        const railGroup = new THREE.Group();
        const glass = new THREE.Mesh(new THREE.BoxGeometry(length, 1.4, 0.04), railMat);
        glass.position.y = 0.8;
        railGroup.add(glass);

        const cap = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, 0.1), postMat);
        cap.position.y = 1.5;
        railGroup.add(cap);

        for (let x = -length / 2; x <= length / 2; x += 4) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8), postMat);
            post.position.set(x, 0.75, 0);
            railGroup.add(post);
        }

        railGroup.position.set(...pos);
        railGroup.rotation.y = rotY;
        group.add(railGroup);

        obstacles.push({
            box: new THREE.Box3(
                new THREE.Vector3(pos[0] - (rotY === 0 ? length / 2 : 0.4), 0, pos[2] - (rotY === 0 ? 0.4 : length / 2)),
                new THREE.Vector3(pos[0] + (rotY === 0 ? length / 2 : 0.4), 2, pos[2] + (rotY === 0 ? 0.4 : length / 2))
            ),
            center: new THREE.Vector3(pos[0], 1, pos[2]),
            size: new THREE.Vector3(length, 2, 0.8),
        });
    };

    createRailing(roomWidth - 4, [0, 0, -roomLength / 2 + 2], 0);
    createRailing(roomWidth - 4, [0, 0, roomLength / 2 - 2], Math.PI);
    createRailing(roomLength - 4, [-roomWidth / 2 + 2, 0, 0], Math.PI / 2);
    createRailing(roomLength - 4, [roomWidth / 2 - 2, 0, 0], -Math.PI / 2);

    const skylineGroup = new THREE.Group();
    const bldgMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const dist = 55 + Math.random() * 20;
        const bx = Math.sin(angle) * dist;
        const bz = Math.cos(angle) * dist;
        const bw = 6 + Math.random() * 8;
        const bh = 15 + Math.random() * 35;
        const bd = 6 + Math.random() * 8;

        const bldg = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bldgMat);
        bldg.position.set(bx, bh / 2 - 8, bz);
        skylineGroup.add(bldg);

        if (Math.random() > 0.3) {
            const glow = new THREE.PointLight(0x38bdf8, 0.8, 20);
            glow.position.set(bx, bh - 6, bz);
            skylineGroup.add(glow);
        }
    }
    group.add(skylineGroup);

    const podiumPositions: [number, number, number, boolean][] = [
        [-12, 0, -6, false],
        [-6, 0, -10, false],
        [0, 0, -12, false],
        [6, 0, -10, false],
        [12, 0, -6, false],
        [-12, 0, 6, true],
        [-6, 0, 10, true],
        [0, 0, 12, true],
        [6, 0, 10, true],
        [12, 0, 6, true],
    ];

    podiumPositions.forEach(([px, py, pz, isManga], idx) => {
        const pGroup = new THREE.Group();
        pGroup.position.set(px, py, pz);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.4, 0.7, 16),
            new THREE.MeshStandardMaterial({
                color: isManga ? 0xb45309 : 0x0284c7,
                metalness: 0.8,
                roughness: 0.2,
            })
        );
        base.position.y = 0.35;
        base.castShadow = true;
        pGroup.add(base);

        const plaque = new THREE.Mesh(
            new THREE.PlaneGeometry(1.0, 1.4),
            new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.3,
            })
        );
        plaque.position.set(0, 1.5, 0);
        plaque.castShadow = true;
        pGroup.add(plaque);

        const light = new THREE.PointLight(isManga ? 0xfbbf24 : 0x38bdf8, 1.4, 6);
        light.position.set(0, 2.2, 0);
        pGroup.add(light);

        podiumMeshes.push({ mesh: plaque, index: idx % 5, isManga });

        group.add(pGroup);

        obstacles.push({
            box: new THREE.Box3(
                new THREE.Vector3(px - 1.5, 0, pz - 1.5),
                new THREE.Vector3(px + 1.5, 2.5, pz + 1.5)
            ),
            center: new THREE.Vector3(px, 1.25, pz),
            size: new THREE.Vector3(3, 2.5, 3),
        });
    });

    const sakuraCount = 350;
    const sakuraGeo = new THREE.BufferGeometry();
    const sakuraPositions = new Float32Array(sakuraCount * 3);
    const sakuraSpeeds = new Float32Array(sakuraCount * 3);

    for (let i = 0; i < sakuraCount; i++) {
        sakuraPositions[i * 3] = (Math.random() - 0.5) * roomWidth;
        sakuraPositions[i * 3 + 1] = Math.random() * 12 + 0.5;
        sakuraPositions[i * 3 + 2] = (Math.random() - 0.5) * roomLength;

        sakuraSpeeds[i * 3] = Math.random() * 0.8 + 0.4;
        sakuraSpeeds[i * 3 + 1] = Math.random() * 1.2 + 0.8;
        sakuraSpeeds[i * 3 + 2] = Math.random() * 0.6 + 0.3;
    }

    sakuraGeo.setAttribute('position', new THREE.BufferAttribute(sakuraPositions, 3));

    const sakuraCanvas = document.createElement('canvas');
    sakuraCanvas.width = 32;
    sakuraCanvas.height = 32;
    const sCtx = sakuraCanvas.getContext('2d');
    if (sCtx) {
        sCtx.fillStyle = '#f472b6';
        sCtx.beginPath();
        sCtx.ellipse(16, 16, 14, 8, Math.PI / 4, 0, Math.PI * 2);
        sCtx.fill();
    }
    const sakuraTexture = new THREE.CanvasTexture(sakuraCanvas);

    const sakuraMat = new THREE.PointsMaterial({
        size: 0.35,
        map: sakuraTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
    });

    const sakuraParticles = new THREE.Points(sakuraGeo, sakuraMat);
    group.add(sakuraParticles);

    const updateSakura = (delta: number) => {
        const posArr = sakuraGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sakuraCount; i++) {
            posArr[i * 3] += Math.sin(Date.now() * 0.001 + i) * delta * sakuraSpeeds[i * 3];
            posArr[i * 3 + 1] -= delta * sakuraSpeeds[i * 3 + 1];
            posArr[i * 3 + 2] += Math.cos(Date.now() * 0.001 + i) * delta * sakuraSpeeds[i * 3 + 2];

            if (posArr[i * 3 + 1] <= 0.1) {
                posArr[i * 3 + 1] = 12;
                posArr[i * 3] = (Math.random() - 0.5) * roomWidth;
                posArr[i * 3 + 2] = (Math.random() - 0.5) * roomLength;
            }
        }
        sakuraGeo.attributes.position.needsUpdate = true;
    };

    const updateRooftopMedia = (trendingAnime: AnimeMedia[], trendingManga: AnimeMedia[]) => {
        podiumMeshes.forEach(({ mesh, index, isManga }) => {
            const list = isManga ? trendingManga : trendingAnime;
            const media = list[index % list.length];
            if (!media) return;

            const tex = getCoverTexture(media.coverImage.large || media.coverImage.medium);
            if (tex) {
                mesh.material = new THREE.MeshStandardMaterial({
                    map: tex,
                    roughness: 0.3,
                });
            }
            mesh.userData = { media, isPodium: true };
        });
    };

    return {
        group,
        obstacles,
        aislePositions,
        updateRooftopMedia,
        updateSakura,
    };
}
