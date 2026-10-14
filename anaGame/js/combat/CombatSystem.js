/* ============================================================================
 * [Project: BIOTIC VANGUARD] CombatSystem.js
 * Player Combat State, Biotic Rifle, Sleep Dart, Biotic Grenade, Nano Boost & VFX
 * ============================================================================ */

window.player = {
    pos: new THREE.Vector3(0, 0, 11.4),
    vel: new THREE.Vector3(),
    yaw: Math.PI,
    pitch: 0,
    hp: 250,
    maxHp: 250,
    overhealth: 0,
    healBoostTimer: 0,
    ammo: 10,
    maxAmmo: 10,
    isReloading: false,
    reloadTimer: 0,
    baseReloadTime: 1.35,
    veteranTier: 0,
    isScoped: false,
    viewMode: 'tps', // 'tps' | 'fps'
    fireCooldown: 0,
    recoilOffset: 0,
    shootAnimTimer: 0,
    sleepAnimTimer: 0,
    nadeAnimTimer: 0,
    nanoAnimTimer: 0,
    walkPhase: 0,
    walkWeight: 0,
    swayX: 0,
    swayY: 0,
    cdShift: 0,
    cdE: 0,
    ultCharge: 100,
    poseOrbitYaw: -0.62,
    poseOrbitPitch: 0.04,
    poseZoomDist: 1.85,
    activeReloadWindow: false,
    touchMoveVector: new THREE.Vector2(0, 0)
};

window.projectiles = [];
window.transientEffects = [];

// Helper: Spawn floating 3D particle burst
window.spawnParticleBurst = function (pos, colorHex, count = 14, speed = 4, radius = 0.12) {
    if (!window.scene) return;
    const group = new THREE.Group();
    group.position.copy(pos);
    window.scene.add(group);

    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
    const geo = new THREE.SphereGeometry(radius, 8, 8);
    const parts = [];

    for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(geo, mat);
        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 1.6,
            (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(speed * (0.4 + Math.random() * 0.8));
        group.add(m);
        parts.push({ mesh: m, vel: dir });
    }

    window.transientEffects.push({
        type: 'burst',
        group,
        mat,
        parts,
        life: 0.55,
        maxLife: 0.55
    });
};

// Helper: Spawn Scoped Hitscan Beam Trail
window.spawnBeamTrail = function (startPos, endPos, colorHex) {
    if (!window.scene) return;
    const curve = new THREE.LineCurve3(startPos, endPos);
    const geo = new THREE.TubeGeometry(curve, 2, 0.028, 6, false);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    window.scene.add(mesh);

    window.transientEffects.push({
        type: 'beam',
        mesh,
        mat,
        life: 0.25,
        maxLife: 0.25
    });
};

// Helper: Eject spent Biotic Syringe Casing from rifle side port
window.ejectBioticCasing = function () {
    if (!window.scene) return;
    const casingGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.085, 8);
    casingGeo.rotateZ(Math.PI / 2);
    const casingMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.7,
        roughness: 0.25,
        transparent: true,
        opacity: 1.0
    });
    const casingMesh = new THREE.Mesh(casingGeo, casingMat);

    const ejectOrigin = new THREE.Vector3();
    const player = window.player;
    if (player.viewMode === 'fps' && !player.isScoped && window.fpsViewModel) {
        window.fpsViewModel.fpsBoltGroup.getWorldPosition(ejectOrigin);
    } else if (window.anaModel) {
        window.anaModel.boltCarrierGroup.getWorldPosition(ejectOrigin);
    }
    casingMesh.position.copy(ejectOrigin);
    window.scene.add(casingMesh);

    const rightDir = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    const vel = rightDir.multiplyScalar(-2.4 - Math.random() * 1.2);
    vel.y = 2.6 + Math.random() * 1.1;

    window.transientEffects.push({
        type: 'casing',
        mesh: casingMesh,
        mat: casingMat,
        vel,
        life: 1.1,
        maxLife: 1.1
    });
};

// Calculate Camera Aim Ray in World Space
const raycaster = new THREE.Raycaster();
window.getAimRay = function () {
    const player = window.player;
    if (player.viewMode === 'pose' && window.anaModel) {
        const muzzlePos = new THREE.Vector3();
        window.anaModel.muzzlePoint.getWorldPosition(muzzlePos);
        const forwardDir = new THREE.Vector3(
            -Math.sin(player.yaw) * Math.cos(player.pitch),
            Math.sin(player.pitch),
            -Math.cos(player.yaw) * Math.cos(player.pitch)
        ).normalize();
        return new THREE.Ray(muzzlePos, forwardDir);
    }
    raycaster.setFromCamera(new THREE.Vector2(0, 0), window.camera);
    return raycaster.ray;
};

