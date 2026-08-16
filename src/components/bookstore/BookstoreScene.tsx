'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AnimeFloorLayoutResult, createAnimeFloorLayout } from './AnimeFloorLayout';
import { createBookstoreEnvironment } from './BookstoreEnvironment';
import { CharacterController } from './CharacterController';
import { DynamicBooksManager } from './DynamicBooksManager';
import { createElevator, ElevatorResult } from './ElevatorTransit';
import { createMangaFloorLayout } from './MangaFloorLayout';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import TouchJoystick from './TouchJoystick';

export default function BookstoreScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraControllerRef = useRef<ThirdPersonCamera | null>(null);
    const characterRef = useRef<CharacterController | null>(null);
    const booksManagerRef = useRef<DynamicBooksManager | null>(null);
    const mangaLayoutRef = useRef<THREE.Group | null>(null);
    const animeLayoutRef = useRef<AnimeFloorLayoutResult | null>(null);
    const elevatorRef = useRef<ElevatorResult | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(performance.now());
    const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const {
        loadBookstoreData,
        proximityTarget,
        setInspectedMedia,
        mangaGenres,
        animeGenres,
        trendingAnime,
        currentFloor,
        setCurrentFloor,
    } = useBookstoreStore();

    const handleInteract = useCallback(() => {
        const store = useBookstoreStore.getState();
        const target = store.proximityTarget;
        if (!target) return;

        if (target.type === 'shelf' && target.genre) {
            if (store.currentFloor === 1) {
                const mediaList = store.mangaGenres[target.genre];
                if (mediaList && mediaList.length > 0) {
                    setInspectedMedia(mediaList[0]);
                }
            } else {
                const mediaList = store.animeGenres[target.genre];
                if (mediaList && mediaList.length > 0) {
                    setInspectedMedia(mediaList[0]);
                }
            }
        } else if (target.type === 'elevator') {
            const nextFloor = store.currentFloor === 1 ? 2 : 1;
            store.setCurrentFloor(nextFloor);
            if (characterRef.current) {
                characterRef.current.teleport(new THREE.Vector3(0, 0, 14));
            }
        }
    }, [setInspectedMedia]);

    useEffect(() => {
        loadBookstoreData();
    }, [loadBookstoreData]);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0808);
        scene.fog = new THREE.FogExp2(0x0a0808, 0.018);
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const cameraController = new ThirdPersonCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        cameraControllerRef.current = cameraController;

        const env = createBookstoreEnvironment();
        scene.add(env.group);

        const elevator = createElevator(currentFloor);
        elevator.group.position.set(0, 0, -18);
        scene.add(elevator.group);
        elevatorRef.current = elevator;

        const mangaLayout = createMangaFloorLayout();
        mangaLayoutRef.current = mangaLayout.group;
        scene.add(mangaLayout.group);

        const animeLayout = createAnimeFloorLayout();
        animeLayoutRef.current = animeLayout;
        animeLayout.group.visible = false;
        scene.add(animeLayout.group);

        const booksManager = new DynamicBooksManager();
        scene.add(booksManager.group);
        booksManagerRef.current = booksManager;

        const allObstacles = [elevator.obstacle, ...mangaLayout.obstacles];
        const spawnPos = new THREE.Vector3(0, 0, 14);
        const character = new CharacterController(
            spawnPos,
            env.bounds,
            allObstacles,
            mangaLayout.aislePositions
        );
        character.setOnInteract(handleInteract);
        scene.add(character.avatar.group);
        characterRef.current = character;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onPointerDown = (e: MouseEvent) => {
            pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
        };

        const onPointerUp = (e: MouseEvent) => {
            const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
            const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
            if (dx > 6 || dy > 6) return;

            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, cameraController.camera);

            const floor = useBookstoreStore.getState().currentFloor;

            if (floor === 1 && booksManagerRef.current) {
                const bookMeshes = booksManagerRef.current.getInteractiveMeshes();
                const intersects = raycaster.intersectObjects(bookMeshes, false);
                if (intersects.length > 0) {
                    const hitObj = intersects[0].object;
                    if (hitObj.userData?.media) {
                        setInspectedMedia(hitObj.userData.media);
                    }
                }
            } else if (floor === 2 && animeLayoutRef.current) {
                const intersects = raycaster.intersectObjects(animeLayoutRef.current.group.children, true);
                if (intersects.length > 0) {
                    for (const hit of intersects) {
                        if (hit.object.userData?.media) {
                            setInspectedMedia(hit.object.userData.media);
                            break;
                        }
                    }
                }
            }
        };

        const domEl = renderer.domElement;
        domEl.addEventListener('mousedown', onPointerDown);
        domEl.addEventListener('mouseup', onPointerUp);

        const handleResize = () => {
            if (!renderer || !cameraController) return;
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            cameraController.camera.aspect = width / height;
            cameraController.camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        const animate = () => {
            const now = performance.now();
            const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = now;

            if (character && cameraController) {
                character.update(delta, cameraController.getYaw());
                cameraController.update(character.position, delta);
                renderer.render(scene, cameraController.camera);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            domEl.removeEventListener('mousedown', onPointerDown);
            domEl.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (renderer && renderer.domElement) {
                containerRef.current?.removeChild(renderer.domElement);
                renderer.dispose();
            }
        };
    }, [handleInteract, setInspectedMedia, currentFloor]);

    useEffect(() => {
        if (!booksManagerRef.current) return;
        const layout = createMangaFloorLayout();
        booksManagerRef.current.populateBooks(layout.genreSlots, mangaGenres);
    }, [mangaGenres]);

    useEffect(() => {
        if (!animeLayoutRef.current) return;
        animeLayoutRef.current.updateAnimePosters(animeGenres, trendingAnime);
    }, [animeGenres, trendingAnime]);

    useEffect(() => {
        if (!mangaLayoutRef.current || !animeLayoutRef.current || !characterRef.current || !booksManagerRef.current) return;

        const isFloor1 = currentFloor === 1;
        mangaLayoutRef.current.visible = isFloor1;
        booksManagerRef.current.group.visible = isFloor1;
        animeLayoutRef.current.group.visible = !isFloor1;

        if (elevatorRef.current) {
            elevatorRef.current.light.color.setHex(isFloor1 ? 0x7dd3fc : 0xf43f5e);
        }

        if (isFloor1) {
            const mangaLayout = createMangaFloorLayout();
            const obs = elevatorRef.current ? [elevatorRef.current.obstacle, ...mangaLayout.obstacles] : mangaLayout.obstacles;
            characterRef.current.setObstacles(obs);
            characterRef.current.setAisles(mangaLayout.aislePositions);
        } else {
            const animeLayout = animeLayoutRef.current;
            const obs = elevatorRef.current ? [elevatorRef.current.obstacle, ...animeLayout.obstacles] : animeLayout.obstacles;
            characterRef.current.setObstacles(obs);
            characterRef.current.setAisles(animeLayout.aislePositions);
        }
    }, [currentFloor]);

    const handleJoystickMove = useCallback((x: number, y: number) => {
        characterRef.current?.setJoystickInput(x, y);
    }, []);

    const handleMobileJump = useCallback(() => {
        if (characterRef.current && characterRef.current.isGrounded) {
            characterRef.current.velocity.y = 7.2;
            characterRef.current.isGrounded = false;
        }
    }, []);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="fixed inset-0 select-none cursor-grab active:cursor-grabbing" />
            <TouchJoystick
                onMove={handleJoystickMove}
                onJump={handleMobileJump}
                onInteract={handleInteract}
                showInteract={Boolean(proximityTarget)}
            />
        </div>
    );
}
