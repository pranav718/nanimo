import * as THREE from 'three';

export type PetCompanionType = 'none' | 'kitsune' | 'cybercat' | 'shiba';

export interface PetCompanionResult {
    group: THREE.Group;
    update: (targetPos: THREE.Vector3, delta: number) => void;
    setPetType: (type: PetCompanionType) => void;
}

export function createPetCompanion(): PetCompanionResult {
    const group = new THREE.Group();
    let currentType: PetCompanionType = 'kitsune';

    const kitsuneGroup = new THREE.Group();
    const foxMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        roughness: 0.3,
        emissive: new THREE.Color(0xf97316),
        emissiveIntensity: 0.4,
    });
    const foxBody = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), foxMat);
    kitsuneGroup.add(foxBody);

    const earGeo = new THREE.ConeGeometry(0.08, 0.16, 8);
    const leftEar = new THREE.Mesh(earGeo, foxMat);
    leftEar.position.set(-0.12, 0.22, 0.05);
    kitsuneGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, foxMat);
    rightEar.position.set(0.12, 0.22, 0.05);
    kitsuneGroup.add(rightEar);

    const foxTail = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), foxMat);
    foxTail.position.set(0, -0.05, -0.28);
    kitsuneGroup.add(foxTail);

    const foxLight = new THREE.PointLight(0xf97316, 1.5, 3.5);
    kitsuneGroup.add(foxLight);
    group.add(kitsuneGroup);

    const cybercatGroup = new THREE.Group();
    const catMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.2,
        metalness: 0.8,
        emissive: new THREE.Color(0x06b6d4),
        emissiveIntensity: 0.5,
    });
    const catHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.3), catMat);
    cybercatGroup.add(catHead);

    const catEarGeo = new THREE.ConeGeometry(0.08, 0.15, 4);
    const catLeftEar = new THREE.Mesh(catEarGeo, catMat);
    catLeftEar.position.set(-0.12, 0.22, 0);
    cybercatGroup.add(catLeftEar);

    const catRightEar = new THREE.Mesh(catEarGeo, catMat);
    catRightEar.position.set(0.12, 0.22, 0);
    cybercatGroup.add(catRightEar);

    cybercatGroup.visible = false;
    group.add(cybercatGroup);

    const shibaGroup = new THREE.Group();
    const shibaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const shibaHead = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.34), shibaMat);
    shibaGroup.add(shibaHead);

    const snout = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.14, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xffedd5 })
    );
    snout.position.set(0, -0.05, 0.2);
    shibaGroup.add(snout);

    shibaGroup.visible = false;
    group.add(shibaGroup);

    const setPetType = (type: PetCompanionType) => {
        currentType = type;
        if (type === 'none') {
            group.visible = false;
            return;
        }
        group.visible = true;
        kitsuneGroup.visible = type === 'kitsune';
        cybercatGroup.visible = type === 'cybercat';
        shibaGroup.visible = type === 'shiba';
    };

    let floatTime = 0;
    const currentPos = new THREE.Vector3(0, 1.2, 0);

    const update = (targetPos: THREE.Vector3, delta: number) => {
        if (currentType === 'none') return;
        floatTime += delta;

        const desiredX = targetPos.x - 1.2;
        const desiredY = targetPos.y + 0.85 + Math.sin(floatTime * 3) * 0.12;
        const desiredZ = targetPos.z + 1.2;

        currentPos.x = THREE.MathUtils.lerp(currentPos.x, desiredX, delta * 3.5);
        currentPos.y = THREE.MathUtils.lerp(currentPos.y, desiredY, delta * 3.5);
        currentPos.z = THREE.MathUtils.lerp(currentPos.z, desiredZ, delta * 3.5);

        group.position.copy(currentPos);
        group.rotation.y = Math.sin(floatTime * 2) * 0.3;
    };

    return { group, update, setPetType };
}
