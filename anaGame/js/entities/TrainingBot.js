/* ============================================================================
 * [Project: BIOTIC VANGUARD] TrainingBot.js
 * Allied & Enemy Training Bot Entities, Disappear on Death & Respawn Mechanism
 * ============================================================================ */
window.bots = [];

// Create a single bot entity (allied or enemy)
window.createBot = function (config) {
    const scene = window.scene;
    const group = new THREE.Group();
    group.position.copy(config.startPos);
    scene.add(group);

    const isAlly = config.team === 'ally';
    const primaryColor = isAlly ? 0x2563eb : 0xdc2626;
    const glowColor = isAlly ? 0x38bdf8 : 0xf87171;

    const bodyMat = new THREE.MeshStandardMaterial({
        color: isAlly ? 0x1e293b : 0x27272a,
        roughness: 0.4,
        metalness: 0.6
    });
    const armorMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.35,
        metalness: 0.4
    });
    const visorMat = new THREE.MeshBasicMaterial({ color: glowColor });

    // Pivot group for sleeping rotation (tips horizontal when slept!)
    const bodyPivot = new THREE.Group();
    group.add(bodyPivot);

    const scale = config.scale || 1.0;
    bodyPivot.scale.setScalar(scale);

    // Hover / Leg Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.7, 12), bodyMat);
    base.position.y = 0.35;
    bodyPivot.add(base);

    // Torso Chassis
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.95, 0.52), armorMat);
    chest.position.y = 1.2;
    bodyPivot.add(chest);

    // Head & Glowing Visor Eye
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), bodyMat);
    head.position.y = 1.95;
    bodyPivot.add(head);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.22), visorMat);
    visor.position.set(0, 1.95, 0.22);
    bodyPivot.add(visor);

    // Arms / Weapon
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.22), bodyMat);
    rightArm.position.set(-0.56, 1.2, 0.15);
    rightArm.rotation.x = -0.6;
    bodyPivot.add(rightArm);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.22), bodyMat);
    leftArm.position.set(0.56, 1.2, 0.15);
    bodyPivot.add(leftArm);

    // Nano Boost Electric Aura Shell (Hidden until Nano Boosted!)
    const nanoAuraMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.0
    });
    const nanoAura = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.3, 10), nanoAuraMat);
    nanoAura.position.y = 1.15;
    bodyPivot.add(nanoAura);

    bodyPivot.traverse(o => {
        if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
        }
    });

    // Create DOM Floating HP Bar & Status Label
    const worldUiLayer = document.getElementById('world-ui-layer');
    const labelEl = document.createElement('div');
    labelEl.className = 'world-label flex flex-col items-center';
    labelEl.innerHTML = `
        <div class="status-badges flex items-center gap-1 mb-0.5 text-xs font-black"></div>
        <div class="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-950/80 ${isAlly ? 'text-cyan-300' : 'text-red-400'} border ${isAlly ? 'border-cyan-500/40' : 'border-red-500/40'} whitespace-nowrap">
            ${config.name}
        </div>
        <div class="hp-frame w-28 h-3.5 bg-slate-950/90 rounded p-0.5 mt-0.5 border border-white/30 overflow-hidden shadow-md">
            <div class="hp-fill h-full ${isAlly ? 'bg-cyan-400' : 'bg-red-500'} transition-all duration-100" style="width: 100%"></div>
        </div>
    `;
    if (worldUiLayer) worldUiLayer.appendChild(labelEl);

    const botObj = {
        id: config.id,
        name: config.name,
        team: config.team,
        maxHp: config.maxHp,
        hp: config.initialHp !== undefined ? config.initialHp : config.maxHp,
        isDead: false,
        isAerial: Boolean(config.isAerial),
        flyHeight: config.flyHeight || 0,
        currentFlyY: config.flyHeight || 0,
        group,
        bodyPivot,
        armorMat,
        nanoAura,
        nanoAuraMat,
        baseScale: scale,
        startPos: config.startPos.clone(),
        patrolRange: config.patrolRange || 0,
        patrolSpeed: config.patrolSpeed || 1.2,
        patrolPhase: Math.random() * Math.PI * 2,
        sleepTimer: 0,
        antiHealTimer: 0,
        healBoostTimer: 0,
        nanoTimer: 0,
        fireCooldown: 1.5 + Math.random() * 1.5,
        labelEl,
        hpFrameEl: labelEl.querySelector('.hp-frame'),
        hpFillEl: labelEl.querySelector('.hp-fill'),
        badgesEl: labelEl.querySelector('.status-badges')
    };

    window.bots.push(botObj);
    return botObj;
};

