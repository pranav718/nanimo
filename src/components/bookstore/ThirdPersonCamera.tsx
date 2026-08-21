import * as THREE from 'three';

export class ThirdPersonCamera {
    public camera: THREE.PerspectiveCamera;
    public theta: number;
    public phi: number;
    public distance: number;
    public isFirstPerson: boolean;

    private target: THREE.Vector3;
    private currentLookAt: THREE.Vector3;
    private isDragging: boolean;
    private lastMouse: { x: number; y: number };
    private touchId: number | null;

    constructor(fov = 60, aspect = 1, near = 0.1, far = 1000) {
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.theta = Math.PI;
        this.phi = 0.55;
        this.distance = 5.6;
        this.isFirstPerson = false;

        this.target = new THREE.Vector3(0, 1.2, 0);
        this.currentLookAt = new THREE.Vector3(0, 1.2, 0);
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.touchId = null;

        this.bindEvents();
    }

    public togglePerspective() {
        this.isFirstPerson = !this.isFirstPerson;
    }

    private bindEvents() {
        if (typeof window === 'undefined') return;

        window.addEventListener('mousedown', (e) => {
            if ((e.target as HTMLElement)?.closest('button, input, [data-interactive]')) return;
            this.isDragging = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;

            this.theta -= dx * 0.005;
            const minPhi = this.isFirstPerson ? 0.1 : 0.15;
            const maxPhi = this.isFirstPerson ? Math.PI - 0.1 : 1.35;
            this.phi = THREE.MathUtils.clamp(this.phi + dy * 0.005, minPhi, maxPhi);

            this.lastMouse = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('wheel', (e) => {
            if (!this.isFirstPerson) {
                this.distance = THREE.MathUtils.clamp(this.distance + e.deltaY * 0.005, 2.8, 9.0);
            }
        }, { passive: true });
    }

    public handleTouchStart(touch: { identifier: number; clientX: number; clientY: number }) {
        this.touchId = touch.identifier;
        this.lastMouse = { x: touch.clientX, y: touch.clientY };
    }

    public handleTouchMove(touch: { identifier: number; clientX: number; clientY: number }) {
        if (this.touchId !== touch.identifier) return;
        const dx = touch.clientX - this.lastMouse.x;
        const dy = touch.clientY - this.lastMouse.y;

        this.theta -= dx * 0.006;
        const minPhi = this.isFirstPerson ? 0.1 : 0.15;
        const maxPhi = this.isFirstPerson ? Math.PI - 0.1 : 1.35;
        this.phi = THREE.MathUtils.clamp(this.phi + dy * 0.006, minPhi, maxPhi);

        this.lastMouse = { x: touch.clientX, y: touch.clientY };
    }

    public handleTouchEnd(identifier: number) {
        if (this.touchId === identifier) {
            this.touchId = null;
        }
    }

    public update(targetPosition: THREE.Vector3, delta: number) {
        if (this.isFirstPerson) {
            this.target.set(targetPosition.x, targetPosition.y + 1.45, targetPosition.z);
            this.camera.position.copy(this.target);

            const lookTarget = new THREE.Vector3(
                this.target.x + Math.sin(this.phi) * Math.sin(this.theta),
                this.target.y + Math.cos(this.phi),
                this.target.z + Math.sin(this.phi) * Math.cos(this.theta)
            );
            this.camera.lookAt(lookTarget);
        } else {
            this.target.set(targetPosition.x, targetPosition.y + 1.25, targetPosition.z);

            const offsetX = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
            const offsetY = this.distance * Math.cos(this.phi);
            const offsetZ = this.distance * Math.sin(this.phi) * Math.cos(this.theta);

            const desiredCamPos = new THREE.Vector3(
                this.target.x + offsetX,
                Math.max(0.6, this.target.y + offsetY),
                this.target.z + offsetZ
            );

            const followSpeed = 10 * delta;
            this.camera.position.lerp(desiredCamPos, followSpeed);

            this.currentLookAt.lerp(this.target, followSpeed);
            this.camera.lookAt(this.currentLookAt);
        }
    }

    public getYaw(): number {
        return this.theta;
    }
}
