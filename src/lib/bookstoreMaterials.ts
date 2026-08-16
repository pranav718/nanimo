import { BookstoreGenre } from '@/types';
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();

export function createWoodFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankCount = 16;
    const plankHeight = 1024 / plankCount;

    for (let i = 0; i < plankCount; i++) {
        const y = i * plankHeight;
        const shade = Math.sin(i * 1.5) * 12;
        const r = Math.min(255, Math.max(0, 52 + shade));
        const g = Math.min(255, Math.max(0, 32 + shade * 0.7));
        const b = Math.min(255, Math.max(0, 22 + shade * 0.5));
        
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, y, 1024, plankHeight);

        for (let gIdx = 0; gIdx < 80; gIdx++) {
            ctx.fillStyle = `rgba(0, 0, 0, ${0.03 + Math.random() * 0.04})`;
            const gy = y + Math.random() * plankHeight;
            const gh = 1 + Math.random() * 2;
            ctx.fillRect(0, gy, 1024, gh);
        }

        ctx.fillStyle = 'rgba(10, 5, 3, 0.7)';
        ctx.fillRect(0, y + plankHeight - 2, 1024, 2);

        const stagger = (i % 2) * 512;
        ctx.fillRect((stagger + 256) % 1024, y, 2, plankHeight);
        ctx.fillRect((stagger + 768) % 1024, y, 2, plankHeight);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

export function createCarpetTexture(primaryColor: string, secondaryColor: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = secondaryColor;
    for (let x = 0; x < 512; x += 16) {
        for (let y = 0; y < 512; y += 16) {
            if ((x / 16 + y / 16) % 2 === 0) {
                ctx.fillRect(x, y, 16, 16);
            }
        }
    }

    for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
}

export function getGenreColor(genre: BookstoreGenre): { hex: string; threeColor: THREE.Color } {
    const colorMap: Record<BookstoreGenre, string> = {
        Romance: '#ff3366',
        Action: '#3388ff',
        Fantasy: '#ffaa00',
        'Sci-Fi': '#00ffee',
        Mystery: '#9933ff',
        'Slice of Life': '#00ff88',
    };
    const hex = colorMap[genre] || '#ffffff';
    return { hex, threeColor: new THREE.Color(hex) };
}

export function createNeonSignMaterial(genre: BookstoreGenre): THREE.MeshStandardMaterial {
    const { threeColor } = getGenreColor(genre);
    return new THREE.MeshStandardMaterial({
        color: threeColor,
        emissive: threeColor,
        emissiveIntensity: 1.8,
        roughness: 0.1,
        metalness: 0.2,
    });
}

export function getCoverTexture(url: string | null): THREE.Texture | null {
    if (!url) return null;
    if (textureCache.has(url)) {
        return textureCache.get(url)!;
    }
    const texture = textureLoader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(url, texture);
    return texture;
}

export function createBookSpineFallbackTexture(title: string, colorHex: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = colorHex || '#1e293b';
    ctx.fillRect(0, 0, 128, 512);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 0, 128, 20);
    ctx.fillRect(0, 492, 128, 20);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px sans-serif';
    ctx.save();
    ctx.translate(64, 256);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title.slice(0, 24), 0, 0);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
}