// Smart-Aim Allied Healing Guide Detection (Biotic Smart-Aim Assist)
window.checkSmartAimTarget = function (aimRay) {
    let bestTarget = null;
    let bestScore = Infinity;

    (window.bots || []).filter(b => b.team === 'ally' && !b.isDead).forEach(ally => {
        const center = ally.group.position.clone().add(new THREE.Vector3(0, 1.2 * ally.baseScale, 0));
        const distToRay = aimRay.distanceToPoint(center);
        const hpRatio = ally.hp / ally.maxHp;

        if (hpRatio < 0.60 && distToRay < 2.8) {
            if (distToRay < bestScore) {
                bestScore = distToRay;
                bestTarget = ally;
            }
        }
    });

    const guideEl = document.getElementById('smart-aim-guide');
    if (guideEl) {
        if (bestTarget) {
            guideEl.style.opacity = '1';
            guideEl.classList.add('smart-aim-locked');
        } else {
            guideEl.style.opacity = '0';
            guideEl.classList.remove('smart-aim-locked');
        }
    }
    return bestTarget;
};

// Apply Biotic Rifle Hit Effect (Heal Ally or Damage Enemy + Infinite Growth Loop)
window.applyBioticRifleHit = function (bot, impactPoint) {
    if (bot.isDead) return;

    const player = window.player;
    const growthStats = window.growthStats;
    const combatStats = window.combatStats;
    const sfx = window.sfx;

    if (bot.team === 'ally') {
        if (bot.antiHealTimer > 0) {
            window.showCombatCallout('치유 차단 상태!', '아군이 치유 차단 상태입니다', 'border-purple-500 text-purple-300');
            return;
        }
        const mult = bot.healBoostTimer > 0 ? 1.5 : 1.0;
        const healAmount = Math.round(75 * mult);

        // Overhealth Barrier: 100% full hp ally converts 30% into player overhealth
        if (bot.hp >= bot.maxHp) {
            const shieldGain = Math.round(healAmount * 0.30);
            const maxShield = Math.round(player.maxHp * 0.40);
            const oldShield = player.overhealth;
            player.overhealth = Math.min(maxShield, player.overhealth + shieldGain);
            const actualGain = player.overhealth - oldShield;

            if (actualGain > 0) {
                if (sfx) sfx.playShieldGain();
                window.spawnParticleBurst(impactPoint, 0x38bdf8, 12, 3.2, 0.1);
                window.spawnFloatingText(impactPoint, `+${actualGain} 보호막 충전! 🛡️`, '#38bdf8', 'text-base');
                window.showCombatCallout('🛡️ 오버힐 생체 보호막 충전!', `아군 최대 체력 상태 치유로 아나 본인 보호막 +${actualGain} 충전`, 'border-sky-400 text-sky-300');
            }
        } else {
            const effectiveHeal = Math.min(bot.maxHp - bot.hp, healAmount);
            bot.hp = Math.min(bot.maxHp, bot.hp + healAmount);
            growthStats.cumulativeHeal += effectiveHeal;

            const leftover = healAmount - effectiveHeal;
            if (leftover > 0) {
                const sGain = Math.round(leftover * 0.30);
                const maxShield = Math.round(player.maxHp * 0.40);
                player.overhealth = Math.min(maxShield, player.overhealth + sGain);
                if (sfx) sfx.playShieldGain();
            }

            // Check Max HP Growth
            const newMax = growthStats.calculateMaxHp();
            if (newMax > player.maxHp) {
                const diff = newMax - player.maxHp;
                player.maxHp = newMax;
                player.hp += diff;
                if (sfx) sfx.playLevelUp();
                window.spawnFloatingText(player.pos.clone().add(new THREE.Vector3(0, 2.0, 0)), `❤️ MAX HP +${diff} 영구 성장! (${player.maxHp})`, '#4ade80', 'text-lg');
                window.checkVitalToPowerSynergy();
            }

            window.spawnParticleBurst(impactPoint, 0xfacc15, 14, 3.5, 0.11);
            window.spawnFloatingText(impactPoint, `+${effectiveHeal} 치유`, '#fde047', mult > 1 ? 'text-lg' : 'text-base');
        }

        combatStats.heal += healAmount;
        window.updateCombatStatsHud();
        player.ultCharge = Math.min(100, player.ultCharge + 8);
        if (sfx) sfx.playBioticTicks(true);
        window.flashHitMarker(true);
    } else {
        // Enemy Hit
        if (bot.sleepTimer > 0) {
            bot.sleepTimer = 0;
            window.showCombatCallout('수면 해제!', `${bot.name}이(가) 공격받아 깨어났습니다!`, 'border-amber-400 text-amber-300');
        }

        const dmgAmount = growthStats.calculateAtk(false);
        bot.hp = Math.max(0, bot.hp - dmgAmount);
        combatStats.dmg += dmgAmount;
        window.updateCombatStatsHud();
        player.ultCharge = Math.min(100, player.ultCharge + 9);
        if (sfx) sfx.playBioticTicks(false);
        window.flashHitMarker(false);
        window.spawnParticleBurst(impactPoint, 0xa855f7, 14, 3.5, 0.11);
        window.spawnFloatingText(impactPoint, `-${dmgAmount}`, '#c084fc', 'text-base');

        // [핵심 요구사항] 피가 0이 되면 즉시 적이 사라지고 3초 후 리스폰
        if (bot.hp <= 0) {
            combatStats.elim++;
            growthStats.normalKills++;
            const updatedAtk = growthStats.calculateAtk(false);
            if (sfx) sfx.playLevelUp();
            window.spawnFloatingText(impactPoint, `⚔️ 처치! ATK +3.5 영구 상승! (${updatedAtk})`, '#c084fc', 'text-lg');
            window.showCombatCallout(`🎯 처치 완료! (${bot.name})`, `공격력 영구 상승! 현재 ATK: ${updatedAtk}`, 'border-purple-500 text-purple-300');
            window.updateCombatStatsHud();

            // 적 사망 처리 (폭발 이펙트 + 모델 즉각 숨김 + 3초 후 리스폰)
            window.killBot(bot);
        }
    }
    window.updatePlayerHud();
};

