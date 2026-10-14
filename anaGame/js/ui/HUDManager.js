/* ============================================================================
 * [Project: BIOTIC VANGUARD] HUDManager.js
 * Heads-Up Display, Floating Combat Text, Callouts, Hitmarkers & View Transitions
 * ============================================================================ */

window.updateCombatStatsHud = function () {
    const combatStats = window.combatStats || { heal: 0, dmg: 0, sleep: 0, elim: 0 };
    const elHeal = document.getElementById('stat-heal');
    const elDmg = document.getElementById('stat-dmg');
    const elSleep = document.getElementById('stat-sleep');
    const elElim = document.getElementById('stat-elim');

    if (elHeal) elHeal.textContent = Math.round(combatStats.heal).toLocaleString();
    if (elDmg) elDmg.textContent = Math.round(combatStats.dmg).toLocaleString();
    if (elSleep) elSleep.textContent = combatStats.sleep;
    if (elElim) elElim.textContent = combatStats.elim;
};

// Spawn floating combat numbers / text above impact coordinates
window.spawnFloatingText = function (worldPos, text, colorHex = '#fde047', scaleClass = 'text-base') {
    if (!window.camera) return;
    const worldUiLayer = document.getElementById('world-ui-layer');
    if (!worldUiLayer) return;

    const p = worldPos.clone();
    p.project(window.camera);
    if (p.z >= 1.0) return;

    const sx = (p.x * 0.5 + 0.5) * window.innerWidth + (Math.random() - 0.5) * 28;
    const sy = (-p.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.createElement('div');
    el.className = `floating-combat-text ${scaleClass}`;
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
    el.style.color = colorHex;
    el.textContent = text;
    worldUiLayer.appendChild(el);

    setTimeout(() => el.remove(), 1050);
};

// Top Signature Growth HUD (Wave, ATK scaling, Max HP scaling)
window.updateCoreGrowthHud = function () {
    const growthStats = window.growthStats;
    const player = window.player;
    if (!growthStats || !player) return;

    const currentAtk = growthStats.calculateAtk(false);
    const atkBonus = currentAtk - 75;

    const waveTitle = document.getElementById('hud-wave-title');
    const atkCur = document.getElementById('hud-atk-current');
    const atkBon = document.getElementById('hud-atk-bonus');
    const hpCur = document.getElementById('hud-hp-current');
    const hpMax = document.getElementById('hud-hp-max');
    const shieldBon = document.getElementById('hud-shield-bonus');

    if (waveTitle) waveTitle.textContent = `WAVE ${String(growthStats.currentWave).padStart(2, '0')}`;
    if (atkCur) atkCur.textContent = currentAtk;
    if (atkBon) atkBon.textContent = `(+${atkBonus.toFixed(1)})`;
    if (hpCur) hpCur.textContent = Math.ceil(player.hp);
    if (hpMax) hpMax.textContent = player.maxHp;
    if (shieldBon) {
        shieldBon.textContent = player.overhealth > 0
            ? `(+${Math.ceil(player.overhealth)} 🛡️)`
            : `(+0 🛡️)`;
    }
};

// Build & Update Dynamic HP/Overhealth Pips in Bottom HUD
window.updatePlayerHud = function () {
    const player = window.player;
    if (!player) return;

    const hpNum = document.getElementById('player-hp-num');
    const shieldNum = document.getElementById('player-shield-num');
    const hpMaxLabel = document.getElementById('player-hp-max-label');
    const pipsContainer = document.getElementById('player-hp-pips');
    const selfBadge = document.getElementById('self-buff-badge');
    const ammoCur = document.getElementById('ammo-current');

    if (hpNum) hpNum.textContent = Math.ceil(player.hp);
    if (shieldNum) {
        if (player.overhealth > 0) {
            shieldNum.classList.remove('hidden');
            shieldNum.textContent = `(+${Math.ceil(player.overhealth)} 🛡️)`;
        } else {
            shieldNum.classList.add('hidden');
        }
    }
    if (hpMaxLabel) hpMaxLabel.textContent = `/ ${player.maxHp}`;

    // Rebuild Pip elements
    if (pipsContainer) {
        const totalHpPips = Math.ceil(player.maxHp / 25);
        const activeHpPips = Math.ceil((player.hp / player.maxHp) * totalHpPips);
        const shieldPips = Math.ceil(player.overhealth / 25);

        pipsContainer.innerHTML = '';
        for (let i = 0; i < totalHpPips; i++) {
            const pip = document.createElement('div');
            if (i < activeHpPips) {
                pip.className = player.healBoostTimer > 0
                    ? 'hp-pip bg-amber-300 shadow-[0_0_8px_#fbbf24]'
                    : 'hp-pip bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]';
            } else {
                pip.className = 'hp-pip bg-slate-700/60';
            }
            pipsContainer.appendChild(pip);
        }
        for (let s = 0; s < shieldPips; s++) {
            const sPip = document.createElement('div');
            sPip.className = 'hp-shield-pip';
            pipsContainer.appendChild(sPip);
        }
    }

    if (selfBadge) {
        if (player.healBoostTimer > 0) selfBadge.classList.remove('hidden');
        else selfBadge.classList.add('hidden');
    }

    if (ammoCur) {
        ammoCur.textContent = player.isReloading ? '장전중' : player.ammo;
    }

    // Cooldown UI Displays (Desktop & Mobile)
    const shiftBox = document.getElementById('btn-skill-shift');
    const shiftText = document.getElementById('cd-shift');
    const touchSleepText = document.getElementById('touch-cd-sleep');
    if (shiftBox && shiftText) {
        if (player.cdShift > 0) {
            shiftBox.classList.remove('ready');
            shiftBox.classList.add('on-cooldown');
            shiftText.textContent = player.cdShift.toFixed(1) + 's';
            shiftText.className = 'text-sm font-black text-red-400 mt-0.5';
            if (touchSleepText) touchSleepText.textContent = player.cdShift.toFixed(1) + 's';
        } else {
            shiftBox.classList.add('ready');
            shiftBox.classList.remove('on-cooldown');
            shiftText.textContent = '수면총';
            shiftText.className = 'text-[11px] font-bold text-white mt-0.5';
            if (touchSleepText) touchSleepText.textContent = '수면';
        }
    }

    const eBox = document.getElementById('btn-skill-e');
    const eText = document.getElementById('cd-e');
    const touchNadeText = document.getElementById('touch-cd-nade');
    if (eBox && eText) {
        if (player.cdE > 0) {
            eBox.classList.remove('ready');
            eBox.classList.add('on-cooldown');
            eText.textContent = player.cdE.toFixed(1) + 's';
            eText.className = 'text-sm font-black text-red-400 mt-0.5';
            if (touchNadeText) touchNadeText.textContent = player.cdE.toFixed(1) + 's';
        } else {
            eBox.classList.add('ready');
            eBox.classList.remove('on-cooldown');
            eText.textContent = '생체탄';
            eText.className = 'text-[11px] font-bold text-white mt-0.5';
            if (touchNadeText) touchNadeText.textContent = '생체탄';
        }
    }

    // Ultimate Ring & Progress
    const ultPct = Math.floor(player.ultCharge);
    const ultPctEl = document.getElementById('ult-percent-text');
    const touchUltText = document.getElementById('touch-ult-pct');
    const ultRing = document.getElementById('ult-ring');

    if (ultPctEl) ultPctEl.textContent = ultPct >= 100 ? 'READY' : `${ultPct}%`;
    if (touchUltText) touchUltText.textContent = ultPct >= 100 ? '나노 Q' : `${ultPct}%`;
    if (ultRing) {
        const dashOffset = 264 - (264 * Math.min(100, ultPct)) / 100;
        ultRing.style.strokeDashoffset = dashOffset;
        ultRing.style.stroke = ultPct >= 100 ? '#fbbf24' : '#38bdf8';
    }

    window.updateCoreGrowthHud();
};

// Combat Callout Toast Feed
window.showCombatCallout = function (title, subtitle, colorClass = 'border-cyan-400 text-cyan-300') {
    const feed = document.getElementById('combat-feed');
    if (!feed) return;

    const toast = document.createElement('div');
    toast.className = `event-toast bg-slate-950/90 border-l-4 ${colorClass} px-4 py-1.5 rounded-r-lg shadow-lg backdrop-blur-md text-center`;
    toast.innerHTML = `
        <div class="text-xs sm:text-sm font-black tracking-wide">${title}</div>
        ${subtitle ? `<div class="text-[11px] text-slate-300">${subtitle}</div>` : ''}
    `;
    feed.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
};

// Hitmarker Flash Effect (Yellow for heal, Red for damage)
let hitMarkerTimeout = null;
window.flashHitMarker = function (isHeal = false) {
    const hm = document.getElementById('hit-marker');
    if (!hm) return;

    const color = isHeal ? '#fde047' : '#ef4444';
    ['hm-1', 'hm-2', 'hm-3', 'hm-4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('stroke', color);
    });
    hm.style.opacity = '1';

    clearTimeout(hitMarkerTimeout);
    hitMarkerTimeout = setTimeout(() => {
        hm.style.opacity = '0';
    }, 180);
};

