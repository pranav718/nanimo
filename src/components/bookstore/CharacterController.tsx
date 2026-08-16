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
        this.input.forward = y;
    }

    private bindKeys() {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.forward = 1;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.forward = -1;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.strafe = -1;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.strafe = 1;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.input.sprint = true;
                    break;
                case 'Space':
                    this.input.jump = true;
                    break;
                case 'KeyE':
                    this.input.interact = true;
                    if (this.onInteractCallback) {
                        this.onInteractCallback();
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    if (this.input.forward === 1) this.input.forward = 0;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    if (this.input.forward === -1) this.input.forward = 0;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    if (this.input.strafe === -1) this.input.strafe = 0;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    if (this.input.strafe === 1) this.input.strafe = 0;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.input.sprint = false;
                    break;
                case 'Space':
                    this.input.jump = false;
                    break;
                case 'KeyE':
                    this.input.interact = false;
                    break;
            }
        });
    }

    public update(delta: number, cameraYaw: number) {
        const moveSpeed = this.input.sprint ? 9.5 : 5.8;
        const inputDir = new THREE.Vector2(this.input.strafe, this.input.forward);
        
        if (inputDir.lengthSq() > 1) {
            inputDir.normalize();
        }

        const moveLength = inputDir.length();

        if (moveLength > 0.05) {
            const inputAngle = Math.atan2(inputDir.x, inputDir.y);
            const moveAngle = cameraYaw + inputAngle;

            const targetVx = Math.sin(moveAngle) * moveSpeed * moveLength;
            const targetVz = Math.cos(moveAngle) * moveSpeed * moveLength;

            this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, targetVx, 12 * delta);
            this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, targetVz, 12 * delta);

            this.targetRotationY = moveAngle;
        } else {
            this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, 14 * delta);
            this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, 14 * delta);
        }

        if (this.input.jump && this.isGrounded) {
            this.velocity.y = 7.2;
            this.isGrounded = false;
        }

        this.velocity.y -= 22 * delta;

        let newX = this.position.x + this.velocity.x * delta;
        let newY = this.position.y + this.velocity.y * delta;
        let newZ = this.position.z + this.velocity.z * delta;

        if (newY <= 0) {
            newY = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        const resolvedX = this.resolveCollisions(newX, this.position.z, 'x');
        const resolvedZ = this.resolveCollisions(resolvedX, newZ, 'z');

        this.position.x = THREE.MathUtils.clamp(resolvedX, this.bounds.minX, this.bounds.maxX);
        this.position.y = newY;
        this.position.z = THREE.MathUtils.clamp(resolvedZ, this.bounds.minZ, this.bounds.maxZ);

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
                name: `${nearestAisle.genre} Manga Aisle`,
                genre: nearestAisle.genre,
            });
        } else {
            const elevatorPos = new THREE.Vector3(0, 0, -18);
            if (this.position.distanceTo(elevatorPos) < 3.5) {
                store.setProximityTarget({
                    type: 'elevator',
                    id: 'elevator-1',
                    name: 'Glass Elevator to Floor 2',
                });
            } else {
                store.setActiveGenre(null);
                store.setProximityTarget(null);
            }
        }
    }

    public teleport(target: THREE.Vector3) {
        this.position.copy(target);
        this.velocity.set(0, 0, 0);
        this.avatar.group.position.copy(this.position);
    }
}