// 1. PRIMARY FIRE: Biotic Rifle
window.fireBioticRifle = function () {
    const player = window.player;
    if (player.isReloading || player.fireCooldown > 0) return;
    if (player.ammo <= 0) {
        window.triggerReload();
        return;
    }

    player.ammo--;
    player.fireCooldown = 0.72;
    player.recoilOffset = 0.22;
    player.shootAnimTimer = 0.68;
    if (window.sfx) window.sfx.playRifleShot(player.isScoped);

    setTimeout(() => window.ejectBioticCasing(), 210);

    const muzzleWorld = new THREE.Vector3();
    if (player.viewMode === 'fps' && !player.isScoped && window.fpsViewModel) {
        window.fpsViewModel.fpsMuzzleFlash.getWorldPosition(muzzleWorld);
    } else if (window.anaModel) {
        window.anaModel.muzzlePoint.getWorldPosition(muzzleWorld);
    }

    const aimRay = window.getAimRay();
    const smartAllyTarget = window.checkSmartAimTarget(aimRay);

    let targetPoint = aimRay.origin.clone().add(aimRay.direction.clone().multiplyScalar(80));
    if (smartAllyTarget) {
        const allyCenter = smartAllyTarget.group.position.clone().add(new THREE.Vector3(0, 1.2 * smartAllyTarget.baseScale, 0));
        targetPoint.lerp(allyCenter, 0.75);
    }

    // Check direct ray intersection against active (alive) bots
    let hitBot = null;
    let bestDist = Infinity;
    let hitPos = targetPoint.clone();

    (window.bots || []).forEach(bot => {
        if (bot.isDead) return;
        const botCenter = bot.group.position.clone().add(new THREE.Vector3(0, 1.15 * bot.baseScale, 0));
        const hitRadius = bot.team === 'ally' ? 1.25 : 0.85;
        const distToRay = aimRay.distanceSqToPoint(botCenter);
        if (distToRay <= hitRadius * hitRadius || (smartAllyTarget && smartAllyTarget.id === bot.id)) {
            const d = aimRay.origin.distanceTo(botCenter);
            if (d < bestDist) {
                bestDist = d;
                hitBot = bot;
                hitPos = botCenter;
            }
        }
    });

    if (player.isScoped) {
        // HITSCAN MODE: Instant trace & impact
        const beamColor = hitBot ? (hitBot.team === 'ally' ? 0xfacc15 : 0xa855f7) : 0x38bdf8;
        const startTrace = muzzleWorld.clone();
        window.spawnBeamTrail(startTrace, hitPos, beamColor);
        if (hitBot) {
            window.applyBioticRifleHit(hitBot, hitPos);
        } else {
            window.spawnParticleBurst(hitPos, 0x38bdf8, 8, 2.5, 0.08);
        }
    } else {
        // UNSCOPED MODE: Fast glowing Biotic Syringe Dart projectile
        const dartGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8);
        dartGeo.rotateX(Math.PI / 2);
        const dartMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const dartMesh = new THREE.Mesh(dartGeo, dartMat);
        dartMesh.position.copy(muzzleWorld);
        const dir = targetPoint.clone().sub(muzzleWorld).normalize();
        dartMesh.lookAt(muzzleWorld.clone().add(dir));
        window.scene.add(dartMesh);

        window.projectiles.push({
            type: 'biotic-dart',
            mesh: dartMesh,
            vel: dir.multiplyScalar(68),
            life: 2.0
        });
    }

    if (player.ammo === 0) {
        setTimeout(() => window.triggerReload(), 260);
    }
    window.updatePlayerHud();
};