// [Core Requirement] 봇 피가 0이 되면 완전히 사라짐(폭발 디스폰) 후 리스폰 메커니즘
window.killBot = function (bot) {
    if (bot.isDead) return;
    bot.isDead = true;
    bot.hp = 0;

    const center = bot.group.position.clone().add(new THREE.Vector3(0, 1.2 * bot.baseScale, 0));

    // 1. 화려한 폭발 파티클 및 파편 이펙트 생성
    if (window.spawnParticleBurst) {
        window.spawnParticleBurst(center, 0xef4444, 28, 6.0, 0.18);
        window.spawnParticleBurst(center, 0xfbbf24, 22, 5.0, 0.14);
        window.spawnParticleBurst(center, 0x64748b, 16, 4.0, 0.16);
    }
    if (window.sfx && window.sfx.playBotExplosion) {
        window.sfx.playBotExplosion();
    }

    // 2. 3D 모델 및 머리 위 HP바 완전히 즉각 사라짐!
    bot.group.visible = false;
    if (bot.labelEl) {
        bot.labelEl.style.display = 'none';
        bot.labelEl.style.opacity = '0';
    }

    // 3. 3초 후 재생성(리스폰) 예약
    setTimeout(() => {
        window.respawnBot(bot);
    }, 3000);
};

// [Core Requirement] 사라졌던 봇이 원래 위치에서 풀피로 다시 나타남 (리스폰 연출)
window.respawnBot = function (bot) {
    bot.group.position.copy(bot.startPos);
    bot.hp = bot.maxHp;
    bot.sleepTimer = 0;
    bot.antiHealTimer = 0;
    bot.healBoostTimer = 0;
    bot.nanoTimer = 0;
    bot.isDead = false;

    // 3D 모델 및 머리 위 HP 바 다시 활성화!
    bot.group.visible = true;
    if (bot.labelEl) {
        bot.labelEl.style.display = '';
        bot.labelEl.style.opacity = '1';
    }

    // 소환 빛무리 및 스폰 파티클 연출
    const spawnCenter = bot.group.position.clone().add(new THREE.Vector3(0, 1.2 * bot.baseScale, 0));
    if (window.spawnParticleBurst) {
        window.spawnParticleBurst(spawnCenter, 0x38bdf8, 22, 4.2, 0.15);
    }
    if (window.showCombatCallout) {
        window.showCombatCallout(
            `🤖 훈련봇 재생성 완료`,
            `${bot.name}이(가) 전장에 재배치되었습니다.`,
            'border-slate-500 text-slate-300'
        );
    }
};

// Default Bots Initialization (2 Allies, 4 Enemies)
window.initDefaultBots = function () {
    window.bots.length = 0;

    // Allied Bots
    window.createBot({
        id: 'ally-1',
        name: '아군 돌격 봇 [라인하르트형]',
        team: 'ally',
        maxHp: 500,
        initialHp: 260,
        scale: 1.25,
        startPos: new THREE.Vector3(-5.5, 0, -4.5),
        patrolRange: 3.5,
        patrolSpeed: 0.9
    });

    window.createBot({
        id: 'ally-2',
        name: '아군 공격 봇 [솔저: 76형]',
        team: 'ally',
        maxHp: 250,
        initialHp: 135,
        scale: 1.0,
        startPos: new THREE.Vector3(5.5, 0, -5.5),
        patrolRange: 4.5,
        patrolSpeed: 1.4
    });

    // Enemy Bots
    window.createBot({
        id: 'enemy-1',
        name: '적 강습 봇 ALPHA',
        team: 'enemy',
        maxHp: 250,
        initialHp: 250,
        scale: 1.0,
        startPos: new THREE.Vector3(-9, 0, -15),
        patrolRange: 5,
        patrolSpeed: 1.6
    });

    window.createBot({
        id: 'enemy-2',
        name: '적 중장갑 봇 OMEGA',
        team: 'enemy',
        maxHp: 450,
        initialHp: 450,
        scale: 1.22,
        startPos: new THREE.Vector3(0, 0, -18),
        patrolRange: 6,
        patrolSpeed: 1.1
    });

    window.createBot({
        id: 'enemy-3',
        name: '적 저격 봇 SIGMA',
        team: 'enemy',
        maxHp: 250,
        initialHp: 250,
        scale: 1.0,
        startPos: new THREE.Vector3(10, 0, -17),
        patrolRange: 6,
        patrolSpeed: 1.9
    });

    window.createBot({
        id: 'enemy-aerial',
        name: '적 공중 기동 봇 [파라형]',
        team: 'enemy',
        maxHp: 225,
        initialHp: 225,
        scale: 0.95,
        isAerial: true,
        flyHeight: 4.8,
        startPos: new THREE.Vector3(2, 4.8, -14),
        patrolRange: 7.5,
        patrolSpeed: 1.45
    });
};

