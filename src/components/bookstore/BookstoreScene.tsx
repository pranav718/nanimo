'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AnimeFloorLayoutResult, createAnimeFloorLayout } from './AnimeFloorLayout';
import { createBookstoreEnvironment } from './BookstoreEnvironment';
import BookstoreMiniMap from './BookstoreMiniMap';
import { BookshelfObstacle } from './BookshelfGeometry';
import { CharacterController } from './CharacterController';
import { DynamicBooksManager } from './DynamicBooksManager';
import { createElevator, ElevatorResult } from './ElevatorTransit';
import { createGachaponMachine, GachaponMachineResult } from './GachaponMachine';
import { createJukebox, JukeboxResult } from './Jukebox3D';
import { createMangaFloorLayout } from './MangaFloorLayout';
import { createPersonalShelf, PersonalShelfResult } from './PersonalShelf';
import { createRooftopFloorLayout, RooftopLayoutResult } from './RooftopFloorLayout';
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
    const rooftopLayoutRef = useRef<RooftopLayoutResult | null>(null);
    const elevatorRef = useRef<ElevatorResult | null>(null);
    const gachaponRef = useRef<GachaponMachineResult | null>(null);
    const personalShelfRef = useRef<PersonalShelfResult | null>(null);
    const jukeboxRef = useRef<JukeboxResult | null>(null);
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
        trendingManga,
        savedMedia,
        currentFloor,
        avatarCustomization,
        rollGachapon,
        toggleAudio,
        setBookmarksOpen,
        isAudioPlaying,
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
            } else if (store.currentFloor === 2) {
                const mediaList = store.animeGenres[target.genre];
                if (mediaList && mediaList.length > 0) {
                    setInspectedMedia(mediaList[0]);
                }
            }
        } else if (target.type === 'elevator') {
            const nextFloor = store.currentFloor === 1 ? 2 : store.currentFloor === 2 ? 3 : 1;
            store.setCurrentFloor(nextFloor);
            if (characterRef.current) {
                characterRef.current.teleport(new THREE.Vector3(0, 0, 14));
            }
        } else if (target.type === 'gachapon') {
            gachaponRef.current?.playSpinAnimation();
            rollGachapon();
        } else if (target.type === 'jukebox') {
            toggleAudio();
        } else if (target.type === 'personalshelf') {
            setBookmarksOpen(true);
        }
    }, [setInspectedMedia, rollGachapon, toggleAudio, setBookmarksOpen]);

    const handleTeleport = useCallback((x: number, z: number) => {
        if (characterRef.current) {
            characterRef.current.teleport(new THREE.Vector3(x, 0, z));
        }
    }, []);

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

        const gachapon = createGachaponMachine([-18, 0, 8]);
        scene.add(gachapon.group);
        gachaponRef.current = gachapon;

        const personalShelf = createPersonalShelf([-18, 0, -6]);
        scene.add(personalShelf.group);
        personalShelfRef.current = personalShelf;

        const animeLayout = createAnimeFloorLayout();
        animeLayoutRef.current = animeLayout;
        animeLayout.group.visible = false;
        scene.add(animeLayout.group);

        const jukebox = createJukebox([-18, 0, -10]);
        scene.add(jukebox.group);
        jukeboxRef.current = jukebox;

        const rooftopLayout = createRooftopFloorLayout();
        rooftopLayoutRef.current = rooftopLayout;
        rooftopLayout.group.visible = false;
        scene.add(rooftopLayout.group);

        const booksManager = new DynamicBooksManager();
        scene.add(booksManager.group);
        booksManagerRef.current = booksManager;

        const allObstacles = [
            elevator.obstacle,
            gachapon.obstacle,
            personalShelf.obstacle,
            ...mangaLayout.obstacles,
        ];
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

            if (floor === 1) {
                if (booksManagerRef.current) {
                    const bookMeshes = booksManagerRef.current.getInteractiveMeshes();
                    const intersects = raycaster.intersectObjects(bookMeshes, false);
                    if (intersects.length > 0) {
                        const hitObj = intersects[0].object;
                        if (hitObj.userData?.media) {
                            setInspectedMedia(hitObj.userData.media);
                            return;
                        }
                    }
                }

                if (personalShelfRef.current) {
                    const shelfBooks = personalShelfRef.current.getInteractiveMeshes();
                    const intersects = raycaster.intersectObjects(shelfBooks, false);
                    if (intersects.length > 0) {
                        const hitObj = intersects[0].object;
                        if (hitObj.userData?.media) {
                            setInspectedMedia(hitObj.userData.media);
                            return;
                        }
                    }
                }

                if (gachaponRef.current) {
                    const intersects = raycaster.intersectObjects(gachaponRef.current.group.children, true);
                    if (intersects.length > 0) {
                        gachaponRef.current.playSpinAnimation();
                        rollGachapon();
                        return;
                    }
                }
            } else if (floor === 2) {
                if (jukeboxRef.current) {
                    const intersects = raycaster.intersectObjects(jukeboxRef.current.group.children, true);
                    if (intersects.length > 0) {
                        toggleAudio();
                        return;
                    }
                }

                if (animeLayoutRef.current) {
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
            } else if (floor === 3 && rooftopLayoutRef.current) {
                const intersects = raycaster.intersectObjects(rooftopLayoutRef.current.group.children, true);
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

                const currentIsAudio = useBookstoreStore.getState().isAudioPlaying;

                if (gachaponRef.current) {
                    gachaponRef.current.update(delta);
                }

                if (jukeboxRef.current) {
                    jukeboxRef.current.update(delta, currentIsAudio);
                }

                if (rooftopLayoutRef.current && rooftopLayoutRef.current.group.visible) {
                    rooftopLayoutRef.current.updateSakura(delta);
                }

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
    }, [handleInteract, setInspectedMedia, currentFloor, rollGachapon, toggleAudio]);

    useEffect(() => {
        if (!booksManagerRef.current) return;
        const layout = createMangaFloorLayout();
        booksManagerRef.current.populateBooks(layout.genreSlots, mangaGenres);
    }, [mangaGenres]);

    useEffect(() => {
        if (!personalShelfRef.current) return;
        personalShelfRef.current.updateSavedBooks(savedMedia);
    }, [savedMedia]);

    useEffect(() => {
        if (!animeLayoutRef.current) return;
        animeLayoutRef.current.updateAnimePosters(animeGenres, trendingAnime);
    }, [animeGenres, trendingAnime]);

    useEffect(() => {
        if (!rooftopLayoutRef.current) return;
        rooftopLayoutRef.current.updateRooftopMedia(trendingAnime, trendingManga);
    }, [trendingAnime, trendingManga]);

    useEffect(() => {
        if (characterRef.current) {
            characterRef.current.avatar.setCustomization(avatarCustomization);
        }
    }, [avatarCustomization]);

    useEffect(() => {
        if (!mangaLayoutRef.current || !animeLayoutRef.current || !rooftopLayoutRef.current || !characterRef.current || !booksManagerRef.current) return;

        mangaLayoutRef.current.visible = currentFloor === 1;
        booksManagerRef.current.group.visible = currentFloor === 1;
        if (gachaponRef.current) gachaponRef.current.group.visible = currentFloor === 1;
        if (personalShelfRef.current) personalShelfRef.current.group.visible = currentFloor === 1;

        animeLayoutRef.current.group.visible = currentFloor === 2;
        if (jukeboxRef.current) jukeboxRef.current.group.visible = currentFloor === 2;

        rooftopLayoutRef.current.group.visible = currentFloor === 3;

        if (elevatorRef.current) {
            const floorColor = currentFloor === 1 ? 0x7dd3fc : currentFloor === 2 ? 0xf43f5e : 0xf472b6;
            elevatorRef.current.light.color.setHex(floorColor);
        }

        if (currentFloor === 1) {
            const mangaLayout = createMangaFloorLayout();
            const obs = [
                elevatorRef.current?.obstacle,
                gachaponRef.current?.obstacle,
                personalShelfRef.current?.obstacle,
                ...mangaLayout.obstacles,
            ].filter(Boolean) as BookshelfObstacle[];
            characterRef.current.setObstacles(obs);
            characterRef.current.setAisles(mangaLayout.aislePositions);
        } else if (currentFloor === 2) {
            const animeLayout = animeLayoutRef.current;
            const obs = [
                elevatorRef.current?.obstacle,
                jukeboxRef.current?.obstacle,
                ...animeLayout.obstacles,
            ].filter(Boolean) as BookshelfObstacle[];
            characterRef.current.setObstacles(obs);
            characterRef.current.setAisles(animeLayout.aislePositions);
        } else {
            const rooftopLayout = rooftopLayoutRef.current;
            const obs = [
                elevatorRef.current?.obstacle,
                ...rooftopLayout.obstacles,
            ].filter(Boolean) as BookshelfObstacle[];
            characterRef.current.setObstacles(obs);
            characterRef.current.setAisles(rooftopLayout.aislePositions);
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
            <BookstoreMiniMap onTeleport={handleTeleport} />
            <TouchJoystick
                onMove={handleJoystickMove}
                onJump={handleMobileJump}
                onInteract={handleInteract}
                showInteract={Boolean(proximityTarget)}
            />
        </div>
    );
}