// 2. RELOAD & ACTIVE RELOAD SYSTEM
window.triggerReload = function () {
    const player = window.player;
    if (player.isReloading || player.ammo === player.maxAmmo) return;
    player.isReloading = true;
    player.reloadTimer = player.baseReloadTime;
    player.activeReloadWindow = true;

    const reloadWrap = document.getElementById('active-reload-wrap');
    if (reloadWrap) reloadWrap.classList.remove('hidden');

    if (player.isScoped) window.toggleScope(false);
    if (window.sfx) window.sfx.playReload();
    window.showCombatCallout('🔄 재장전 중...', '타이밍 탭: 액티브 리로드 (골든 존)', 'border-cyan-400 text-cyan-200');
    window.updatePlayerHud();
};

window.attemptActiveReload = function () {
    const player = window.player;
    if (!player.isReloading || !player.activeReloadWindow) {
        window.triggerReload();
        return;
    }

    const progress = 1.0 - (player.reloadTimer / player.baseReloadTime);
    if (progress >= 0.40 && progress <= 0.65) {
        player.isReloading = false;
        player.reloadTimer = 0;
        player.activeReloadWindow = false;
        player.ammo = player.maxAmmo;

        const reloadWrap = document.getElementById('active-reload-wrap');
        if (reloadWrap) reloadWrap.classList.add('hidden');

        if (window.sfx) window.sfx.playActiveReload();
        window.showCombatCallout('⚡ PERFECT ACTIVE RELOAD!', '완벽한 타이밍! 즉시 재장전 완료!', 'border-amber-400 text-amber-300');
        window.spawnFloatingText(player.pos.clone().add(new THREE.Vector3(0, 1.8, 0)), '⚡ PERFECT RELOAD!', '#fde047', 'text-xl');
        window.updatePlayerHud();
    } else {
        player.activeReloadWindow = false;
        window.spawnFloatingText(player.pos.clone().add(new THREE.Vector3(0, 1.8, 0)), '⚠️ 타이밍 실패', '#ef4444', 'text-sm');
    }
};

// 3. SCOPE TOGGLE (Right Click / Z)
window.toggleScope = function (forceState = null) {
    const player = window.player;
    if (player.isReloading && forceState !== false) return;
    if (player.viewMode === 'pose' && forceState !== false) {
        window.setViewMode('tps');
    }
    player.isScoped = forceState !== null ? forceState : !player.isScoped;
    const scopeEl = document.getElementById('scope-overlay');
    const normalCh = document.getElementById('normal-crosshair');
    const camera = window.camera;
    const anaModel = window.anaModel;
    const fpsViewModel = window.fpsViewModel;

    if (player.isScoped) {
        if (scopeEl) scopeEl.style.opacity = '1';
        if (normalCh) normalCh.style.opacity = '0';
        if (camera) camera.fov = 26;
        if (anaModel) anaModel.root.visible = false;
        if (fpsViewModel) fpsViewModel.root.visible = false;
    } else {
        if (scopeEl) scopeEl.style.opacity = '0';
        if (normalCh) normalCh.style.opacity = '1';
        if (camera) camera.fov = 65;
        if (anaModel) anaModel.root.visible = (player.viewMode !== 'fps');
        if (fpsViewModel) fpsViewModel.root.visible = (player.viewMode === 'fps');
    }
    if (camera) camera.updateProjectionMatrix();
};

