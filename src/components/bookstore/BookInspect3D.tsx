'use client';

import { getCoverTexture } from '@/lib/bookstoreMaterials';
import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BookInspect3D() {
    const { inspectedMedia, setInspectedMedia } = useBookstoreStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const bookGroupRef = useRef<THREE.Group | null>(null);
    const frontCoverPivotRef = useRef<THREE.Group | null>(null);
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);
    const openProgressRef = useRef(0);

    const handleClose = useCallback(() => {
        setInspectedMedia(null);
    }, [setInspectedMedia]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    useEffect(() => {
        if (!inspectedMedia || !containerRef.current) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
        camera.position.set(0, 0, 3.2);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
        keyLight.position.set(4, 6, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x90b0ff, 0.8);
        fillLight.position.set(-4, -2, -3);
        scene.add(fillLight);

        const bookGroup = new THREE.Group();
        bookGroupRef.current = bookGroup;
        bookGroup.rotation.y = -0.3;
        bookGroup.rotation.x = 0.1;
        scene.add(bookGroup);

        const bookWidth = 1.3;
        const bookHeight = 1.85;
        const bookThickness = 0.22;

        const coverTexture = getCoverTexture(inspectedMedia.coverImage.extraLarge || inspectedMedia.coverImage.large);
        const coverMat = coverTexture
            ? new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.35 })
            : new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });

        const pageMat = new THREE.MeshStandardMaterial({ color: 0xfbf7ee, roughness: 0.8 });
        const spineMat = new THREE.MeshStandardMaterial({
            color: inspectedMedia.coverImage.color ? new THREE.Color(inspectedMedia.coverImage.color) : 0x1e293b,
            roughness: 0.4,
        });

        const bodyGeo = new THREE.BoxGeometry(bookWidth, bookHeight, bookThickness);
        const bodyMesh = new THREE.Mesh(bodyGeo, [
            pageMat,
            spineMat,
            pageMat,
            pageMat,
            pageMat,
            coverMat,
        ]);
        bodyMesh.position.set(0, 0, -bookThickness / 2);
        bookGroup.add(bodyMesh);

        const frontCoverPivot = new THREE.Group();
        frontCoverPivot.position.set(-bookWidth / 2, 0, bookThickness / 2);
        frontCoverPivotRef.current = frontCoverPivot;

        const frontCoverMesh = new THREE.Mesh(
            new THREE.BoxGeometry(bookWidth, bookHeight, 0.02),
            [spineMat, spineMat, spineMat, spineMat, coverMat, pageMat]
        );
        frontCoverMesh.position.set(bookWidth / 2, 0, 0);
        frontCoverPivot.add(frontCoverMesh);
        bookGroup.add(frontCoverPivot);

        const onMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = true;
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !bookGroupRef.current) return;
            const dx = e.clientX - lastMouseRef.current.x;
            const dy = e.clientY - lastMouseRef.current.y;

            bookGroupRef.current.rotation.y += dx * 0.01;
            bookGroupRef.current.rotation.x = THREE.MathUtils.clamp(
                bookGroupRef.current.rotation.x + dy * 0.01,
                -0.8,
                0.8
            );

            lastMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => {
            isDraggingRef.current = false;
        };

        const el = containerRef.current;
        el.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        openProgressRef.current = 0;

        const animate = () => {
            if (frontCoverPivotRef.current && openProgressRef.current < 1) {
                openProgressRef.current = Math.min(1, openProgressRef.current + 0.04);
                const eased = 1 - Math.pow(1 - openProgressRef.current, 3);
                frontCoverPivotRef.current.rotation.y = -eased * 1.8;
            }

            if (!isDraggingRef.current && bookGroupRef.current) {
                bookGroupRef.current.position.y = Math.sin(performance.now() * 0.002) * 0.04;
            }

            renderer.render(scene, camera);
            animFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (renderer.domElement && el.contains(renderer.domElement)) {
                el.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [inspectedMedia]);

    if (!inspectedMedia) return null;

    const title = inspectedMedia.title.english || inspectedMedia.title.romaji || 'Unknown Title';
    const score = inspectedMedia.averageScore ? `${inspectedMedia.averageScore}%` : 'N/A';
    const cleanDesc = inspectedMedia.description?.replace(/<[^>]*>?/gm, '') || 'No synopsis available.';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-5xl h-[85vh] rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-black/60 p-6 md:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all"
                >
                    ✕
                </button>

                <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <div ref={containerRef} className="w-full h-full" />
                    <span className="absolute bottom-2 text-[11px] tracking-widest text-white/30 uppercase pointer-events-none">
                        Drag to rotate 3D volume
                    </span>
                </div>

                <div className="flex flex-col justify-between w-full md:w-1/2 h-1/2 md:h-full pl-0 md:pl-8 pt-4 md:pt-0 overflow-y-auto">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-0.5 text-xs font-semibold tracking-wider text-amber-300">
                                Score: {score}
                            </span>
                            {inspectedMedia.format && (
                                <span className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-medium text-white/70">
                                    {inspectedMedia.format}
                                </span>
                            )}
                            {inspectedMedia.chapters && (
                                <span className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-medium text-white/70">
                                    {inspectedMedia.chapters} Chs
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white/95">
                            {title}
                        </h2>

                        {inspectedMedia.title.native && (
                            <p className="text-sm font-medium text-white/40">
                                {inspectedMedia.title.native}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 my-1">
                            {inspectedMedia.genres.map((g) => (
                                <span
                                    key={g}
                                    className="rounded-md bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/60"
                                >
                                    {g}
                                </span>
                            ))}
                        </div>

                        <p className="text-xs md:text-sm leading-relaxed text-white/70 line-clamp-6 md:line-clamp-8">
                            {cleanDesc}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10">
                        <a
                            href={`https://anilist.co/manga/${inspectedMedia.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
                        >
                            View on AniList
                        </a>
                        <button
                            onClick={handleClose}
                            className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all"
                        >
                            Back to Store
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
