/* ============================================================================
 * [Project: BIOTIC VANGUARD] GrowthStatSystem.js
 * SECTION 01: Core Permanent Infinite Growth & Scaling Specifications
 * ============================================================================ */
window.growthStats = {
    baseAtk: 75,
    normalKills: 0,
    eliteKills: 0,
    cumulativeHeal: 0,
    grenadeMultiHealCount: 0,
    currentWave: 1,

    // ① [처치 공격력 성장] 최종 공격력(ATK) = 기본 75 + (일반 봇 처치 수 × 3.5) + (엘리트/보스 처치 수 × 18) × 나노 계수(1.5)
    calculateAtk(isNano = false) {
        const killBonus = (this.normalKills * 3.5) + (this.eliteKills * 18);
        const rawAtk = this.baseAtk + killBonus;
        const nanoMultiplier = isNano ? 1.5 : 1.0;
        return Math.round(rawAtk * nanoMultiplier);
    },

    // ② [치유 생명력 성장] 최종 최대 체력(Max HP) = 기본 250 + ⌊누적 유효 치유량 ÷ 100⌋ × 15 + (생체 수류탄 다중 치유 보너스 × 25)
    calculateMaxHp() {
        const healSteps = Math.floor(this.cumulativeHeal / 100);
        const healBonus = healSteps * 15;
        const multiNadeBonus = this.grenadeMultiHealCount * 25;
        return Math.round(250 + healBonus + multiNadeBonus);
    }
};

window.combatStats = {
    heal: 0,
    dmg: 0,
    sleep: 0,
    elim: 0
};

// 연쇄 성장 시너지 (Vital-to-Power Conversion - '베테랑의 여유')
window.checkVitalToPowerSynergy = function () {
    const currentMax = window.player.maxHp;
    const thresholds = [
        { limit: 500, tier: 1, label: '베테랑의 여유 I' },
        { limit: 1000, tier: 2, label: '베테랑의 여유 II' },
        { limit: 1500, tier: 3, label: '베테랑의 여유 III' }
    ];

    thresholds.forEach(t => {
        if (currentMax >= t.limit && window.player.veteranTier < t.tier) {
            window.player.veteranTier = t.tier;
            window.player.maxAmmo += 2; // 생체 소총 탄창 용량 +2발 영구 확장
            window.player.ammo = window.player.maxAmmo;
            // 재장전 속도 12% 가속
            window.player.baseReloadTime = 1.35 * Math.pow(0.88, t.tier);

            if (window.sfx) window.sfx.playLevelUp();
            if (window.showCombatCallout) {
                window.showCombatCallout(
                    `🏆 [${t.label}] 발동!`,
                    `최대 체력 ${t.limit} 돌파! 생체 소총 탄창 +2발 확장 (${window.player.maxAmmo}발) & 재장전 12% 가속!`,
                    'border-amber-400 text-amber-300'
                );
            }
            if (window.spawnFloatingText) {
                window.spawnFloatingText(
                    window.player.pos.clone().add(new THREE.Vector3(0, 2.2, 0)),
                    `✨ ${t.label}! 탄창+2 & 장전 가속!`,
                    '#fbbf24',
                    'text-xl'
                );
            }
        }
    });
};
