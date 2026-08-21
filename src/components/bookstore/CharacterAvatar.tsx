import * as THREE from 'three';

export interface AvatarCustomization {
    hairColor: string;
    hoodieColor: string;
    pantsColor: string;
}

export type AvatarEmote = 'wave' | 'read' | 'dance' | 'cheer' | 'think' | 'bow' | null;

export interface AvatarController {
    group: THREE.Group;
    update: (speed: number, delta: number) => void;
    setCustomization: (custom: AvatarCustomization) => void;
    setSitting: (sitting: boolean) => void;
    playEmote: (emote: AvatarEmote) => void;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    head: THREE.Group;
}

export function createCharacterAvatar(initialCustom?: AvatarCustomization): AvatarController {
    const group = new THREE.Group();

    const custom: AvatarCustomization = {
        hairColor: initialCustom?.hairColor || '#1a1a24',
        hoodieColor: initialCustom?.hoodieColor || '#2563eb',
        pantsColor: initialCustom?.pantsColor || '#1e293b',
    };

    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffd1b3,
        roughness: 0.6,
    });

    const hairMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(custom.hairColor),
        roughness: 0.4,
    });

    const hoodieMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(custom.hoodieColor),
        roughness: 0.7,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(custom.pantsColor),
        roughness: 0.8,
    });

    const shoesMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.3,
    });

    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.95;

    const bodyGeo = new THREE.BoxGeometry(0.5, 0.6, 0.28);
    const bodyMesh = new THREE.Mesh(bodyGeo, hoodieMat);
    bodyMesh.castShadow = true;
    torsoGroup.add(bodyMesh);

    const zipper = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.58, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    zipper.position.set(0, 0, 0.145);
    torsoGroup.add(zipper);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.48, 0);

    const headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.36);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    const hairTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.18, 0.4),
        hairMat
    );
    hairTop.position.set(0, 0.15, -0.02);
    headGroup.add(hairTop);

    const hairBangs = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.14, 0.12),
        hairMat
    );
    hairBangs.position.set(0, 0.12, 0.18);
    headGroup.add(hairBangs);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), eyeMat);
    leftEye.position.set(-0.1, 0, 0.185);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), eyeMat);
    rightEye.position.set(0.1, 0, 0.185);
    headGroup.add(rightEye);

    torsoGroup.add(headGroup);

    const createLimb = (
        width: number,
        height: number,
        depth: number,
        mainMat: THREE.Material,
        endMat?: THREE.Material
    ) => {
        const pivot = new THREE.Group();
        const upper = new THREE.Mesh(
            new THREE.BoxGeometry(width, height * 0.8, depth),
            mainMat
        );
        upper.position.y = -height * 0.4;
        upper.castShadow = true;
        pivot.add(upper);

        if (endMat) {
            const end = new THREE.Mesh(
                new THREE.BoxGeometry(width * 1.05, height * 0.25, depth * 1.2),
                endMat
            );
            end.position.y = -height * 0.88;
            end.castShadow = true;
            pivot.add(end);
        }
        return pivot;
    };

    const leftArm = createLimb(0.16, 0.55, 0.16, hoodieMat, skinMat);
    leftArm.position.set(-0.35, 0.25, 0);
    torsoGroup.add(leftArm);

    const rightArm = createLimb(0.16, 0.55, 0.16, hoodieMat, skinMat);
    rightArm.position.set(0.35, 0.25, 0);
    torsoGroup.add(rightArm);

    const miniBookGeo = new THREE.BoxGeometry(0.3, 0.38, 0.06);
    const miniBookMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const miniBook = new THREE.Mesh(miniBookGeo, miniBookMat);
    miniBook.position.set(0, -0.1, 0.35);
    miniBook.rotation.x = Math.PI / 6;
    miniBook.visible = false;
    torsoGroup.add(miniBook);

    group.add(torsoGroup);

    const leftLeg = createLimb(0.18, 0.65, 0.18, pantsMat, shoesMat);
    leftLeg.position.set(-0.15, 0.65, 0);
    group.add(leftLeg);

    const rightLeg = createLimb(0.18, 0.65, 0.18, pantsMat, shoesMat);
    rightLeg.position.set(0.15, 0.65, 0);
    group.add(rightLeg);

    let walkCycle = 0;
    let emoteTime = 0;
    let isSittingState = false;
    let currentEmote: AvatarEmote = null;

    const setCustomization = (newCustom: AvatarCustomization) => {
        hairMat.color.set(newCustom.hairColor);
        hoodieMat.color.set(newCustom.hoodieColor);
        pantsMat.color.set(newCustom.pantsColor);
    };

    const setSitting = (sitting: boolean) => {
        isSittingState = sitting;
        if (sitting) currentEmote = null;
    };

    const playEmote = (emote: AvatarEmote) => {
        currentEmote = emote;
        emoteTime = 0;
        miniBook.visible = emote === 'read';
    };

    const update = (speed: number, delta: number) => {
        if (isSittingState) {
            leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, -Math.PI / 2, 0.15);
            rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, -Math.PI / 2, 0.15);
            leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -Math.PI / 4, 0.15);
            rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.PI / 4, 0.15);
            torsoGroup.position.y = THREE.MathUtils.lerp(torsoGroup.position.y, 0.6, 0.15);
            headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.15);
            headGroup.rotation.x = 0;
            return;
        }

        if (speed > 0.1) {
            currentEmote = null;
            miniBook.visible = false;
            walkCycle += delta * speed * 12;
            const swing = Math.sin(walkCycle) * 0.65;

            leftLeg.rotation.x = swing;
            rightLeg.rotation.x = -swing;
            leftLeg.rotation.z = 0;
            rightLeg.rotation.z = 0;

            leftArm.rotation.x = -swing * 0.8;
            rightArm.rotation.x = swing * 0.8;
            leftArm.rotation.z = 0;
            rightArm.rotation.z = 0;

            torsoGroup.position.y = 0.95 + Math.abs(Math.sin(walkCycle * 2)) * 0.04;
            torsoGroup.rotation.set(0, 0, 0);
            headGroup.rotation.y = Math.sin(walkCycle) * 0.05;
            headGroup.rotation.x = 0;
            return;
        }

        walkCycle = 0;
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.15);
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.15);
        leftLeg.rotation.z = THREE.MathUtils.lerp(leftLeg.rotation.z, 0, 0.15);
        rightLeg.rotation.z = THREE.MathUtils.lerp(rightLeg.rotation.z, 0, 0.15);

        if (currentEmote) {
            emoteTime += delta;

            if (currentEmote === 'wave') {
                rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.PI * 0.8, 0.2);
                rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.4 + Math.sin(emoteTime * 12) * 0.35, 0.3);
                leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.15);
                leftArm.rotation.z = 0;
                headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0.2, 0.1);
            } else if (currentEmote === 'read') {
                leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -Math.PI * 0.4, 0.2);
                leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.3, 0.2);
                rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.PI * 0.4, 0.2);
                rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.3, 0.2);
                headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.3, 0.2);
                torsoGroup.position.y = 0.95;
            } else if (currentEmote === 'dance') {
                const bounce = Math.sin(emoteTime * 8);
                torsoGroup.position.y = 0.95 + Math.abs(bounce) * 0.08;
                torsoGroup.rotation.z = bounce * 0.1;
                leftArm.rotation.x = Math.sin(emoteTime * 8) * 0.8;
                rightArm.rotation.x = -Math.sin(emoteTime * 8) * 0.8;
                leftArm.rotation.z = 0.4;
                rightArm.rotation.z = -0.4;
                headGroup.rotation.y = bounce * 0.2;
            } else if (currentEmote === 'cheer') {
                const hop = Math.abs(Math.sin(emoteTime * 6));
                torsoGroup.position.y = 0.95 + hop * 0.12;
                leftArm.rotation.x = -Math.PI * 0.85;
                rightArm.rotation.x = -Math.PI * 0.85;
                leftArm.rotation.z = 0.3;
                rightArm.rotation.z = -0.3;
                headGroup.rotation.x = -0.25;
            } else if (currentEmote === 'think') {
                rightArm.rotation.x = -Math.PI * 0.55;
                rightArm.rotation.z = -0.35;
                leftArm.rotation.x = -Math.PI * 0.2;
                leftArm.rotation.z = 0.2;
                headGroup.rotation.x = 0.2;
                headGroup.rotation.y = -0.25;
                headGroup.rotation.z = -0.15;
            } else if (currentEmote === 'bow') {
                torsoGroup.rotation.x = THREE.MathUtils.lerp(torsoGroup.rotation.x, 0.55, 0.15);
                leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -0.3, 0.15);
                rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -0.3, 0.15);
                headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.2, 0.15);
            }
        } else {
            leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.15);
            rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.15);
            leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0, 0.15);
            rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0, 0.15);
            torsoGroup.position.y = THREE.MathUtils.lerp(torsoGroup.position.y, 0.95, 0.15);
            torsoGroup.rotation.set(0, 0, 0);
            headGroup.rotation.set(0, 0, 0);
        }
    };

    return {
        group,
        update,
        setCustomization,
        setSitting,
        playEmote,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        head: headGroup,
    };
}