// 4. SLEEP DART (L-Shift)
window.fireSleepDart = function () {
    const player = window.player;
    if (player.cdShift > 0) return;

    player.cdShift = 8.0;
    player.sleepAnimTimer = 0.78;
    if (player.isScoped) window.toggleScope(false);
    if (window.sfx) window.sfx.playSleepDart();
    window.showCombatCallout('💤 수면총 발사!', '"코 자렴." (왼손 수면총 발사 모션)', 'border-cyan-400 text-cyan-300');

    setTimeout(() => {
        const startPos = new THREE.Vector3();
        if (player.viewMode === 'fps' && window.fpsViewModel) {
            window.fpsViewModel.sleepPistolProp.getWorldPosition(startPos);
        } else if (window.anaModel) {
            window.anaModel.sleepGauntlet.getWorldPosition(startPos);
        }

        window.spawnParticleBurst(startPos, 0x22d3ee, 10, 2.8, 0.07);

        const aimRay = window.getAimRay();
        const targetPoint = aimRay.origin.clone().add(aimRay.direction.clone().multiplyScalar(65));
        const dir = targetPoint.sub(startPos).normalize();

        const dartGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.75, 10);
        dartGeo.rotateX(Math.PI / 2);
        const dartMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const dartMesh = new THREE.Mesh(dartGeo, dartMat);
        dartMesh.position.copy(startPos);
        dartMesh.lookAt(startPos.clone().add(dir));
        window.scene.add(dartMesh);

        window.projectiles.push({
            type: 'sleep-dart',
            mesh: dartMesh,
            vel: dir.multiplyScalar(50),
            life: 2.2
        });
    }, 110);

    window.updatePlayerHud();
};

// 5. BIOTIC GRENADE (E)
window.throwBioticGrenade = function () {
    const player = window.player;
    if (player.cdE > 0) return;

    player.cdE = 6.0;
    player.nadeAnimTimer = 0.65;
    if (player.isScoped) window.toggleScope(false);
    window.showCombatCallout('🧪 생체 수류탄 투척!', '아군 치유 강화 (+50%) / 적 치유 차단', 'border-amber-400 text-amber-300');

    setTimeout(() => {
        const startPos = new THREE.Vector3();
        if (player.viewMode === 'fps' && window.fpsViewModel) {
            window.fpsViewModel.nadeHandProp.getWorldPosition(startPos);
        } else if (window.anaModel) {
            window.anaModel.lHand.getWorldPosition(startPos);
        }

        const aimRay = window.getAimRay();
        const throwVel = aimRay.direction.clone().multiplyScalar(25);
        throwVel.y += 4.8;

        const nadeGroup = new THREE.Group();
        const jar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.34, 12),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.15, 0.03, 8, 12),
            new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
        );
        nadeGroup.add(jar);
        nadeGroup.add(ring);
        nadeGroup.position.copy(startPos);
        window.scene.add(nadeGroup);

        window.projectiles.push({
            type: 'biotic-grenade',
            mesh: nadeGroup,
            vel: throwVel,
            life: 4.0
        });
    }, 140);

    window.updatePlayerHud();
};