// View Mode Transition ('tps' | 'fps')
window.setViewMode = function (mode) {
    const player = window.player;
    if (!player) return;

    if (player.isScoped && window.toggleScope) {
        window.toggleScope(false);
    }
    // Default to 'tps' if unknown
    player.viewMode = (mode === 'fps') ? 'fps' : 'tps';

    const btnTps = document.getElementById('btn-cam-tps');
    const btnFps = document.getElementById('btn-cam-fps');
    const chLayer = document.getElementById('crosshair-layer');

    if (btnTps) {
        btnTps.className = player.viewMode === 'tps'
            ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white border border-blue-400 shadow'
            : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800/90 text-slate-200 border border-slate-600';
    }
    if (btnFps) {
        btnFps.className = player.viewMode === 'fps'
            ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white border border-blue-400 shadow'
            : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800/90 text-slate-200 border border-slate-600';
    }

    const anaModel = window.anaModel;
    const fpsViewModel = window.fpsViewModel;

    if (chLayer) chLayer.classList.remove('hidden');
    if (anaModel) anaModel.root.visible = (player.viewMode === 'tps');
    if (fpsViewModel) fpsViewModel.root.visible = (player.viewMode === 'fps' && !player.isScoped);

    if (player.viewMode === 'fps') {
        window.showCombatCallout(
            '🔫 1인칭 전투 시점 활성화',
            '사격 시 노리쇠 왕복, Shift 수면총 권총, E 수류탄 투척, R 재장전 손 모션이 작동합니다!',
            'border-cyan-400 text-cyan-300'
        );
    } else {
        window.showCombatCallout(
            '🎯 3인칭 숄더뷰 전투 시점 활성화',
            '마우스 클릭으로 사격/치유, 우클릭 저격 조준경을 사용하세요!',
            'border-blue-400 text-blue-300'
        );
    }
};
