import { createBookSpineFallbackTexture, getCoverTexture, getGenreColor } from '@/lib/bookstoreMaterials';
import { AnimeMedia, BookstoreGenre } from '@/types';
import * as THREE from 'three';
import { BookshelfSlot } from './BookshelfGeometry';

export interface InteractiveBookItem {
    mesh: THREE.Mesh;
    media: AnimeMedia;
    genre: BookstoreGenre;
    originalPosition: THREE.Vector3;
    originalRotation: THREE.Euler;
}

export class DynamicBooksManager {
    public group: THREE.Group;
    public books: InteractiveBookItem[];
    private bookGeometry: THREE.BoxGeometry;
    private pageMaterial: THREE.MeshStandardMaterial;

    constructor() {
        this.group = new THREE.Group();
        this.books = [];
        this.bookGeometry = new THREE.BoxGeometry(0.32, 0.46, 0.08);
        this.pageMaterial = new THREE.MeshStandardMaterial({
            color: 0xf3ede2,
            roughness: 0.9,
        });
    }

    public populateBooks(
        genreSlots: Record<BookstoreGenre, BookshelfSlot[]>,
        mangaGenres: Record<BookstoreGenre, AnimeMedia[]>
    ) {
        while (this.group.children.length > 0) {
            const obj = this.group.children[0];
            this.group.remove(obj);
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                if (Array.isArray(obj.material)) {
                    obj.material.forEach((m) => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
        this.books = [];

        const genres = Object.keys(genreSlots) as BookstoreGenre[];

        genres.forEach((genre) => {
            const slots = genreSlots[genre] || [];
            const mediaList = mangaGenres[genre] || [];
            if (mediaList.length === 0 || slots.length === 0) return;

            slots.forEach((slot, index) => {
                const media = mediaList[index % mediaList.length];
                if (!media) return;

                const { hex, threeColor } = getGenreColor(genre);
                const titleStr = media.title.english || media.title.romaji || 'Manga';

                const coverTexture = getCoverTexture(media.coverImage.large || media.coverImage.medium);
                const spineTexture = createBookSpineFallbackTexture(titleStr, media.coverImage.color || hex);

                const coverMat = coverTexture
                    ? new THREE.MeshStandardMaterial({
                        map: coverTexture,
                        roughness: 0.35,
                        metalness: 0.05,
                    })
                    : new THREE.MeshStandardMaterial({
                        color: threeColor,
                        roughness: 0.4,
                    });

                const spineMat = new THREE.MeshStandardMaterial({
                    map: spineTexture,
                    roughness: 0.4,
                });

                const backMat = new THREE.MeshStandardMaterial({
                    color: 0x18181b,
                    roughness: 0.5,
                });

                const materials: THREE.Material[] = [
                    this.pageMaterial,
                    spineMat,
                    this.pageMaterial,
                    this.pageMaterial,
                    coverMat,
                    backMat,
                ];

                const bookMesh = new THREE.Mesh(this.bookGeometry, materials);
                bookMesh.position.copy(slot.position);
                bookMesh.rotation.y = slot.rotationY;
                bookMesh.castShadow = true;
                bookMesh.receiveShadow = true;

                bookMesh.userData = {
                    media,
                    genre,
                    isBook: true,
                };

                this.group.add(bookMesh);
                this.books.push({
                    mesh: bookMesh,
                    media,
                    genre,
                    originalPosition: slot.position.clone(),
                    originalRotation: bookMesh.rotation.clone(),
                });
            });
        });
    }

    public getInteractiveMeshes(): THREE.Mesh[] {
        return this.books.map((b) => b.mesh);
    }
}