window.detonateBioticGrenade = function (pos) {
    if (window.sfx) window.sfx.playGrenadeSplash();
    const splashRadius = 5.5;

    const ringGeo = new THREE.RingGeometry(0.2, splashRadius, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(pos.x, 0.08, pos.z);
    window.scene.add(ringMesh);

    window.transientEffects.push({
        type: 'beam',
        mesh: ringMesh,
        mat: ringMat,
        life: 0.55,
        maxLife: 0.55
    });

    window.spawnParticleBurst(pos, 0xfacc15, 22, 6, 0.16);
    window.spawnParticleBurst(pos, 0xa855f7, 18, 5, 0.15);

    let alliesHealedInSplash = 0;
    const player = window.player;
    const growthStats = window.growthStats;
    const combatStats = window.combatStats;

    // Check self-splash for Ana
    if (player.pos.distanceTo(pos) <= splashRadius) {
        const effHeal = Math.min(player.maxHp - player.hp, 90);
        player.hp = Math.min(player.maxHp, player.hp + 90);
        growthStats.cumulativeHeal += effHeal;
        player.healBoostTimer = 4.5;
        alliesHealedInSplash++;
    }

    // Affect Bots in Splash Radius
    const nadeDmg = Math.round(60 * (growthStats.calculateAtk(false) / 75));
    (window.bots || []).forEach(bot => {
        if (bot.isDead) return;
        if (bot.group.position.distanceTo(pos) <= splashRadius) {
            const botTop = bot.group.position.clone().add(new THREE.Vector3(0, 1.8, 0));
            if (bot.team === 'ally') {
                bot.antiHealTimer = 0;
                bot.healBoostTimer = 4.5;
                const eff = Math.min(bot.maxHp - bot.hp, 90);
                bot.hp = Math.min(bot.maxHp, bot.hp + 90);
                growthStats.cumulativeHeal += eff;
                combatStats.heal += 90;
                alliesHealedInSplash++;
                player.ultCharge = Math.min(100, player.ultCharge + 10);
                window.flashHitMarker(true);
                window.spawnFloatingText(botTop, '+90 ➕치유강화!', '#fde047', 'text-lg');
            } else {
                if (bot.sleepTimer > 0) bot.sleepTimer = 0;
                bot.antiHealTimer = 4.5;
                bot.hp = Math.max(0, bot.hp - nadeDmg);
                combatStats.dmg += nadeDmg;
                player.ultCharge = Math.min(100, player.ultCharge + 10);
                window.flashHitMarker(false);
                window.spawnFloatingText(botTop, `-${nadeDmg} 🚫치유차단!`, '#c084fc', 'text-lg');

                if (bot.hp <= 0) {
                    combatStats.elim++;
                    growthStats.normalKills++;
                    window.updateCombatStatsHud();
                    window.showCombatCallout(`🎯 처치! (${bot.name})`, '생체 수류탄 폭발 처치 완료', 'border-red-500 text-red-300');
                    window.killBot(bot);
                }
            }
        }
    });

    if (alliesHealedInSplash >= 2) {
        growthStats.grenadeMultiHealCount++;
        window.showCombatCallout('🧪 다중 치유 달성!', `아군 ${alliesHealedInSplash}명 동시 치유! 영구 생명력 +25 보너스 획득!`, 'border-amber-400 text-amber-300');
        window.spawnFloatingText(pos, '✨ 다중 치유 보너스! (MAX HP +25)', '#fde047', 'text-xl');
    }

    const newMax = growthStats.calculateMaxHp();
    if (newMax > player.maxHp) {
        const diff = newMax - player.maxHp;
        player.maxHp = newMax;
        player.hp += diff;
        if (window.sfx) window.sfx.playLevelUp();
        window.spawnFloatingText(player.pos.clone().add(new THREE.Vector3(0, 2.0, 0)), `❤️ MAX HP +${diff} 영구 성장! (${player.maxHp})`, '#4ade80', 'text-lg');
        window.checkVitalToPowerSynergy();
    }

    window.updateCombatStatsHud();
    window.updatePlayerHud();
};

// 6. NANO BOOST ULTIMATE (Q)
window.activateNanoBoost = function () {
    const player = window.player;
    if (player.ultCharge < 100) {
        window.showCombatCallout('궁극기 충전 중!', `현재 궁극기 충전량: ${Math.floor(player.ultCharge)}%`, 'border-slate-400 text-slate-200');
        return;
    }

    const aimRay = window.getAimRay();
    let targetAlly = null;
    let bestScore = Infinity;

    (window.bots || []).filter(b => b.team === 'ally' && !b.isDead).forEach(ally => {
        const center = ally.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        const d = aimRay.distanceToPoint(center);
        if (d < bestScore) {
            bestScore = d;
            targetAlly = ally;
        }
    });

    if (!targetAlly) return;

    player.ultCharge = 0;
    player.nanoAnimTimer = 0.72;
    if (window.sfx) window.sfx.playNanoBoost();

    const startPos = player.pos.clone().add(new THREE.Vector3(0, 1.5, 0));
    const endPos = targetAlly.group.position.clone().add(new THREE.Vector3(0, 1.3, 0));
    window.spawnBeamTrail(startPos, endPos, 0x3b82f6);
    window.spawnParticleBurst(endPos, 0x60a5fa, 30, 7, 0.18);
    window.spawnFloatingText(endPos, '⚡ 나노 강화제 투여! (+250)', '#60a5fa', 'text-xl');

    targetAlly.nanoTimer = 8.0;
    targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + 250);
    window.combatStats.heal += 250;
    window.updateCombatStatsHud();

    const screenFx = document.getElementById('screen-fx');
    if (screenFx) {
        screenFx.classList.add('nano-glow');
        setTimeout(() => screenFx.classList.remove('nano-glow'), 3500);
    }

    window.showCombatCallout(
        '⚡ "나노 강화제를 투여했다!"',
        `${targetAlly.name} : "힘이 넘쳐흐른다!!" (공격력 +50% / 피해감소 50%)`,
        'border-blue-400 text-blue-300'
    );
    window.updatePlayerHud();
};

