import { getCoverTexture } from '@/lib/bookstoreMaterials';
import { AnimeMedia } from '@/types';
import * as THREE from 'three';
import { BookshelfObstacle } from './BookshelfGeometry';

export interface PersonalShelfResult {
    group: THREE.Group;
    obstacle: BookshelfObstacle;
    updateSavedBooks: (savedMedia: AnimeMedia[]) => void;
    getInteractiveMeshes: () => THREE.Mesh[];
}

export function createPersonalShelf(pos: [number, number, number]): PersonalShelfResult {
    const group = new THREE.Group();
    group.position.set(...pos);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.4,
        metalness: 0.1,
    });

    const trimMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.8,
        roughness: 0.2,
    });

    const width = 3.2;
    const height = 3.0;
    const depth = 0.7;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), woodMat);
    frame.position.y = height / 2;
    frame.castShadow = true;
    group.add(frame);

    const cutout = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.3, height - 0.4, depth + 0.1),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 })
    );
    cutout.position.y = height / 2;
    group.add(cutout);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 96;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 96);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 88);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MY SHELF 私の棚', 128, 44);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('SAVED FAVORITES', 128, 72);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 0.05),
        new THREE.MeshStandardMaterial({
            map: signTexture,
            emissive: new THREE.Color(0xfbbf24),
            emissiveIntensity: 0.6,
        })
    );
    signMesh.position.set(0, height + 0.35, 0);
    group.add(signMesh);

    const lampMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfbbf24, emissiveIntensity: 1.2 });
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8), trimMat);
    lampPost.position.set(width / 2 + 0.6, 1.4, 0);
    group.add(lampPost);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 16), lampMat);
    lampShade.position.set(width / 2 + 0.6, 2.7, 0);
    group.add(lampShade);

    const lampLight = new THREE.PointLight(0xfef08a, 1.5, 8);
    lampLight.position.set(width / 2 + 0.6, 2.5, 0.2);
    group.add(lampLight);

    const bookMeshes: THREE.Mesh[] = [];
    const booksGroup = new THREE.Group();
    group.add(booksGroup);

    const updateSavedBooks = (savedMedia: AnimeMedia[]) => {
        while (booksGroup.children.length > 0) {
            const obj = booksGroup.children[0];
            booksGroup.remove(obj);
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
            }
        }
        bookMeshes.length = 0;

        const maxDisplay = 10;
        const displayList = savedMedia.slice(0, maxDisplay);

        displayList.forEach((media, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;

            const bx = -1.0 + col * 0.5;
            const by = 0.9 + row * 1.0;
            const bz = depth / 4;

            const tex = getCoverTexture(media.coverImage.large || media.coverImage.medium);
            const bookGeo = new THREE.BoxGeometry(0.32, 0.48, 0.09);
            const bookMat = tex
                ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 })
                : new THREE.MeshStandardMaterial({ color: 0xfbbf24 });

            const mesh = new THREE.Mesh(bookGeo, bookMat);
            mesh.position.set(bx, by, bz);
            mesh.castShadow = true;
            mesh.userData = { media, isBook: true, isPersonalShelf: true };

            booksGroup.add(mesh);
            bookMeshes.push(mesh);
        });
    };

    const obstacle: BookshelfObstacle = {
        box: new THREE.Box3(
            new THREE.Vector3(pos[0] - width / 2 - 0.2, 0, pos[2] - depth / 2 - 0.2),
            new THREE.Vector3(pos[0] + width / 2 + 0.8, 3.2, pos[2] + depth / 2 + 0.2)
        ),
        center: new THREE.Vector3(pos[0], 1.5, pos[2]),
        size: new THREE.Vector3(width + 1.0, 3.2, depth + 0.4),
    };

    return {
        group,
        obstacle,
        updateSavedBooks,
        getInteractiveMeshes: () => bookMeshes,
    };
}