// Frame update for bots (Patrol movement, status decay, skirmish fire, world UI mapping)
window.updateBots = function (dt, elapsed) {
    const player = window.player;
    const camera = window.camera;

    window.bots.forEach(bot => {
        // 죽은 상태의 봇은 화면에 표시되지 않으며 업데이트를 생략
        if (bot.isDead) {
            bot.group.visible = false;
            if (bot.labelEl) bot.labelEl.style.display = 'none';
            return;
        }

        // Status timers
        if (bot.sleepTimer > 0) bot.sleepTimer = Math.max(0, bot.sleepTimer - dt);
        if (bot.antiHealTimer > 0) bot.antiHealTimer = Math.max(0, bot.antiHealTimer - dt);
        if (bot.healBoostTimer > 0) bot.healBoostTimer = Math.max(0, bot.healBoostTimer - dt);
        if (bot.nanoTimer > 0) bot.nanoTimer = Math.max(0, bot.nanoTimer - dt);

        // Sleeping Behavior: Bot tips over onto snow (aerial drops down)
        if (bot.sleepTimer > 0) {
            bot.bodyPivot.rotation.z = THREE.MathUtils.lerp(bot.bodyPivot.rotation.z, Math.PI / 2.1, dt * 10);
            bot.bodyPivot.position.y = THREE.MathUtils.lerp(bot.bodyPivot.position.y, 0.25, dt * 10);
            if (bot.isAerial) {
                bot.group.position.y = THREE.MathUtils.lerp(bot.group.position.y, 0, dt * 8);
            }
        } else {
            bot.bodyPivot.rotation.z = THREE.MathUtils.lerp(bot.bodyPivot.rotation.z, 0, dt * 10);
            bot.bodyPivot.position.y = THREE.MathUtils.lerp(bot.bodyPivot.position.y, 0, dt * 10);

            // Patrol Movement
            const speedMult = bot.nanoTimer > 0 ? 1.65 : 1.0;
            bot.patrolPhase += dt * bot.patrolSpeed * speedMult;
            bot.group.position.x = bot.startPos.x + Math.sin(bot.patrolPhase) * bot.patrolRange;
            if (bot.isAerial) {
                const targetFlyY = bot.flyHeight + Math.sin(bot.patrolPhase * 1.7) * 1.35;
                bot.group.position.y = THREE.MathUtils.lerp(bot.group.position.y, targetFlyY, dt * 4);
            }

            // Simulated Skirmish Fire (Enemies chip Allies so you always have someone to heal; Nano'd Ally blasts enemies!)
            bot.fireCooldown -= dt * speedMult;
            if (bot.fireCooldown <= 0) {
                bot.fireCooldown = bot.nanoTimer > 0 ? 0.65 : (1.8 + Math.random() * 1.2);
                if (bot.team === 'enemy') {
                    const allies = window.bots.filter(b => b.team === 'ally' && !b.isDead);
                    const target = allies[Math.floor(Math.random() * allies.length)];
                    if (target) {
                        const dmg = target.nanoTimer > 0 ? 11 : 22;
                        target.hp = Math.max(35, target.hp - dmg);
                        if (window.spawnBeamTrail) {
                            window.spawnBeamTrail(
                                bot.group.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
                                target.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
                                0xef4444
                            );
                        }
                    }
                } else if (bot.nanoTimer > 0) {
                    const enemies = window.bots.filter(b => b.team === 'enemy' && !b.isDead && b.sleepTimer <= 0);
                    if (enemies.length > 0) {
                        const target = enemies[Math.floor(Math.random() * enemies.length)];
                        target.hp = Math.max(0, target.hp - 55);
                        if (window.spawnBeamTrail) {
                            window.spawnBeamTrail(
                                bot.group.position.clone().add(new THREE.Vector3(0, 1.6, 0)),
                                target.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
                                0x3b82f6
                            );
                        }
                        if (window.spawnParticleBurst) {
                            window.spawnParticleBurst(target.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x60a5fa, 10, 4, 0.12);
                        }
                        if (target.hp <= 0) {
                            window.killBot(target);
                        }
                    }
                }
            }
        }

        // Nano Boost Visual Scale & Electric Aura
        if (bot.nanoTimer > 0) {
            bot.nanoAuraMat.opacity = 0.45 + Math.sin(elapsed * 16) * 0.2;
            bot.nanoAura.rotation.y += dt * 4;
            bot.bodyPivot.scale.setScalar(bot.baseScale * 1.15);
        } else {
            bot.nanoAuraMat.opacity = 0;
            bot.bodyPivot.scale.setScalar(bot.baseScale);
        }

        // 2D World-to-Screen UI Label Position
        const headWorldPos = bot.group.position.clone().add(new THREE.Vector3(0, 2.55 * bot.baseScale, 0));
        headWorldPos.project(camera);

        if (headWorldPos.z < 1.0 && player.viewMode !== 'pose') {
            const sx = (headWorldPos.x * 0.5 + 0.5) * window.innerWidth;
            const sy = (-headWorldPos.y * 0.5 + 0.5) * window.innerHeight;
            bot.labelEl.style.display = '';
            bot.labelEl.style.left = `${sx}px`;
            bot.labelEl.style.top = `${sy}px`;
            bot.labelEl.style.opacity = '1';

            const pct = Math.max(0, Math.min(100, (bot.hp / bot.maxHp) * 100));
            bot.hpFillEl.style.width = `${pct}%`;

            if (bot.antiHealTimer > 0) {
                bot.hpFrameEl.className = 'hp-frame w-28 h-3.5 bg-slate-950/90 rounded p-0.5 mt-0.5 border-2 border-purple-400 shadow-[0_0_10px_#a855f7] overflow-hidden';
                bot.hpFillEl.className = 'hp-fill h-full bg-purple-600 transition-all duration-100';
            } else if (bot.healBoostTimer > 0) {
                bot.hpFrameEl.className = 'hp-frame w-28 h-3.5 bg-slate-950/90 rounded p-0.5 mt-0.5 border-2 border-amber-300 shadow-[0_0_10px_#fbbf24] overflow-hidden';
                bot.hpFillEl.className = 'hp-fill h-full bg-amber-300 transition-all duration-100';
            } else {
                bot.hpFrameEl.className = 'hp-frame w-28 h-3.5 bg-slate-950/90 rounded p-0.5 mt-0.5 border border-white/30 overflow-hidden';
                bot.hpFillEl.className = `hp-fill h-full ${bot.team === 'ally' ? 'bg-cyan-400' : 'bg-red-500'} transition-all duration-100`;
            }

            let badgesHtml = '';
            if (bot.sleepTimer > 0) badgesHtml += `<span class="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 animate-bounce">💤 수면 (${bot.sleepTimer.toFixed(1)}s)</span>`;
            if (bot.antiHealTimer > 0) badgesHtml += `<span class="px-1.5 py-0.5 rounded bg-purple-600 text-white">🚫 치유차단</span>`;
            if (bot.healBoostTimer > 0) badgesHtml += `<span class="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">➕ 치유강화</span>`;
            if (bot.nanoTimer > 0) badgesHtml += `<span class="px-1.5 py-0.5 rounded bg-blue-500 text-white shadow-[0_0_10px_#3b82f6]">⚡ 나노강화 (${bot.nanoTimer.toFixed(1)}s)</span>`;
            bot.badgesEl.innerHTML = badgesHtml;
        } else {
            bot.labelEl.style.opacity = '0';
        }
    });
};