// Update active projectiles & transient VFX
window.updateCombatEntities = function (dt) {
    const scene = window.scene;
    const projectiles = window.projectiles;
    const transientEffects = window.transientEffects;
    const bots = window.bots || [];

    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.life -= dt;
        if (p.type === 'biotic-grenade') {
            p.vel.y -= 16.5 * dt;
            p.mesh.rotation.x += dt * 8;
        }
        p.mesh.position.addScaledVector(p.vel, dt);

        let removed = false;

        // Ground impact for Biotic Grenade
        if (p.type === 'biotic-grenade' && p.mesh.position.y <= 0.18) {
            window.detonateBioticGrenade(p.mesh.position.clone());
            removed = true;
        }

        // Bot collisions
        if (!removed) {
            for (const bot of bots) {
                if (bot.isDead) continue;
                const botCenter = bot.group.position.clone().add(new THREE.Vector3(0, 1.15 * bot.baseScale, 0));
                const hitRadius = p.type === 'biotic-grenade' ? 0.9 : (bot.team === 'ally' ? 1.05 : 0.85);
                if (p.mesh.position.distanceTo(botCenter) <= hitRadius) {
                    if (p.type === 'biotic-dart') {
                        window.applyBioticRifleHit(bot, p.mesh.position.clone());
                        removed = true;
                        break;
                    } else if (p.type === 'sleep-dart' && bot.team === 'enemy') {
                        bot.sleepTimer = 5.0;
                        bot.hp = Math.max(5, bot.hp - 5);
                        window.combatStats.sleep++;
                        window.combatStats.dmg += 5;
                        window.updateCombatStatsHud();
                        window.flashHitMarker(false);
                        window.spawnParticleBurst(botCenter, 0x22d3ee, 20, 4.5, 0.14);
                        window.spawnFloatingText(botCenter, '💤 수면 적중! (5.0s)', '#22d3ee', 'text-lg');
                        window.showCombatCallout(`💤 적 수면 적중! (${bot.name})`, '5초 동안 행동 불가 (공격 시 깨어남)', 'border-cyan-400 text-cyan-300');
                        removed = true;
                        break;
                    } else if (p.type === 'biotic-grenade') {
                        window.detonateBioticGrenade(p.mesh.position.clone());
                        removed = true;
                        break;
                    }
                }
            }
        }

        if (removed || p.life <= 0) {
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
        }
    }

    // Transient Visual Effects
    for (let i = transientEffects.length - 1; i >= 0; i--) {
        const fx = transientEffects[i];
        fx.life -= dt;
        const alpha = Math.max(0, fx.life / fx.maxLife);
        fx.mat.opacity = alpha;

        if (fx.type === 'burst') {
            fx.parts.forEach(pt => {
                pt.mesh.position.addScaledVector(pt.vel, dt);
            });
        } else if (fx.type === 'casing') {
            fx.vel.y -= 14.0 * dt;
            fx.mesh.position.addScaledVector(fx.vel, dt);
            fx.mesh.rotation.x += dt * 12;
            fx.mesh.rotation.z += dt * 9;
            if (fx.mesh.position.y < 0.04) {
                fx.mesh.position.y = 0.04;
                fx.vel.y = Math.abs(fx.vel.y) * 0.35;
                fx.vel.x *= 0.6;
                fx.vel.z *= 0.6;
            }
        }

        if (fx.life <= 0) {
            scene.remove(fx.group || fx.mesh);
            transientEffects.splice(i, 1);
        }
    }
};
