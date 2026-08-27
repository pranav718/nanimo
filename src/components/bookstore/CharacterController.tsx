import { useBookstoreStore } from '@/store/bookstoreStore';
import { BookstoreGenre } from '@/types';
import * as THREE from 'three';
import { EnvironmentBounds } from './BookstoreEnvironment';
import { BookshelfObstacle } from './BookshelfGeometry';
import { AvatarController, createCharacterAvatar } from './CharacterAvatar';

export interface PlayerInput {
    forward: number;
    strafe: number;
    sprint: boolean;
    jump: boolean;
    interact: boolean;
}

export class CharacterController {
    public avatar: AvatarController;
    public position: THREE.Vector3;
    public velocity: THREE.Vector3;
    public targetRotationY: number;
    public currentRotationY: number;
    public isGrounded: boolean;
    public speed: number;

    private input: PlayerInput;
    private radius: number;
    private obstacles: BookshelfObstacle[];
    private bounds: EnvironmentBounds;
    private aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[];
    private onInteractCallback?: () => void;

    constructor(
        initialPosition: THREE.Vector3,
        bounds: EnvironmentBounds,
        obstacles: BookshelfObstacle[],
        aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[]
    ) {
        this.avatar = createCharacterAvatar();
        this.position = initialPosition.clone();
        this.velocity = new THREE.Vector3();
        this.targetRotationY = 0;
        this.currentRotationY = 0;
        this.isGrounded = true;
        this.speed = 0;
        this.radius = 0.45;
        this.bounds = bounds;
        this.obstacles = obstacles;
        this.aislePositions = aislePositions;

        this.input = {
            forward: 0,
            strafe: 0,
            sprint: false,
            jump: false,
            interact: false,
        };

        this.avatar.group.position.copy(this.position);
        this.bindKeys();
    }

    public setObstacles(obstacles: BookshelfObstacle[]) {
        this.obstacles = obstacles;
    }

    public setAisles(aislePositions: { genre: BookstoreGenre; position: THREE.Vector3 }[]) {
        this.aislePositions = aislePositions;
    }

    public setOnInteract(cb: () => void) {
        this.onInteractCallback = cb;
    }

    public setJoystickInput(x: number, y: number) {
        this.input.strafe = x;
        this.input.forward = -y;
    }

