import * as THREE from 'three';

export interface AmbientParticlesResult {
    group: THREE.Group;
    update: (delta: number, floor: number) => void;
}

export function createAmbientParticles(): AmbientParticlesResult {
    const group = new THREE.Group();
    const count = 250;

    const positions = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number; baseSpeed: number }[] = [];

    const roomW = 40;
    const roomH = 6.5;
    const roomD = 40;

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * roomW;
        positions[i * 3 + 1] = Math.random() * roomH;
        positions[i * 3 + 2] = (Math.random() - 0.5) * roomD;

        velocities.push({
            x: (Math.random() - 0.5) * 0.15,
            y: 0.08 + Math.random() * 0.12,
            z: (Math.random() - 0.5) * 0.15,
            baseSpeed: 0.5 + Math.random() * 0.5,
        });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
        color: 0xfef08a,
        size: 0.09,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const particles = new THREE.Points(geo, pMat);
    group.add(particles);

    const update = (delta: number, floor: number) => {
        const posArr = geo.attributes.position.array as Float32Array;

        if (floor === 1) {
            pMat.color.setHex(0xfef08a);
            pMat.opacity = 0.55;
        } else if (floor === 2) {
            pMat.color.setHex(0x38bdf8);
            pMat.opacity = 0.65;
        } else {
            pMat.color.setHex(0xf472b6);
            pMat.opacity = 0.75;
        }

        for (let i = 0; i < count; i++) {
            const vel = velocities[i];
            posArr[i * 3] += vel.x * delta;
            posArr[i * 3 + 1] += vel.y * delta * vel.baseSpeed;
            posArr[i * 3 + 2] += vel.z * delta;

            if (posArr[i * 3 + 1] > roomH) {
                posArr[i * 3 + 1] = 0.1;
                posArr[i * 3] = (Math.random() - 0.5) * roomW;
                posArr[i * 3 + 2] = (Math.random() - 0.5) * roomD;
            }
        }

        geo.attributes.position.needsUpdate = true;
    };

    return { group, update };
}
