/* ============================================================================
 * [Project: BIOTIC VANGUARD] GameEngine.js
 * Three.js Scene, Camera, Lighting, Snowy Mountain Range, Simulation & Render Loop
 * ============================================================================ */

// 1. Scene, Camera, Renderer Setup
window.scene = new THREE.Scene();
window.scene.background = new THREE.Color(0x5b8ec9);
window.scene.fog = new THREE.FogExp2(0x73a2db, 0.009);

const canvas = document.getElementById('game-canvas');
window.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
window.renderer.setSize(window.innerWidth, window.innerHeight);
window.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
window.renderer.shadowMap.enabled = true;
window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 300);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xf0f9ff, 0x64748b, 0.85);
window.scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.15);
dirLight.position.set(35, 55, 25);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 5;
dirLight.shadow.camera.far = 140;
const d = 40;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
window.scene.add(dirLight);

// 2. Snowy Mountain Range Environment Builder
window.worldObstacles = [];
window.buildSnowyRangeEnvironment = function () {
    const scene = window.scene;

    // Main Snowy Tactical Terrace Floor
    const floorGeo = new THREE.BoxGeometry(70, 2, 70);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85, metalness: 0.05 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Overwatch Orange/Slate Terrace Border Ledges
    const ledgeMat = new THREE.MeshStandardMaterial({ color: 0x9a5b3e, roughness: 0.7 });
    const snowCapMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });

    function createParapet(x, z, w, d, h = 1.1) {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ledgeMat);
        base.position.y = h / 2;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.18, d + 0.15), snowCapMat);
        cap.position.y = h + 0.05;
        cap.receiveShadow = true;
        group.add(cap);

        group.position.set(x, 0, z);
        scene.add(group);
        window.worldObstacles.push(base);
    }

    // Perimeter walls & sniper cover blocks
    createParapet(0, 12.6, 8, 1.2, 0.92); // Iconic sniper ledge behind Ana
    createParapet(-12, 6, 5, 1.4, 1.5);
    createParapet(12, 6, 5, 1.4, 1.5);
    createParapet(-16, -12, 6, 2.0, 2.2);
    createParapet(16, -12, 6, 2.0, 2.2);

    // Distant Alpine Mountain Peaks
    const mountainMat = new THREE.MeshStandardMaterial({
        color: 0xdbeafe,
        roughness: 0.85,
        metalness: 0.05,
        flatShading: true
    });
    const mountainConfigs = [
        { x: -32, z: 58, r: 28, h: 46 },
        { x: 0, z: 68, r: 38, h: 58 },
        { x: 38, z: 55, r: 32, h: 48 },
        { x: -45, z: -55, r: 34, h: 52 },
        { x: -8, z: -62, r: 40, h: 60 },
        { x: 35, z: -52, r: 36, h: 54 },
        { x: -68, z: 5, r: 34, h: 48 },
        { x: 68, z: -5, r: 38, h: 52 }
    ];
    mountainConfigs.forEach(m => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(m.r, m.h, 12), mountainMat);
        cone.position.set(m.x, m.h / 2 - 8, m.z);
        cone.rotation.y = Math.random() * Math.PI;
        scene.add(cone);
    });

    // Sea of Clouds Layer
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.75 });
    for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 46 + (i % 3) * 8;
        const cloud = new THREE.Mesh(new THREE.SphereGeometry(14, 10, 8), cloudMat);
        cloud.scale.set(1.8, 0.35, 1.2);
        cloud.position.set(Math.cos(angle) * dist, -2, Math.sin(angle) * dist);
        scene.add(cloud);
    }
};

// 3. Falling Snowflakes Particle System
const snowCount = 450;
const snowGeo = new THREE.BufferGeometry();
const snowPos = new Float32Array(snowCount * 3);
for (let i = 0; i < snowCount; i++) {
    snowPos[i * 3] = (Math.random() - 0.5) * 70;
    snowPos[i * 3 + 1] = Math.random() * 25;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
}
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
const snowParticles = new THREE.Points(
    snowGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.8 })
);
window.scene.add(snowParticles);

// 4. Ana Models Init
window.anaModel = createAnaCharacterModel();
window.scene.add(window.anaModel.root);

window.fpsViewModel = createFirstPersonViewModel();
window.camera.add(window.fpsViewModel.root);
window.scene.add(window.camera);

// 5. Main Simulation & Update Loop
const clock = new THREE.Clock();