    private bindKeys() {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            const isSitting = useBookstoreStore.getState().isSittingCinema;
            if (isSitting && ['w', 'a', 's', 'd', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key.toLowerCase())) {
                useBookstoreStore.getState().setSittingCinema(false);
                this.avatar.setSitting(false);
            }

            switch (e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.input.forward = 1;
                    break;
                case 's':
                case 'arrowdown':
                    this.input.forward = -1;
                    break;
                case 'a':
                case 'arrowleft':
                    this.input.strafe = -1;
                    break;
                case 'd':
                case 'arrowright':
                    this.input.strafe = 1;
                    break;
                case 'shift':
                    this.input.sprint = true;
                    break;
                case ' ':
                    if (this.isGrounded) {
                        this.velocity.y = 7.2;
                        this.isGrounded = false;
                    }
                    break;
                case 'e':
                    if (this.onInteractCallback) {
                        this.onInteractCallback();
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    if (this.input.forward === 1) this.input.forward = 0;
                    break;
                case 's':
                case 'arrowdown':
                    if (this.input.forward === -1) this.input.forward = 0;
                    break;
                case 'a':
                case 'arrowleft':
                    if (this.input.strafe === -1) this.input.strafe = 0;
                    break;
                case 'd':
                case 'arrowright':
                    if (this.input.strafe === 1) this.input.strafe = 0;
                    break;
                case 'shift':
                    this.input.sprint = false;
                    break;
            }
        });
    }

    public update(delta: number, cameraYaw: number) {
        const isSitting = useBookstoreStore.getState().isSittingCinema;
        if (isSitting) {
            this.avatar.setSitting(true);
            this.speed = 0;
            this.avatar.update(0, delta);
            this.checkProximities();
            return;
        }

        this.avatar.setSitting(false);

        const moveDir = new THREE.Vector3();
        if (this.input.forward !== 0 || this.input.strafe !== 0) {
            const camForward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
            const camRight = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

            moveDir.addScaledVector(camForward, -this.input.forward);
            moveDir.addScaledVector(camRight, this.input.strafe);

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize();
                this.targetRotationY = Math.atan2(moveDir.x, moveDir.z);
            }
        }

        const maxSpeed = this.input.sprint ? 9.5 : 5.8;
        const acceleration = 36;
        const friction = 22;

        if (moveDir.lengthSq() > 0) {
            const targetVelX = moveDir.x * maxSpeed;
            const targetVelZ = moveDir.z * maxSpeed;
            this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, targetVelX, acceleration * delta);
            this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, targetVelZ, acceleration * delta);
        } else {
            this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, friction * delta);
            this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, friction * delta);
        }

        if (!this.isGrounded) {
            this.velocity.y -= 19.8 * delta;
        }

        const testX = this.position.x + this.velocity.x * delta;
        const testZ = this.position.z + this.velocity.z * delta;
        const testY = this.position.y + this.velocity.y * delta;

        this.position.x = this.resolveCollisions(testX, this.position.z, 'x');
        this.position.z = this.resolveCollisions(this.position.x, testZ, 'z');

        this.position.x = THREE.MathUtils.clamp(
            this.position.x,
            this.bounds.minX + this.radius,
            this.bounds.maxX - this.radius
        );
        this.position.z = THREE.MathUtils.clamp(
            this.position.z,
            this.bounds.minZ + this.radius,
            this.bounds.maxZ - this.radius
        );

        if (testY <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.position.y = testY;
        }

        let rotDiff = this.targetRotationY - this.currentRotationY;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        this.currentRotationY += rotDiff * 14 * delta;

        this.avatar.group.position.copy(this.position);
        this.avatar.group.rotation.y = this.currentRotationY;

        this.speed = new THREE.Vector2(this.velocity.x, this.velocity.z).length();
        this.avatar.update(this.speed, delta);

        this.checkProximities();
    }

    private resolveCollisions(testX: number, testZ: number, axis: 'x' | 'z'): number {
        let currentCoord = axis === 'x' ? testX : testZ;

        for (const obs of this.obstacles) {
            const box = obs.box;
            const minX = box.min.x - this.radius;
            const maxX = box.max.x + this.radius;
            const minZ = box.min.z - this.radius;
            const maxZ = box.max.z + this.radius;

            const isInside = testX >= minX && testX <= maxX && testZ >= minZ && testZ <= maxZ;
            if (isInside) {
                if (axis === 'x') {
                    const distLeft = Math.abs(testX - minX);
                    const distRight = Math.abs(maxX - testX);
                    currentCoord = distLeft < distRight ? minX : maxX;
                    this.velocity.x = 0;
                } else {
                    const distTop = Math.abs(testZ - minZ);
                    const distBottom = Math.abs(maxZ - testZ);
                    currentCoord = distTop < distBottom ? minZ : maxZ;
                    this.velocity.z = 0;
                }
            }
        }
        return currentCoord;
    }

    private checkProximities() {
        const store = useBookstoreStore.getState();
        store.setPlayerPosition([this.position.x, this.position.y, this.position.z]);

        const floor = store.currentFloor;

        if (floor === 1) {
            const cafePos = new THREE.Vector3(18, 0, 8);
            if (this.position.distanceTo(cafePos) < 4.2) {
                store.setProximityTarget({
                    type: 'cafe',
                    id: 'cafe-1',
                    name: 'Cafe Nanimo Barista Aoi',
                });
                return;
            }

            const gachaponPos = new THREE.Vector3(-18, 0, 8);
            if (this.position.distanceTo(gachaponPos) < 3.8) {
                store.setProximityTarget({
                    type: 'gachapon',
                    id: 'gacha-1',
                    name: 'Gachapon Capsule Machine',
                });
                return;
            }

            const shelfPos = new THREE.Vector3(-18, 0, -6);
            if (this.position.distanceTo(shelfPos) < 3.8) {
                store.setProximityTarget({
                    type: 'personalshelf',
                    id: 'personal-1',
                    name: 'My Personal Collection Shelf',
                });
                return;
            }

            const sketchpadPos = new THREE.Vector3(-18, 0, -14);
            if (this.position.distanceTo(sketchpadPos) < 3.8) {
                store.setProximityTarget({
                    type: 'sketchpad',
                    id: 'sketchpad-1',
                    name: 'Manga Artist Drafting Desk',
                });
                return;
            }

            const nookPos = new THREE.Vector3(18, 0, -14);
            if (this.position.distanceTo(nookPos) < 3.8) {
                store.setProximityTarget({
                    type: 'nook',
                    id: 'nook-1',
                    name: 'Cozy Reading Nook Beanbag',
                });
                return;
            }

            const teacartPos = new THREE.Vector3(18, 0, -6);
            if (this.position.distanceTo(teacartPos) < 3.8) {
                store.setProximityTarget({
                    type: 'teacart',
                    id: 'teacart-1',
                    name: 'Matcha & Boba Tea Cart',
                });
                return;
            }

            const postboxPos = new THREE.Vector3(-18, 0, -2);
            if (this.position.distanceTo(postboxPos) < 3.8) {
                store.setProximityTarget({
                    type: 'postbox',
                    id: 'postbox-1',
                    name: 'Tokyo Retro Postbox & Stationery',
                });
                return;
            }

            const origamiPos = new THREE.Vector3(-18, 0, 14);
            if (this.position.distanceTo(origamiPos) < 3.8) {
                store.setProximityTarget({
                    type: 'origami',
                    id: 'origami-1',
                    name: 'Traditional Origami Paper Craft Studio',
                });
                return;
            }

            const metroGatePos = new THREE.Vector3(-8, 0, -17);
            if (this.position.distanceTo(metroGatePos) < 3.8) {
                store.setProximityTarget({
                    type: 'metrogate',
                    id: 'metrogate-1',
                    name: 'Tokyo Metro Ticket Gate',
                });
                return;
            }

            const vendingPos = new THREE.Vector3(18, 0, 2);
            if (this.position.distanceTo(vendingPos) < 3.8) {
                store.setProximityTarget({
                    type: 'vending',
                    id: 'vending-1',
                    name: 'Tokyo Street Drink Vending Machine',
                });
                return;
            }
        } else if (floor === 2) {
            const jukeboxPos = new THREE.Vector3(-18, 0, -10);
            if (this.position.distanceTo(jukeboxPos) < 3.8) {
                store.setProximityTarget({
                    type: 'jukebox',
                    id: 'jukebox-1',
                    name: 'Anime Lo-Fi Jukebox',
                });
                return;
            }

            const radioPos = new THREE.Vector3(-18, 0, 8);
            if (this.position.distanceTo(radioPos) < 3.8) {
                store.setProximityTarget({
                    type: 'radio',
                    id: 'radio-1',
                    name: 'Vintage Lo-Fi Radio Tower',
                });
                return;
            }

            const soundboardPos = new THREE.Vector3(18, 0, -10);
            if (this.position.distanceTo(soundboardPos) < 3.8) {
                store.setProximityTarget({
                    type: 'soundboard',
                    id: 'soundboard-1',
                    name: 'Anime SFX Synthesizer Console',
                });
                return;
            }

            const arcadePos = new THREE.Vector3(-18, 0, 14);
            if (this.position.distanceTo(arcadePos) < 3.8) {
                store.setProximityTarget({
                    type: 'arcade',
                    id: 'arcade-1',
                    name: 'Anime Trivia Arcade Cabinet',
                });
                return;
            }

            const djPos = new THREE.Vector3(18, 0, 14);
            if (this.position.distanceTo(djPos) < 3.8) {
                store.setProximityTarget({
                    type: 'dj',
                    id: 'dj-1',
                    name: 'Anime Vinyl DJ Turntable Booth',
                });
                return;
            }

            const trophyPos = new THREE.Vector3(-18, 0, -2);
            if (this.position.distanceTo(trophyPos) < 3.8) {
                store.setProximityTarget({
                    type: 'trophy',
                    id: 'trophy-1',
                    name: 'Otaku Artifact Trophy Showcase',
                });
                return;
            }

            const karaokePos = new THREE.Vector3(18, 0, 8);
            if (this.position.distanceTo(karaokePos) < 3.8) {
                store.setProximityTarget({
                    type: 'karaoke',
                    id: 'karaoke-1',
                    name: 'Anime Karaoke Rhythm Stage',
                });
                return;
            }

            const neonPos = new THREE.Vector3(0, 0, 16);
            if (this.position.distanceTo(neonPos) < 3.8) {
                store.setProximityTarget({
                    type: 'neonboard',
                    id: 'neonboard-1',
                    name: 'Akiba Cyber Neon Marquee Sign',
                });
                return;
            }

            const purikuraPos = new THREE.Vector3(-8, 0, 14);
            if (this.position.distanceTo(purikuraPos) < 3.8) {
                store.setProximityTarget({
                    type: 'purikura',
                    id: 'purikura-1',
                    name: 'Tokyo Purikura Photo Sticker Kiosk',
                });
                return;
            }

            const figuresPos = new THREE.Vector3(8, 0, 14);
            if (this.position.distanceTo(figuresPos) < 3.8) {
                store.setProximityTarget({
                    type: 'figureshowcase',
                    id: 'figures-1',
                    name: 'Akihabara Scale Figure Showcase',
                });
                return;
            }

            const seats: [number, number, number][] = [[-5.5, 0, -7], [5.5, 0, -7], [0, 0, -3]];
            for (const s of seats) {
                const sVec = new THREE.Vector3(...s);
                if (this.position.distanceTo(sVec) < 2.8) {
                    store.setProximityTarget({
                        type: 'seat',
                        id: `seat-${s[0]}-${s[2]}`,
                        name: 'Cinema VIP Couch (Press E to Sit)',
                        seatPos: s,
                    });
                    return;
                }
            }
        } else if (floor === 3) {
            const quizPos = new THREE.Vector3(0, 0, 0);
            if (this.position.distanceTo(quizPos) < 3.5) {
                store.setProximityTarget({
                    type: 'quiz',
                    id: 'quiz-1',
                    name: 'Anime Soul Personality Quiz',
                });
                return;
            }

            const pondPos = new THREE.Vector3(-12, 0, 10);
            if (this.position.distanceTo(pondPos) < 3.8) {
                store.setProximityTarget({
                    type: 'pond',
                    id: 'pond-1',
                    name: 'Rooftop Zen Koi Pond',
                });
                return;
            }

            const telescopePos = new THREE.Vector3(12, 0, -10);
            if (this.position.distanceTo(telescopePos) < 3.8) {
                store.setProximityTarget({
                    type: 'telescope',
                    id: 'telescope-1',
                    name: 'Cosmic Stargazer Telescope',
                });
                return;
            }

            const shrinePos = new THREE.Vector3(0, 0, 10);
            if (this.position.distanceTo(shrinePos) < 3.8) {
                store.setProximityTarget({
                    type: 'shrine',
                    id: 'shrine-1',
                    name: 'Omikuji Fortune Shrine',
                });
                return;
            }

            const bonsaiPos = new THREE.Vector3(12, 0, 10);
            if (this.position.distanceTo(bonsaiPos) < 3.8) {
                store.setProximityTarget({
                    type: 'bonsai',
                    id: 'bonsai-1',
                    name: 'Rooftop Zen Bonsai Garden',
                });
                return;
            }

            const fireworksPos = new THREE.Vector3(-12, 0, -10);
            if (this.position.distanceTo(fireworksPos) < 3.8) {
                store.setProximityTarget({
                    type: 'fireworks',
                    id: 'fireworks-1',
                    name: 'Tokyo Rooftop Fireworks Launcher',
                });
                return;
            }

            const taikoPos = new THREE.Vector3(-18, 0, 0);
            if (this.position.distanceTo(taikoPos) < 3.8) {
                store.setProximityTarget({
                    type: 'taiko',
                    id: 'taiko-1',
                    name: 'Traditional Festival Taiko Drum',
                });
                return;
            }

            const windchimePos = new THREE.Vector3(18, 0, 0);
            if (this.position.distanceTo(windchimePos) < 3.8) {
                store.setProximityTarget({
                    type: 'windchime',
                    id: 'windchime-1',
                    name: 'Rooftop Furin Wind Chime Gazebo',
                });
                return;
            }
        }

        let nearestAisle: { genre: BookstoreGenre; distance: number } | null = null;
        const interactRadius = 4.2;

        for (const aisle of this.aislePositions) {
            const dist = this.position.distanceTo(aisle.position);
            if (dist < interactRadius) {
                if (!nearestAisle || dist < nearestAisle.distance) {
                    nearestAisle = { genre: aisle.genre, distance: dist };
                }
            }
        }

        if (nearestAisle) {
            store.setActiveGenre(nearestAisle.genre);
            store.setProximityTarget({
                type: 'shelf',
                id: `aisle-${nearestAisle.genre}`,
                name: `${nearestAisle.genre} Section`,
                genre: nearestAisle.genre,
            });
            return;
        }

        const terminalPos = new THREE.Vector3(4.5, 0, -17);
        if (this.position.distanceTo(terminalPos) < 2.8) {
            store.setProximityTarget({
                type: 'terminal',
                id: 'terminal-1',
                name: 'Floor Directory Touch Terminal',
            });
            return;
        }

        const elevatorPos = new THREE.Vector3(0, 0, -18);
        if (this.position.distanceTo(elevatorPos) < 3.5) {
            store.setProximityTarget({
                type: 'elevator',
                id: 'elevator-1',
                name: `Glass Elevator (Floor ${floor})`,
            });
        } else {
            store.setActiveGenre(null);
            store.setProximityTarget(null);
        }
    }

    public teleport(target: THREE.Vector3) {
        this.position.copy(target);
        this.velocity.set(0, 0, 0);
        this.avatar.group.position.copy(this.position);
    }
}
