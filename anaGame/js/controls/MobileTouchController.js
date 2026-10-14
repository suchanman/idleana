/* ============================================================================
 * [Project: BIOTIC VANGUARD] MobileTouchController.js
 * SECTION 02: Mobile Virtual Joystick, Arc Skill Cluster & Multi-Touch Architecture
 * ============================================================================ */

window.isMobileTouchActive = false;

window.toggleMobileController = function (forceState = null) {
    window.isMobileTouchActive = (forceState !== null) ? forceState : !window.isMobileTouchActive;
    const layer = document.getElementById('mobile-controller-layer');
    const btnToggle = document.getElementById('btn-toggle-touch');

    if (window.isMobileTouchActive) {
        if (layer) layer.classList.remove('hidden');
        if (btnToggle) {
            btnToggle.textContent = '📱 모바일 컨트롤러 ON';
            btnToggle.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white border border-cyan-300 shadow-[0_0_10px_#22d3ee]';
        }
        if (window.showCombatCallout) {
            window.showCombatCallout(
                '📱 모바일 가상 컨트롤러 활성화',
                '화면 좌측: 360° 이동 조이스틱 / 우측: 시점 회전 & 아크 스킬 버튼',
                'border-cyan-400 text-cyan-300'
            );
        }
    } else {
        if (layer) layer.classList.add('hidden');
        if (btnToggle) {
            btnToggle.textContent = '📱 모바일 컨트롤러 OFF';
            btnToggle.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700';
        }
    }
};

window.initMobileTouchController = function () {
    const moveZone = document.getElementById('touch-zone-move');
    const lookZone = document.getElementById('touch-zone-look');
    const jBase = document.getElementById('joystick-base');
    const jKnob = document.getElementById('joystick-knob');
    if (!moveZone || !lookZone || !jBase || !jKnob) return;

    let joystickTouchId = null;
    let joystickOrigin = { x: 0, y: 0 };
    const maxJoyRadius = 45;

    // 1. Left 45% Touch Zone: Floating Dynamic Joystick Movement
    moveZone.addEventListener('touchstart', (e) => {
        if (window.sfx) window.sfx.init();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (joystickTouchId === null) {
                joystickTouchId = t.identifier;
                joystickOrigin = { x: t.clientX, y: t.clientY };

                jBase.style.left = `${t.clientX}px`;
                jBase.style.top = `${t.clientY}px`;
                jBase.classList.remove('hidden');
                jKnob.style.transform = 'translate(-50%, -50%)';
                break;
            }
        }
    }, { passive: false });

    moveZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === joystickTouchId) {
                const dx = t.clientX - joystickOrigin.x;
                const dy = t.clientY - joystickOrigin.y;
                const dist = Math.hypot(dx, dy);
                const clampedDist = Math.min(maxJoyRadius, dist);
                const angle = Math.atan2(dy, dx);

                const knobX = Math.cos(angle) * clampedDist;
                const knobY = Math.sin(angle) * clampedDist;
                jKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

                const intensity = clampedDist / maxJoyRadius;
                if (window.player) {
                    window.player.touchMoveVector.set(Math.cos(angle) * intensity, Math.sin(angle) * intensity);
                }
                break;
            }
        }
    }, { passive: false });

    const endJoystick = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joystickTouchId) {
                joystickTouchId = null;
                jBase.classList.add('hidden');
                if (window.player) window.player.touchMoveVector.set(0, 0);
                break;
            }
        }
    };
    moveZone.addEventListener('touchend', endJoystick, { passive: false });
    moveZone.addEventListener('touchcancel', endJoystick, { passive: false });

    // 2. Right 55% Touch Zone: Camera Rotation & Aiming
    let lookTouchId = null;
    let lastLookPos = { x: 0, y: 0 };

    lookZone.addEventListener('touchstart', (e) => {
        if (window.sfx) window.sfx.init();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (e.target.closest('#arc-skill-cluster')) continue;
            if (lookTouchId === null) {
                lookTouchId = t.identifier;
                lastLookPos = { x: t.clientX, y: t.clientY };
                break;
            }
        }
    }, { passive: false });

    lookZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === lookTouchId) {
                const dx = t.clientX - lastLookPos.x;
                const dy = t.clientY - lastLookPos.y;
                const sensitivity = (window.player && window.player.isScoped) ? 0.0022 : 0.0055;

                if (window.player) {
                    window.player.yaw -= dx * sensitivity;
                    window.player.pitch = THREE.MathUtils.clamp(window.player.pitch - dy * sensitivity, -1.1, 1.1);
                }
                lastLookPos = { x: t.clientX, y: t.clientY };
                break;
            }
        }
    }, { passive: false });

    const endLook = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === lookTouchId) {
                lookTouchId = null;
                break;
            }
        }
    };
    lookZone.addEventListener('touchend', endLook, { passive: false });
    lookZone.addEventListener('touchcancel', endLook, { passive: false });

    // 3. Fire-and-Drag Aiming Button
    const btnTouchFire = document.getElementById('btn-touch-fire');
    let fireTouchId = null;
    let lastFirePos = { x: 0, y: 0 };

    if (btnTouchFire) {
        btnTouchFire.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.sfx) window.sfx.init();
            const t = e.changedTouches[0];
            fireTouchId = t.identifier;
            lastFirePos = { x: t.clientX, y: t.clientY };
            if (window.fireBioticRifle) window.fireBioticRifle();
        }, { passive: false });

        btnTouchFire.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === fireTouchId) {
                    const dx = t.clientX - lastFirePos.x;
                    const dy = t.clientY - lastFirePos.y;
                    const sensitivity = 0.0035;
                    if (window.player) {
                        window.player.yaw -= dx * sensitivity;
                        window.player.pitch = THREE.MathUtils.clamp(window.player.pitch - dy * sensitivity, -1.1, 1.1);
                    }
                    lastFirePos = { x: t.clientX, y: t.clientY };
                    break;
                }
            }
        }, { passive: false });

        btnTouchFire.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fireTouchId = null;
        }, { passive: false });
    }

    // 4. Arc Skill Buttons Direct Touch Handlers
    const bindTouch = (id, fn) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                fn();
            }, { passive: false });
        }
    };

    bindTouch('btn-touch-sleep', () => window.fireSleepDart && window.fireSleepDart());
    bindTouch('btn-touch-nade', () => window.throwBioticGrenade && window.throwBioticGrenade());
    bindTouch('btn-touch-scope', () => window.toggleScope && window.toggleScope());
    bindTouch('btn-touch-ult', () => window.activateNanoBoost && window.activateNanoBoost());
    bindTouch('btn-touch-reload', () => window.attemptActiveReload && window.attemptActiveReload());
    bindTouch('btn-touch-jump', () => {
        if (window.player && Math.abs(window.player.pos.y) < 0.05 && window.player.viewMode !== 'pose') {
            window.player.vel.y = 6.8;
        }
    });

    // Auto-detect mobile devices
    if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) {
        window.toggleMobileController(true);
    }
};
