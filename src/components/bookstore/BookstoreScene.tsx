'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AmbientParticlesResult, createAmbientParticles } from './AmbientParticles3D';
import { AnimeFloorLayoutResult, createAnimeFloorLayout } from './AnimeFloorLayout';
import { createAnimePostBox, PostBoxResult } from './AnimePostBox3D';
import { createQuizKiosk, QuizKioskResult } from './AnimeQuizKiosk3D';
import { createAnimeSoundboard, SoundboardResult } from './AnimeSoundboard3D';
import { ArcadeResult, createAnimeTriviaArcade } from './AnimeTriviaArcade3D';
import { createVinylDJBooth, VinylDJResult } from './AnimeVinylDJ3D';
import { applyAtmosphere } from './AtmospherePresets';
import { createPetCompanion, PetCompanionResult } from './AvatarPetCompanion3D';
import { createBookstoreEnvironment } from './BookstoreEnvironment';
import BookstoreMiniMap from './BookstoreMiniMap';
import { BookshelfObstacle } from './BookshelfGeometry';
import { CafeBaristaResult, createCafeBarista } from './CafeBarista3D';
import { CharacterController } from './CharacterController';
import { createCosmicTelescope, TelescopeResult } from './CosmicTelescope3D';
import { createDirectoryTerminal, DirectoryTerminalResult } from './DirectoryTerminal3D';
import { DynamicBooksManager } from './DynamicBooksManager';
import { createElevator, ElevatorResult } from './ElevatorTransit';
import { createGachaponMachine, GachaponMachineResult } from './GachaponMachine';
import { createJukebox, JukeboxResult } from './Jukebox3D';
import { createMangaDrawingTable, DrawingTableResult } from './MangaDrawingTable3D';
import { createMangaFloorLayout } from './MangaFloorLayout';
import { createMatchaTeaCart, TeaCartResult } from './MatchaTeaCart3D';
import { createOmikujiShrine, ShrineResult } from './OmikujiShrine3D';
import { createPersonalShelf, PersonalShelfResult } from './PersonalShelf';
import { createRadioStation, RadioStationResult } from './RadioStation3D';
import { createReadingNook, ReadingNookResult } from './ReadingNook3D';
import { createRooftopFloorLayout, RooftopLayoutResult } from './RooftopFloorLayout';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import TouchJoystick from './TouchJoystick';
import { createTrophyShowcase, TrophyCaseResult } from './TrophyShowcase3D';
import { createZenBonsaiGarden, BonsaiGardenResult } from './ZenBonsaiGarden3D';
import { createZenKoiPond, ZenKoiPondResult } from './ZenKoiPond3D';

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
    const quizKioskRef = useRef<QuizKioskResult | null>(null);
    const directoryTerminalRef = useRef<DirectoryTerminalResult | null>(null);
    const soundboardRef = useRef<SoundboardResult | null>(null);
    const djBoothRef = useRef<VinylDJResult | null>(null);
    const trophyCaseRef = useRef<TrophyCaseResult | null>(null);
    const bonsaiGardenRef = useRef<BonsaiGardenResult | null>(null);
    const postBoxRef = useRef<PostBoxResult | null>(null);
    const arcadeRef = useRef<ArcadeResult | null>(null);
    const telescopeRef = useRef<TelescopeResult | null>(null);
    const shrineRef = useRef<ShrineResult | null>(null);
    const teaCartRef = useRef<TeaCartResult | null>(null);
    const radioStationRef = useRef<RadioStationResult | null>(null);
    const readingNookRef = useRef<ReadingNookResult | null>(null);
    const drawingTableRef = useRef<DrawingTableResult | null>(null);
    const koiPondRef = useRef<ZenKoiPondResult | null>(null);
    const petCompanionRef = useRef<PetCompanionResult | null>(null);
    const ambientParticlesRef = useRef<AmbientParticlesResult | null>(null);
    const elevatorRef = useRef<ElevatorResult | null>(null);
    const gachaponRef = useRef<GachaponMachineResult | null>(null);
    const personalShelfRef = useRef<PersonalShelfResult | null>(null);
    const cafeBaristaRef = useRef<CafeBaristaResult | null>(null);
    const jukeboxRef = useRef<JukeboxResult | null>(null);
    const envLightsRef = useRef<THREE.Light[]>([]);
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
        activeEmote,
        activePet,
        rollGachapon,
        toggleAudio,
        setBookmarksOpen,
        isAudioPlaying,
        isFirstPerson,
        atmospherePreset,
        setCafeOpen,
        setSittingCinema,
        setQuizOpen,
        setFastTravelOpen,
        setSoundboardOpen,
        setSketchpadOpen,
        setRadioOpen,
        setReadingGoalOpen,
        setTriviaArcadeOpen,
        setTelescopeOpen,
        setFortuneOpen,
        setTeaCartOpen,
        setDJOpen,
        setPostcardOpen,
        setAmbienceMixerOpen,
        setTrophyOpen,
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
        } else if (target.type === 'terminal') {
            setFastTravelOpen(true);
        } else if (target.type === 'trophy') {
            setTrophyOpen(true);
        } else if (target.type === 'bonsai') {
            setAmbienceMixerOpen(true);
        } else if (target.type === 'postbox') {
            setPostcardOpen(true);
        } else if (target.type === 'dj') {
            setDJOpen(true);
        } else if (target.type === 'teacart') {
            setTeaCartOpen(true);
        } else if (target.type === 'shrine') {
            setFortuneOpen(true);
        } else if (target.type === 'arcade') {
            setTriviaArcadeOpen(true);
        } else if (target.type === 'telescope') {
            setTelescopeOpen(true);
        } else if (target.type === 'radio') {
            setRadioOpen(true);
        } else if (target.type === 'nook') {
            setReadingGoalOpen(true);
        } else if (target.type === 'sketchpad') {
            setSketchpadOpen(true);
        } else if (target.type === 'soundboard') {
            setSoundboardOpen(true);
        } else if (target.type === 'gachapon') {
            gachaponRef.current?.playSpinAnimation();
            rollGachapon();
        } else if (target.type === 'jukebox') {
            toggleAudio();
        } else if (target.type === 'personalshelf') {
            setBookmarksOpen(true);
        } else if (target.type === 'cafe') {
            setCafeOpen(true);
        } else if (target.type === 'quiz') {
            setQuizOpen(true);
        } else if (target.type === 'seat' && target.seatPos) {
            setSittingCinema(true);
            if (characterRef.current) {
                characterRef.current.teleport(new THREE.Vector3(target.seatPos[0], 0, target.seatPos[2]));
            }
        }
    }, [
        setInspectedMedia,
        rollGachapon,
        toggleAudio,
        setBookmarksOpen,
        setCafeOpen,
        setSittingCinema,
        setQuizOpen,
        setFastTravelOpen,
        setSoundboardOpen,
        setSketchpadOpen,
        setRadioOpen,
        setReadingGoalOpen,
        setTriviaArcadeOpen,
        setTelescopeOpen,
        setFortuneOpen,
        setTeaCartOpen,
        setDJOpen,
        setPostcardOpen,
        setAmbienceMixerOpen,
        setTrophyOpen,
    ]);

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
            preserveDrawingBuffer: true,
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
        cameraController.isFirstPerson = isFirstPerson;
        cameraControllerRef.current = cameraController;

        const env = createBookstoreEnvironment();
        envLightsRef.current = env.lights;
        scene.add(env.group);

        const particles = createAmbientParticles();
        scene.add(particles.group);
        ambientParticlesRef.current = particles;

        const pet = createPetCompanion();
        pet.setPetType(activePet);
        scene.add(pet.group);
        petCompanionRef.current = pet;

        const elevator = createElevator(currentFloor);
        elevator.group.position.set(0, 0, -18);
        scene.add(elevator.group);
        elevatorRef.current = elevator;

        const terminal = createDirectoryTerminal([4.5, 0, -17]);
        scene.add(terminal.group);
        directoryTerminalRef.current = terminal;

        const mangaLayout = createMangaFloorLayout();
        mangaLayoutRef.current = mangaLayout.group;
        scene.add(mangaLayout.group);

        const gachapon = createGachaponMachine([-18, 0, 8]);
        scene.add(gachapon.group);
        gachaponRef.current = gachapon;

        const personalShelf = createPersonalShelf([-18, 0, -6]);
        scene.add(personalShelf.group);
        personalShelfRef.current = personalShelf;

        const cafeBarista = createCafeBarista([18, 0, 8]);
        scene.add(cafeBarista.group);
        cafeBaristaRef.current = cafeBarista;

        const teaCart = createMatchaTeaCart([18, 0, -6]);
        scene.add(teaCart.group);
        teaCartRef.current = teaCart;

        const postBox = createAnimePostBox([-18, 0, -2]);
        scene.add(postBox.group);
        postBoxRef.current = postBox;

        const drawingTable = createMangaDrawingTable([-18, 0, -14]);
        scene.add(drawingTable.group);
        drawingTableRef.current = drawingTable;

        const readingNook = createReadingNook([18, 0, -14]);
        scene.add(readingNook.group);
        readingNookRef.current = readingNook;

        const animeLayout = createAnimeFloorLayout();
        animeLayoutRef.current = animeLayout;
        animeLayout.group.visible = false;
        scene.add(animeLayout.group);

        const jukebox = createJukebox([-18, 0, -10]);
        scene.add(jukebox.group);
        jukeboxRef.current = jukebox;

        const radioStation = createRadioStation([-18, 0, 8]);
        radioStation.group.visible = false;
        scene.add(radioStation.group);
        radioStationRef.current = radioStation;

        const soundboard = createAnimeSoundboard([18, 0, -10]);
        soundboard.group.visible = false;
        scene.add(soundboard.group);
        soundboardRef.current = soundboard;

        const djBooth = createVinylDJBooth([18, 0, 14]);
        djBooth.group.visible = false;
        scene.add(djBooth.group);
        djBoothRef.current = djBooth;

        const trophyCase = createTrophyShowcase([-18, 0, -2]);
        trophyCase.group.visible = false;
        scene.add(trophyCase.group);
        trophyCaseRef.current = trophyCase;

        const arcade = createAnimeTriviaArcade([-18, 0, 14]);
        arcade.group.visible = false;
        scene.add(arcade.group);
        arcadeRef.current = arcade;

        const rooftopLayout = createRooftopFloorLayout();
        rooftopLayoutRef.current = rooftopLayout;
        rooftopLayout.group.visible = false;
        scene.add(rooftopLayout.group);

        const quizKiosk = createQuizKiosk([0, 0, 0]);
        scene.add(quizKiosk.group);
        quizKiosk.group.visible = false;
        quizKioskRef.current = quizKiosk;

        const koiPond = createZenKoiPond([-12, 0, 10]);
        koiPond.group.visible = false;
        scene.add(koiPond.group);
        koiPondRef.current = koiPond;

        const telescope = createCosmicTelescope([12, 0, -10]);
        telescope.group.visible = false;
        scene.add(telescope.group);
        telescopeRef.current = telescope;

        const shrine = createOmikujiShrine([0, 0, 10]);
        shrine.group.visible = false;
        scene.add(shrine.group);
        shrineRef.current = shrine;

        const bonsaiGarden = createZenBonsaiGarden([12, 0, 10]);
        bonsaiGarden.group.visible = false;
        scene.add(bonsaiGarden.group);
        bonsaiGardenRef.current = bonsaiGarden;

        const booksManager = new DynamicBooksManager();
        scene.add(booksManager.group);
        booksManagerRef.current = booksManager;

        const allObstacles = [
            elevator.obstacle,
            terminal.obstacle,
            drawingTable.obstacle,
            readingNook.obstacle,
            teaCart.obstacle,
            postBox.obstacle,
            gachapon.obstacle,
            personalShelf.obstacle,
            cafeBarista.obstacle,
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

            if (directoryTerminalRef.current) {
                const intersects = raycaster.intersectObjects(
                    directoryTerminalRef.current.group.children,
                    true
                );
                if (intersects.length > 0) {
                    setFastTravelOpen(true);
                    return;
                }
            }

            if (floor === 1) {
                if (postBoxRef.current) {
                    const intersects = raycaster.intersectObjects(
                        postBoxRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setPostcardOpen(true);
                        return;
                    }
                }

                if (teaCartRef.current) {
                    const intersects = raycaster.intersectObjects(
                        teaCartRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setTeaCartOpen(true);
                        return;
                    }
                }

                if (drawingTableRef.current) {
                    const intersects = raycaster.intersectObjects(
                        drawingTableRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setSketchpadOpen(true);
                        return;
                    }
                }

                if (readingNookRef.current) {
                    const intersects = raycaster.intersectObjects(
                        readingNookRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setReadingGoalOpen(true);
                        return;
                    }
                }

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
                    const intersects = raycaster.intersectObjects(
                        gachaponRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        gachaponRef.current.playSpinAnimation();
                        rollGachapon();
                        return;
                    }
                }

                if (cafeBaristaRef.current) {
                    const intersects = raycaster.intersectObjects(
                        cafeBaristaRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setCafeOpen(true);
                        return;
                    }
                }
            } else if (floor === 2) {
                if (trophyCaseRef.current) {
                    const intersects = raycaster.intersectObjects(
                        trophyCaseRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setTrophyOpen(true);
                        return;
                    }
                }

                if (djBoothRef.current) {
                    const intersects = raycaster.intersectObjects(
                        djBoothRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setDJOpen(true);
                        return;
                    }
                }

                if (arcadeRef.current) {
                    const intersects = raycaster.intersectObjects(
                        arcadeRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setTriviaArcadeOpen(true);
                        return;
                    }
                }

                if (jukeboxRef.current) {
                    const intersects = raycaster.intersectObjects(
                        jukeboxRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        toggleAudio();
                        return;
                    }
                }

                if (radioStationRef.current) {
                    const intersects = raycaster.intersectObjects(
                        radioStationRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setRadioOpen(true);
                        return;
                    }
                }

                if (soundboardRef.current) {
                    const intersects = raycaster.intersectObjects(
                        soundboardRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setSoundboardOpen(true);
                        return;
                    }
                }

                if (animeLayoutRef.current) {
                    const intersects = raycaster.intersectObjects(
                        animeLayoutRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        for (const hit of intersects) {
                            if (hit.object.userData?.media) {
                                setInspectedMedia(hit.object.userData.media);
                                break;
                            }
                        }
                    }
                }
            } else if (floor === 3) {
                if (bonsaiGardenRef.current) {
                    const intersects = raycaster.intersectObjects(
                        bonsaiGardenRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setAmbienceMixerOpen(true);
                        return;
                    }
                }

                if (shrineRef.current) {
                    const intersects = raycaster.intersectObjects(
                        shrineRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setFortuneOpen(true);
                        return;
                    }
                }

                if (telescopeRef.current) {
                    const intersects = raycaster.intersectObjects(
                        telescopeRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setTelescopeOpen(true);
                        return;
                    }
                }

                if (quizKioskRef.current) {
                    const intersects = raycaster.intersectObjects(
                        quizKioskRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        setQuizOpen(true);
                        return;
                    }
                }

                if (rooftopLayoutRef.current) {
                    const intersects = raycaster.intersectObjects(
                        rooftopLayoutRef.current.group.children,
                        true
                    );
                    if (intersects.length > 0) {
                        for (const hit of intersects) {
                            if (hit.object.userData?.media) {
                                setInspectedMedia(hit.object.userData.media);
                                break;
                            }
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

            const floor = useBookstoreStore.getState().currentFloor;

            if (character && cameraController) {
                character.update(delta, cameraController.getYaw());
                cameraController.update(character.position, delta);

                const currentIsAudio = useBookstoreStore.getState().isAudioPlaying;

                if (petCompanionRef.current) {
                    petCompanionRef.current.update(character.position, delta);
                }

                if (ambientParticlesRef.current) {
                    ambientParticlesRef.current.update(delta, floor);
                }

                if (directoryTerminalRef.current) {
                    directoryTerminalRef.current.update(delta);
                }

                if (drawingTableRef.current && drawingTableRef.current.group.visible) {
                    drawingTableRef.current.update(delta);
                }

                if (readingNookRef.current && readingNookRef.current.group.visible) {
                    readingNookRef.current.update(delta);
                }

                if (teaCartRef.current && teaCartRef.current.group.visible) {
                    teaCartRef.current.update(delta);
                }

                if (postBoxRef.current && postBoxRef.current.group.visible) {
                    postBoxRef.current.update(delta);
                }

                if (radioStationRef.current && radioStationRef.current.group.visible) {
                    radioStationRef.current.update(delta);
                }

                if (soundboardRef.current && soundboardRef.current.group.visible) {
                    soundboardRef.current.update(delta);
                }

                if (djBoothRef.current && djBoothRef.current.group.visible) {
                    djBoothRef.current.update(delta);
                }

                if (trophyCaseRef.current && trophyCaseRef.current.group.visible) {
                    trophyCaseRef.current.update(delta);
                }

                if (arcadeRef.current && arcadeRef.current.group.visible) {
                    arcadeRef.current.update(delta);
                }

                if (gachaponRef.current) {
                    gachaponRef.current.update(delta);
                }

                if (cafeBaristaRef.current) {
                    cafeBaristaRef.current.update(delta);
                }

                if (jukeboxRef.current) {
                    jukeboxRef.current.update(delta, currentIsAudio);
                }

                if (quizKioskRef.current && quizKioskRef.current.group.visible) {
                    quizKioskRef.current.update(delta);
                }

                if (koiPondRef.current && koiPondRef.current.group.visible) {
                    koiPondRef.current.update(delta);
                }

                if (telescopeRef.current && telescopeRef.current.group.visible) {
                    telescopeRef.current.update(delta);
                }

                if (shrineRef.current && shrineRef.current.group.visible) {
                    shrineRef.current.update(delta);
                }

                if (bonsaiGardenRef.current && bonsaiGardenRef.current.group.visible) {
                    bonsaiGardenRef.current.update(delta);
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
    }, [
        handleInteract,
        setInspectedMedia,
        currentFloor,
        rollGachapon,
        toggleAudio,
        setCafeOpen,
        setQuizOpen,
        setFastTravelOpen,
        setSoundboardOpen,
        setSketchpadOpen,
        setRadioOpen,
        setReadingGoalOpen,
        setTriviaArcadeOpen,
        setTelescopeOpen,
        setFortuneOpen,
        setTeaCartOpen,
        setDJOpen,
        setPostcardOpen,
        setAmbienceMixerOpen,
        setTrophyOpen,
    ]);

    useEffect(() => {
        if (!cameraControllerRef.current || !characterRef.current) return;
        cameraControllerRef.current.isFirstPerson = isFirstPerson;
        characterRef.current.avatar.group.visible = !isFirstPerson;
    }, [isFirstPerson]);

    useEffect(() => {
        if (petCompanionRef.current) {
            petCompanionRef.current.setPetType(activePet);
        }
    }, [activePet]);

    useEffect(() => {
        if (characterRef.current) {
            characterRef.current.avatar.playEmote(activeEmote);
        }
    }, [activeEmote]);

    useEffect(() => {
        if (!sceneRef.current || envLightsRef.current.length === 0) return;
        applyAtmosphere(atmospherePreset, sceneRef.current, envLightsRef.current);
    }, [atmospherePreset]);

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
        if (
            !mangaLayoutRef.current ||
            !animeLayoutRef.current ||
            !rooftopLayoutRef.current ||
            !characterRef.current ||
            !booksManagerRef.current
        )
            return;

        mangaLayoutRef.current.visible = currentFloor === 1;
        booksManagerRef.current.group.visible = currentFloor === 1;
        if (gachaponRef.current) gachaponRef.current.group.visible = currentFloor === 1;
        if (personalShelfRef.current) personalShelfRef.current.group.visible = currentFloor === 1;
        if (cafeBaristaRef.current) cafeBaristaRef.current.group.visible = currentFloor === 1;
        if (teaCartRef.current) teaCartRef.current.group.visible = currentFloor === 1;
        if (postBoxRef.current) postBoxRef.current.group.visible = currentFloor === 1;
        if (drawingTableRef.current) drawingTableRef.current.group.visible = currentFloor === 1;
        if (readingNookRef.current) readingNookRef.current.group.visible = currentFloor === 1;

        animeLayoutRef.current.group.visible = currentFloor === 2;
        if (jukeboxRef.current) jukeboxRef.current.group.visible = currentFloor === 2;
        if (soundboardRef.current) soundboardRef.current.group.visible = currentFloor === 2;
        if (radioStationRef.current) radioStationRef.current.group.visible = currentFloor === 2;
        if (djBoothRef.current) djBoothRef.current.group.visible = currentFloor === 2;
        if (trophyCaseRef.current) trophyCaseRef.current.group.visible = currentFloor === 2;
        if (arcadeRef.current) arcadeRef.current.group.visible = currentFloor === 2;

        rooftopLayoutRef.current.group.visible = currentFloor === 3;
        if (quizKioskRef.current) quizKioskRef.current.group.visible = currentFloor === 3;
        if (koiPondRef.current) koiPondRef.current.group.visible = currentFloor === 3;
        if (telescopeRef.current) telescopeRef.current.group.visible = currentFloor === 3;
        if (shrineRef.current) shrineRef.current.group.visible = currentFloor === 3;
        if (bonsaiGardenRef.current) bonsaiGardenRef.current.group.visible = currentFloor === 3;

        if (elevatorRef.current) {
            const floorColor = currentFloor === 1 ? 0x7dd3fc : currentFloor === 2 ? 0xf43f5e : 0xf472b6;
            elevatorRef.current.light.color.setHex(floorColor);
        }

        const terminalObstacle = directoryTerminalRef.current?.obstacle;

        if (currentFloor === 1) {
            const mangaLayout = createMangaFloorLayout();
            const obs = [
                elevatorRef.current?.obstacle,
                terminalObstacle,
                drawingTableRef.current?.obstacle,
                readingNookRef.current?.obstacle,
                teaCartRef.current?.obstacle,
                postBoxRef.current?.obstacle,
                gachaponRef.current?.obstacle,
                personalShelfRef.current?.obstacle,
                cafeBaristaRef.current?.obstacle,
                ...mangaLayout.obstacles,
            ].filter(Boolean) as BookshelfObstacle[];
            characterRef.current.setObstacles(obs);
            characterRef.current.setAisles(mangaLayout.aislePositions);
        } else if (currentFloor === 2) {
            const animeLayout = animeLayoutRef.current;
            const obs = [
                elevatorRef.current?.obstacle,
                terminalObstacle,
                jukeboxRef.current?.obstacle,
                radioStationRef.current?.obstacle,
                soundboardRef.current?.obstacle,
                djBoothRef.current?.obstacle,
                trophyCaseRef.current?.obstacle,
                arcadeRef.current?.obstacle,
                ...animeLayout.obstacles,
            ].filter(Boolean) as BookshelfObstacle[];
            characterRef.current.setObstacles(obs);
            characterRef.current.setAisles(animeLayout.aislePositions);
        } else {
            const rooftopLayout = rooftopLayoutRef.current;
            const obs = [
                elevatorRef.current?.obstacle,
                terminalObstacle,
                quizKioskRef.current?.obstacle,
                koiPondRef.current?.obstacle,
                telescopeRef.current?.obstacle,
                shrineRef.current?.obstacle,
                bonsaiGardenRef.current?.obstacle,
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
