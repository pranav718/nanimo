import { getCoverTexture, getGenreColor } from '@/lib/bookstoreMaterials';
import { AnimeMedia, BookstoreGenre } from '@/types';
import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';
import { createAisleOverheadSign } from './MangaFloorLayout';

export interface AnimeSlot {
    position: THREE.Vector3;
    rotationY: number;
    genre: BookstoreGenre;
}

export interface AnimeFloorLayoutResult {
    group: THREE.Group;
    obstacles: BookshelfObstacle[];
    aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[];
    updateAnimePosters: (animeGenres: Record<BookstoreGenre, AnimeMedia[]>, trending: AnimeMedia[]) => void;
    screenMesh: THREE.Mesh;
}

export function createAnimeFloorLayout(): AnimeFloorLayoutResult {
    const group = new THREE.Group();
    const obstacles: BookshelfObstacle[] = [];
    const aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[] = [];
    const posterMeshes: { mesh: THREE.Mesh; genre: BookstoreGenre; index: number }[] = [];

    const screenWidth = 16;
    const screenHeight = 6.8;
    const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight, 32, 1);
    
    const posAttr = screenGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const curve = (x * x) * 0.02;
        posAttr.setZ(i, -curve);
    }
    screenGeo.computeVertexNormals();

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 512;
    const sCtx = screenCanvas.getContext('2d');
    if (sCtx) {
        sCtx.fillStyle = '#050508';
        sCtx.fillRect(0, 0, 1024, 512);
        sCtx.strokeStyle = '#38bdf8';
        sCtx.lineWidth = 8;
        sCtx.strokeRect(10, 10, 1004, 492);
        sCtx.fillStyle = '#38bdf8';
        sCtx.font = 'bold 44px sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('NANIMO ANIME SCREENING LOUNGE', 512, 230);
        sCtx.fillStyle = 'rgba(255,255,255,0.7)';
        sCtx.font = '28px sans-serif';
        sCtx.fillText('CLICK TO INSPECT FEATURED ANIME TRAILERS', 512, 290);
    }
    const screenTexture = new THREE.CanvasTexture(screenCanvas);

    const screenMat = new THREE.MeshStandardMaterial({
        map: screenTexture,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.5,
        roughness: 0.2,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 4.2, -15);
    screenMesh.userData = { isCinemaScreen: true };
    group.add(screenMesh);

    const screenSpot = new THREE.SpotLight(0x38bdf8, 4, 30, Math.PI / 4, 0.4);
    screenSpot.position.set(0, 7, -10);
    screenSpot.target = screenMesh;
    group.add(screenSpot);

    const createCouch = (x: number, z: number, rotY: number) => {
        const couchGroup = new THREE.Group();
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.7 });
        const cushionMat = new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.6 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 1.4), leatherMat);
        base.position.y = 0.225;
        base.castShadow = true;
        couchGroup.add(base);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 1.2), cushionMat);
        seat.position.set(0, 0.45, 0.05);
        couchGroup.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 0.35), leatherMat);
        back.position.set(0, 0.8, -0.55);
        back.castShadow = true;
        couchGroup.add(back);

        couchGroup.position.set(x, 0, z);
        couchGroup.rotation.y = rotY;
        group.add(couchGroup);

        obstacles.push({
            box: new THREE.Box3(
                new THREE.Vector3(x - 2.3, 0, z - 0.9),
                new THREE.Vector3(x + 2.3, 1.5, z + 0.9)
            ),
            center: new THREE.Vector3(x, 0.75, z),
            size: new THREE.Vector3(4.6, 1.5, 1.8),
        });
    };

    createCouch(-5.5, -7, 0.1);
    createCouch(5.5, -7, -0.1);
    createCouch(0, -3, 0);

    const genres: { genre: BookstoreGenre; titleEn: string; titleJp: string; pos: [number, number, number] }[] = [
        { genre: 'Action', titleEn: 'Action & Shonen', titleJp: '少年アニメ', pos: [-13, 0, 8] },
        { genre: 'Romance', titleEn: 'Romance Lounge', titleJp: '恋愛アニメ', pos: [-13, 0, -2] },
        { genre: 'Fantasy', titleEn: 'Fantasy & Isekai', titleJp: '異世界アニメ', pos: [13, 0, 8] },
        { genre: 'Sci-Fi', titleEn: 'Sci-Fi Pod', titleJp: 'SFアニメ', pos: [13, 0, -2] },
        { genre: 'Mystery', titleEn: 'Psychological & Seinen', titleJp: '青年アニメ', pos: [-13, 0, 16] },
        { genre: 'Slice of Life', titleEn: 'Slice of Life & Chill', titleJp: '日常アニメ', pos: [13, 0, 16] },
    ];

    genres.forEach((g) => {
        const [gx, gy, gz] = g.pos;
        const boothGroup = new THREE.Group();
        boothGroup.position.set(gx, gy, gz);

        aislePositions.push({ genre: g.genre, position: new THREE.Vector3(gx, gy, gz) });

        const kioskGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.4, 16);
        const kioskMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 });
        const kioskBase = new THREE.Mesh(kioskGeo, kioskMat);
        kioskBase.position.y = 0.2;
        boothGroup.add(kioskBase);

        const { threeColor } = getGenreColor(g.genre);
        const ringLight = new THREE.PointLight(threeColor, 1.5, 9, 1.5);
        ringLight.position.set(0, 2.5, 0);
        boothGroup.add(ringLight);

        const posterCount = 4;
        for (let p = 0; p < posterCount; p++) {
            const angle = (p / posterCount) * Math.PI * 2;
            const px = Math.sin(angle) * 1.35;
            const pz = Math.cos(angle) * 1.35;

            const posterGeo = new THREE.PlaneGeometry(0.9, 1.35);
            const posterMat = new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.3,
            });
            const posterMesh = new THREE.Mesh(posterGeo, posterMat);
            posterMesh.position.set(px, 1.6, pz);
            posterMesh.rotation.y = angle + Math.PI;
            posterMesh.castShadow = true;
            boothGroup.add(posterMesh);

            posterMeshes.push({
                mesh: posterMesh,
                genre: g.genre,
                index: p,
            });
        }

        const sign = createAisleOverheadSign(g.titleEn, g.titleJp, g.genre);
        sign.position.set(0, 3.8, 0);
        boothGroup.add(sign);

        group.add(boothGroup);

        obstacles.push({
            box: new THREE.Box3(
                new THREE.Vector3(gx - 2.1, 0, gz - 2.1),
                new THREE.Vector3(gx + 2.1, 3.2, gz + 2.1)
            ),
            center: new THREE.Vector3(gx, 1.6, gz),
            size: new THREE.Vector3(4.2, 3.2, 4.2),
        });
    });

    const updateAnimePosters = (
        animeGenres: Record<BookstoreGenre, AnimeMedia[]>,
        trending: AnimeMedia[]
    ) => {
        posterMeshes.forEach(({ mesh, genre, index }) => {
            const list = animeGenres[genre] || [];
            const media = list[index % list.length];
            if (!media) return;

            const tex = getCoverTexture(media.coverImage.large || media.coverImage.medium);
            if (tex) {
                mesh.material = new THREE.MeshStandardMaterial({
                    map: tex,
                    roughness: 0.3,
                });
            }
            mesh.userData = { media, genre, isAnimePoster: true };
        });

        if (trending && trending.length > 0) {
            const topAnime = trending[0];
            const bannerUrl = topAnime.bannerImage || topAnime.coverImage.extraLarge;
            const bannerTex = getCoverTexture(bannerUrl);
            if (bannerTex) {
                screenMat.map = bannerTex;
                screenMat.needsUpdate = true;
                screenMesh.userData = { media: topAnime, isCinemaScreen: true };
            }
        }
    };

    return {
        group,
        obstacles,
        aislePositions,
        updateAnimePosters,
        screenMesh,
    };
}