window.updateSimulation = function (dt) {
    const elapsed = clock.getElapsedTime();
    const player = window.player;
    const keys = window.keys || {};
    const anaModel = window.anaModel;
    const fpsViewModel = window.fpsViewModel;
    const camera = window.camera;

    // 1. Update Snowflakes
    const sPos = snowParticles.geometry.attributes.position.array;
    for (let i = 0; i < snowCount; i++) {
        sPos[i * 3 + 1] -= dt * 2.2;
        sPos[i * 3] += Math.sin(elapsed + i) * dt * 0.4;
        if (sPos[i * 3 + 1] < 0) sPos[i * 3 + 1] = 25;
    }
    snowParticles.geometry.attributes.position.needsUpdate = true;

    // 2. Player Timers
    if (player.fireCooldown > 0) player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    if (player.recoilOffset > 0) player.recoilOffset = Math.max(0, player.recoilOffset - dt * 1.35);
    if (player.shootAnimTimer > 0) player.shootAnimTimer = Math.max(0, player.shootAnimTimer - dt);
    if (player.sleepAnimTimer > 0) player.sleepAnimTimer = Math.max(0, player.sleepAnimTimer - dt);
    if (player.nadeAnimTimer > 0) player.nadeAnimTimer = Math.max(0, player.nadeAnimTimer - dt);
    if (player.nanoAnimTimer > 0) player.nanoAnimTimer = Math.max(0, player.nanoAnimTimer - dt);
    if (player.cdShift > 0) player.cdShift = Math.max(0, player.cdShift - dt);
    if (player.cdE > 0) player.cdE = Math.max(0, player.cdE - dt);
    if (player.healBoostTimer > 0) player.healBoostTimer = Math.max(0, player.healBoostTimer - dt);

    player.swayX = THREE.MathUtils.lerp(player.swayX, 0, dt * 8);
    player.swayY = THREE.MathUtils.lerp(player.swayY, 0, dt * 8);

    if (player.isReloading) {
        player.reloadTimer -= dt;
        const reloadWrap = document.getElementById('active-reload-wrap');
        const cursorEl = document.getElementById('active-reload-cursor');
        if (reloadWrap && cursorEl) {
            reloadWrap.classList.remove('hidden');
            const progress = Math.max(0, Math.min(100, (1.0 - player.reloadTimer / player.baseReloadTime) * 100));
            cursorEl.style.left = `${progress}%`;
        }

        if (player.reloadTimer <= 0) {
            player.isReloading = false;
            player.activeReloadWindow = false;
            player.ammo = player.maxAmmo;
            if (reloadWrap) reloadWrap.classList.add('hidden');
        }
    } else {
        const reloadWrap = document.getElementById('active-reload-wrap');
        if (reloadWrap && !reloadWrap.classList.contains('hidden')) reloadWrap.classList.add('hidden');
    }

    player.ultCharge = Math.min(100, player.ultCharge + dt * 1.2);
    if (window.updatePlayerHud) window.updatePlayerHud();

    // 3. Movement
    let isMoving = false;
    let moveForwardSign = 0;
    let moveStrafeSign = 0;
    const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    const moveDir = new THREE.Vector3();

    if (keys['KeyW'] || keys['ArrowUp']) { moveDir.add(forward); moveForwardSign += 1; }
    if (keys['KeyS'] || keys['ArrowDown']) { moveDir.sub(forward); moveForwardSign -= 1; }
    if (keys['KeyD'] || keys['ArrowRight']) { moveDir.add(right); moveStrafeSign += 1; }
    if (keys['KeyA'] || keys['ArrowLeft']) { moveDir.sub(right); moveStrafeSign -= 1; }

    if (player.touchMoveVector.lengthSq() > 0.001) {
        const joyForward = forward.clone().multiplyScalar(-player.touchMoveVector.y);
        const joyRight = right.clone().multiplyScalar(player.touchMoveVector.x);
        moveDir.add(joyForward).add(joyRight);
        moveForwardSign += -player.touchMoveVector.y;
        moveStrafeSign += player.touchMoveVector.x;
    }

    if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        isMoving = true;
        const speed = player.isScoped ? 3.2 : 6.8;
        player.pos.x = Math.max(-28, Math.min(28, player.pos.x + moveDir.x * speed * dt));
        player.pos.z = Math.max(-28, Math.min(28, player.pos.z + moveDir.z * speed * dt));
    }

    const targetWalkWeight = isMoving ? 1.0 : 0.0;
    player.walkWeight = THREE.MathUtils.lerp(player.walkWeight, targetWalkWeight, dt * 10);
    if (player.walkWeight > 0.01) {
        const strideRate = player.isScoped ? 6.5 : 11.2;
        player.walkPhase += dt * strideRate * (moveForwardSign < 0 ? -1 : 1);
    }

    // Gravity & Jump
    player.pos.y += player.vel.y * dt;
    if (player.pos.y > 0) {
        player.vel.y -= 18 * dt;
    } else {
        player.pos.y = 0;
        player.vel.y = 0;
    }

    // 4. Animate 3rd-Person Ana Rig
    anaModel.root.position.copy(player.pos);
    anaModel.root.rotation.y = player.yaw + Math.PI;

    const flashAlpha = player.shootAnimTimer > 0.56 ? (player.shootAnimTimer - 0.56) / 0.12 : 0.0;
    anaModel.muzzleFlashMat.opacity = flashAlpha;
    fpsViewModel.fpsMuzzleFlashMat.opacity = flashAlpha;

    let boltPull = 0;
    if (player.shootAnimTimer > 0.15 && player.shootAnimTimer < 0.52) {
        const norm = 1.0 - Math.abs(player.shootAnimTimer - 0.335) / 0.185;
        boltPull = Math.max(0, norm);
    }
    anaModel.boltCarrierGroup.position.z = 0.02 - boltPull * 0.095;
    anaModel.bioticChamber.position.z = 0.04 - boltPull * 0.045;

    if (player.isReloading) {
        const rNorm = 1.0 - (player.reloadTimer / 1.35);
        const magDrop = Math.sin(rNorm * Math.PI);
        anaModel.gripCanister.position.y = -0.10 - magDrop * 0.18;
    } else {
        anaModel.gripCanister.position.y = -0.10;
    }

    const w = player.walkWeight;
    const wp = player.walkPhase;
    const lKnee = anaModel.leftLeg.userData.kneeGroup;
    const rKnee = anaModel.rightLeg.userData.kneeGroup;
    const lBoot = anaModel.leftLeg.userData.bootGroup;
    const rBoot = anaModel.rightLeg.userData.bootGroup;

    if (player.viewMode === 'pose' && w < 0.05) {
        anaModel.pelvis.position.y = 0.84 + Math.sin(elapsed * 1.8) * 0.008;
        anaModel.pelvis.rotation.y = 0;
        anaModel.torso.rotation.y = -0.26;
        anaModel.torso.rotation.x = -player.recoilOffset * 0.35;
        anaModel.headGroup.rotation.y = 0.24;
        anaModel.headGroup.rotation.x = 0.06 - player.recoilOffset * 0.3;

        anaModel.leftLeg.rotation.x = -0.42;
        anaModel.leftLeg.rotation.z = 0.16;
        lKnee.rotation.x = 0.52;
        lBoot.rotation.x = -0.10;

        anaModel.rightLeg.rotation.x = 0.28;
        anaModel.rightLeg.rotation.z = -0.18;
        rKnee.rotation.x = 0.36;
        rBoot.rotation.x = -0.25;
    } else {
        const lThighSwing = Math.sin(wp) * 0.58 * w;
        const rThighSwing = Math.sin(wp + Math.PI) * 0.58 * w;
        const lKneeBend = Math.max(0.08, (Math.cos(wp - 0.5) * 0.5 + 0.5) * 0.88 * w);
        const rKneeBend = Math.max(0.08, (Math.cos(wp + Math.PI - 0.5) * 0.5 + 0.5) * 0.88 * w);

        const strafeLean = moveStrafeSign * 0.12 * w;
        anaModel.pelvis.position.y = 0.90 - w * 0.04 + Math.abs(Math.cos(wp)) * 0.055 * w + (1 - w) * Math.sin(elapsed * 2) * 0.01;
        anaModel.pelvis.rotation.y = Math.sin(wp) * 0.08 * w;

        anaModel.leftLeg.rotation.x = lThighSwing - (1 - w) * 0.18;
        anaModel.leftLeg.rotation.z = 0.08 + strafeLean;
        lKnee.rotation.x = lKneeBend + (1 - w) * 0.25;
        lBoot.rotation.x = -lKneeBend * 0.35;

        anaModel.rightLeg.rotation.x = rThighSwing + (1 - w) * 0.14;
        anaModel.rightLeg.rotation.z = -0.08 + strafeLean;
        rKnee.rotation.x = rKneeBend + (1 - w) * 0.22;
        rBoot.rotation.x = -rKneeBend * 0.35;

        const airFlare = Math.min(0.45, player.pos.y * 0.25);
        anaModel.leftCoatPanel.rotation.z = 0.28 + Math.abs(lThighSwing) * 0.32 + airFlare;
        anaModel.rightCoatPanel.rotation.z = -0.28 - Math.abs(rThighSwing) * 0.32 - airFlare;
        anaModel.backCapeGroup.rotation.x = 0.12 + w * 0.28 + Math.sin(wp * 2) * 0.08 * w + airFlare;

        anaModel.torso.rotation.y = -0.14 - Math.sin(wp) * 0.07 * w;
        anaModel.torso.rotation.x = w * 0.08 - player.recoilOffset * 0.35;
        anaModel.headGroup.rotation.y = 0.14 + Math.sin(wp) * 0.05 * w;
        anaModel.headGroup.rotation.x = -player.pitch * 0.55 - player.recoilOffset * 0.3;
    }

    const walkBobX = Math.cos(wp) * 0.025 * w;
    const walkBobY = Math.abs(Math.sin(wp)) * 0.032 * w;
    const basePitchAim = (player.viewMode === 'pose' && w < 0.05) ? -0.05 : -player.pitch * 0.85;
    anaModel.rifleGroup.position.x = -0.06 + walkBobX;
    anaModel.rifleGroup.position.y = 0.33 - walkBobY + (player.isReloading ? -0.05 : 0);
    anaModel.rifleGroup.position.z = 0.34 - player.recoilOffset * 0.38;
    anaModel.rifleGroup.rotation.x = basePitchAim - player.recoilOffset * 0.75 + (player.isReloading ? 0.25 : 0);
    anaModel.rifleGroup.rotation.z = player.isReloading ? -0.35 : 0;

    // 3rd-Person Left Arm Skills
    anaModel.heldGrenadeProp.visible = (player.nadeAnimTimer > 0.25);
    if (player.sleepAnimTimer > 0) {
        const sNorm = player.sleepAnimTimer / 0.78;
        const kick = (sNorm > 0.55 && sNorm < 0.85) ? Math.sin((sNorm - 0.55) / 0.3 * Math.PI) * 0.38 : 0;
        anaModel.leftShoulder.rotation.x = -0.65 - kick;
        anaModel.leftShoulder.rotation.y = 0.32;
        anaModel.leftElbow.rotation.x = 0.45 - kick * 0.5;
    } else if (player.nadeAnimTimer > 0) {
        const nNorm = 1.0 - (player.nadeAnimTimer / 0.65);
        const swing = nNorm < 0.35
            ? THREE.MathUtils.lerp(0, 0.75, nNorm / 0.35)
            : THREE.MathUtils.lerp(0.75, -1.15, (nNorm - 0.35) / 0.65);
        anaModel.leftShoulder.rotation.x = swing;
        anaModel.leftShoulder.rotation.y = 0.25;
        anaModel.leftElbow.rotation.x = 0.35;
    } else if (player.nanoAnimTimer > 0) {
        const qNorm = Math.sin((player.nanoAnimTimer / 0.72) * Math.PI);
        anaModel.leftShoulder.rotation.x = -0.85 * qNorm;
        anaModel.leftShoulder.rotation.y = 0.4 * qNorm;
        anaModel.leftElbow.rotation.x = 0.5 * qNorm;
    } else if (player.isReloading) {
        const rNorm = 1.0 - (player.reloadTimer / 1.35);
        anaModel.leftShoulder.rotation.x = Math.sin(rNorm * Math.PI * 2) * 0.25;
        anaModel.leftShoulder.rotation.y = -0.15;
        anaModel.leftElbow.rotation.x = -0.25 + Math.sin(rNorm * Math.PI) * 0.35;
    } else {
        anaModel.leftShoulder.rotation.x = THREE.MathUtils.lerp(anaModel.leftShoulder.rotation.x, 0, dt * 12);
        anaModel.leftShoulder.rotation.y = THREE.MathUtils.lerp(anaModel.leftShoulder.rotation.y, 0, dt * 12);
        anaModel.leftElbow.rotation.x = THREE.MathUtils.lerp(anaModel.leftElbow.rotation.x, 0, dt * 12);
    }

    // 5. Animate 1st-Person FPS Viewmodel
    if (player.viewMode === 'fps' && !player.isScoped) {
        fpsViewModel.root.visible = true;

        const breathY = Math.sin(elapsed * 2.2) * 0.004;
        const fpsBobX = Math.cos(wp) * 0.018 * w + player.swayX;
        const fpsBobY = Math.abs(Math.sin(wp)) * 0.022 * w + breathY + player.swayY;

        const kickZ = player.recoilOffset * 0.42;
        const kickPitch = player.recoilOffset * 0.65;

        let reloadTiltZ = 0;
        let reloadPitchX = 0;
        if (player.isReloading) {
            const rNorm = 1.0 - (player.reloadTimer / 1.35);
            const reloadCurve = Math.sin(rNorm * Math.PI);
            reloadTiltZ = 0.48 * reloadCurve;
            reloadPitchX = 0.22 * reloadCurve;
            fpsViewModel.fpsMagazine.position.y = -0.095 - Math.max(0, Math.sin(rNorm * Math.PI * 1.4)) * 0.22;
            if (rNorm > 0.72) {
                const rack = Math.sin(((rNorm - 0.72) / 0.28) * Math.PI);
                boltPull = Math.max(boltPull, rack);
            }
        } else {
            fpsViewModel.fpsMagazine.position.y = -0.095;
        }

        fpsViewModel.gunPivot.position.set(
            0.27 + fpsBobX,
            -0.25 - fpsBobY - player.recoilOffset * 0.04,
            -0.46 + kickZ
        );
        fpsViewModel.gunPivot.rotation.set(
            kickPitch + reloadPitchX,
            player.swayX * 0.8,
            -moveStrafeSign * 0.04 * w + reloadTiltZ
        );

        fpsViewModel.fpsBoltGroup.position.z = -0.01 + boltPull * 0.11;
        fpsViewModel.fpsBioticVial.position.z = -0.02 + boltPull * 0.05;

        fpsViewModel.sleepPistolProp.visible = (player.sleepAnimTimer > 0);
        fpsViewModel.nadeHandProp.visible = (player.nadeAnimTimer > 0.22);

        if (player.sleepAnimTimer > 0) {
            const sNorm = 1.0 - (player.sleepAnimTimer / 0.78);
            const popIn = Math.sin(Math.min(1, sNorm * 2.5) * Math.PI * 0.5);
            const recoilKick = (sNorm > 0.14 && sNorm < 0.55)
                ? Math.sin(((sNorm - 0.14) / 0.41) * Math.PI)
                : 0;
            fpsViewModel.leftActionPivot.position.set(
                -0.19 + fpsBobX * 0.5,
                -0.32 + popIn * 0.16 + recoilKick * 0.04,
                -0.42 + recoilKick * 0.11
            );
            fpsViewModel.leftActionPivot.rotation.set(
                recoilKick * 0.48,
                -0.12,
                0.08
            );
        } else if (player.nadeAnimTimer > 0) {
            const nNorm = 1.0 - (player.nadeAnimTimer / 0.65);
            const throwArcZ = nNorm < 0.3
                ? THREE.MathUtils.lerp(-0.38, -0.22, nNorm / 0.3)
                : THREE.MathUtils.lerp(-0.22, -0.68, (nNorm - 0.3) / 0.7);
            const throwArcY = Math.sin(nNorm * Math.PI) * 0.16;
            fpsViewModel.leftActionPivot.position.set(-0.16, -0.24 + throwArcY, throwArcZ);
            fpsViewModel.leftActionPivot.rotation.set(-Math.sin(nNorm * Math.PI) * 0.65, -0.25, 0.2);
        } else if (player.nanoAnimTimer > 0) {
            const qNorm = Math.sin((player.nanoAnimTimer / 0.72) * Math.PI);
            fpsViewModel.leftActionPivot.position.set(-0.15, -0.16 * qNorm - 0.12, -0.38 - qNorm * 0.16);
            fpsViewModel.leftActionPivot.rotation.set(0.25 * qNorm, -0.3, 0.35);
        } else if (player.isReloading) {
            const rNorm = 1.0 - (player.reloadTimer / 1.35);
            const reach = Math.sin(rNorm * Math.PI);
            fpsViewModel.leftActionPivot.position.set(
                -0.24 + reach * 0.38,
                -0.26 - Math.sin(rNorm * Math.PI * 2) * 0.08,
                -0.44 + reach * 0.08
            );
            fpsViewModel.leftActionPivot.rotation.set(0.2 * reach, -0.5 * reach, -0.3 * reach);
        } else {
            fpsViewModel.leftActionPivot.position.set(0.12 + fpsBobX, -0.29 - fpsBobY, -0.55 + kickZ);
            fpsViewModel.leftActionPivot.rotation.set(0.15 + kickPitch, 0.45, -0.25);
        }
    } else {
        fpsViewModel.root.visible = false;
    }

    // 6. Camera Placement (TPS Over-the-Shoulder / FPS)
    if (player.viewMode === 'fps' || player.isScoped) {
        const eyePos = player.pos.clone().add(new THREE.Vector3(0, 1.56, 0));
        camera.position.copy(eyePos);
        const lookTarget = eyePos.clone().add(new THREE.Vector3(
            -Math.sin(player.yaw) * Math.cos(player.pitch),
            Math.sin(player.pitch),
            -Math.cos(player.yaw) * Math.cos(player.pitch)
        ));
        camera.lookAt(lookTarget);
    } else {
        // TPS Over-the-Shoulder View (Optimal battlefield visibility)
        const rightOffset = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw)).multiplyScalar(0.68);
        const forwardDir = new THREE.Vector3(
            -Math.sin(player.yaw) * Math.cos(player.pitch),
            Math.sin(player.pitch),
            -Math.cos(player.yaw) * Math.cos(player.pitch)
        );
        const pivot = player.pos.clone().add(new THREE.Vector3(0, 1.62, 0)).add(rightOffset);
        camera.position.copy(pivot).sub(forwardDir.clone().multiplyScalar(2.65));
        if (camera.position.y < 0.35) camera.position.y = 0.35;
        camera.lookAt(pivot.clone().add(forwardDir.multiplyScalar(30)));
    }

    // 7. Update Projectiles & Combat Entities
    if (window.updateCombatEntities) {
        window.updateCombatEntities(dt);
    }

    // 8. Update Training Bots (Patrol, Skirmish, 2D UI mapping)
    if (window.updateBots) {
        window.updateBots(dt, elapsed);
    }

    // 9. Threat Indicator Ring Update
    const threatRing = document.getElementById('threat-indicator');
    const threatPointer = document.getElementById('threat-pointer');
    let nearestEnemy = null;
    let minEnemyDist = Infinity;

    (window.bots || []).filter(b => b.team === 'enemy' && !b.isDead).forEach(enemy => {
        const d = player.pos.distanceTo(enemy.group.position);
        if (d < minEnemyDist) {
            minEnemyDist = d;
            nearestEnemy = enemy;
        }
    });

    if (nearestEnemy && minEnemyDist < 35 && threatRing && threatPointer) {
        const dx = nearestEnemy.group.position.x - player.pos.x;
        const dz = nearestEnemy.group.position.z - player.pos.z;
        const worldAngle = Math.atan2(dx, dz);
        const relAngle = worldAngle - player.yaw + Math.PI;
        threatRing.style.transform = `rotate(${relAngle}rad)`;
        threatPointer.style.opacity = minEnemyDist < 12 ? '1.0' : '0.55';
    } else if (threatPointer) {
        threatPointer.style.opacity = '0';
    }

    // Real-time Smart-Aim Guide feedback
    if (window.checkSmartAimTarget && window.getAimRay) {
        window.checkSmartAimTarget(window.getAimRay());
    }
};

window.animateLoop = function () {
    requestAnimationFrame(window.animateLoop);
    const dt = Math.min(0.05, clock.getDelta());
    window.updateSimulation(dt);
    window.renderer.render(window.scene, window.camera);
};

let isGameInitialized = false;
window.initGame = function () {
    if (isGameInitialized) return;
    isGameInitialized = true;

    window.sfx = new AnaSoundEngine();
    window.buildSnowyRangeEnvironment();
    window.initDefaultBots();
    window.initMobileTouchController();
    window.initInputHandler();
    if (window.setViewMode) window.setViewMode('tps');
    window.updatePlayerHud();

    window.showCombatCallout(
        '🏔️ [Project: BIOTIC VANGUARD] 1단계 작전 개시!',
        '화면 클릭으로 조준 활성화 / 적 처치 시 ATK 영구 상승 / 아군 치유 시 MAX HP 영구 상승!',
        'border-cyan-400 text-cyan-300'
    );

    window.animateLoop();
};

// Immediate start if DOM already loaded (solves network/GitHub Pages timing)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.initGame();
} else {
    window.addEventListener('DOMContentLoaded', window.initGame);
}
window.addEventListener('load', window.initGame);
