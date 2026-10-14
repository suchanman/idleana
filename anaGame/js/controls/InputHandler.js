/* ============================================================================
 * [Project: BIOTIC VANGUARD] InputHandler.js
 * Keyboard, Mouse PointerLock, Orbit Controls, and UI Button Event Listeners
 * ============================================================================ */

window.keys = {};
window.isDraggingLook = false;

window.initInputHandler = function () {
    const canvas = document.getElementById('game-canvas');
    const player = window.player;

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
        window.keys[e.code] = true;
        if (e.code === 'KeyR' && window.attemptActiveReload) window.attemptActiveReload();
        if (e.code === 'KeyM' && window.toggleMobileController) window.toggleMobileController();
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            e.preventDefault();
            if (window.fireSleepDart) window.fireSleepDart();
        }
        if (e.code === 'KeyE' && window.throwBioticGrenade) window.throwBioticGrenade();
        if (e.code === 'KeyQ' && window.activateNanoBoost) window.activateNanoBoost();
        if (e.code === 'KeyZ' && window.toggleScope) window.toggleScope();
        if (e.code === 'KeyV' || e.code === 'KeyC') {
            if (window.setViewMode) {
                window.setViewMode(player.viewMode === 'tps' ? 'fps' : 'tps');
            }
        }
        if (e.code === 'Space' && Math.abs(player.pos.y) < 0.05) {
            player.vel.y = 6.8;
        }
    });

    window.addEventListener('keyup', (e) => {
        window.keys[e.code] = false;
    });

    // PointerLock & Mouse Aiming
    if (canvas) {
        canvas.addEventListener('mousedown', (e) => {
            if (window.sfx) window.sfx.init();

            if (document.pointerLockElement !== canvas) {
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
                window.isDraggingLook = true;
            } else {
                if (e.button === 0 && window.fireBioticRifle) window.fireBioticRifle();
                if (e.button === 2 && window.toggleScope) window.toggleScope();
            }
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (document.pointerLockElement !== canvas && window.toggleScope) {
                window.toggleScope();
            }
        });
    }

    window.addEventListener('mouseup', (e) => {
        window.isDraggingLook = false;
    });

    window.addEventListener('mousemove', (e) => {
        const sensitivity = player.isScoped ? 0.0011 : 0.0024;
        if (document.pointerLockElement === canvas || window.isDraggingLook) {
            player.yaw -= e.movementX * sensitivity;
            player.pitch = Math.max(-1.1, Math.min(1.1, player.pitch - e.movementY * sensitivity));
            player.swayX = THREE.MathUtils.clamp(player.swayX - e.movementX * 0.0006, -0.045, 0.045);
            player.swayY = THREE.MathUtils.clamp(player.swayY + e.movementY * 0.0006, -0.045, 0.045);
        }
    });

    // UI Buttons Binding
    const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    };

    bindClick('btn-toggle-touch', () => window.toggleMobileController && window.toggleMobileController());
    bindClick('btn-cam-tps', () => window.setViewMode && window.setViewMode('tps'));
    bindClick('btn-cam-fps', () => window.setViewMode && window.setViewMode('fps'));
    bindClick('btn-fill-ult', () => {
        player.ultCharge = 100;
        if (window.updatePlayerHud) window.updatePlayerHud();
        if (window.showCombatCallout) {
            window.showCombatCallout(
                '⚡ 궁극기 100% 충전 완료!',
                '아군을 조준하고 Q를 눌러 나노 강화제를 투여하세요!',
                'border-amber-400 text-amber-300'
            );
        }
    });
    bindClick('btn-skill-shift', () => window.fireSleepDart && window.fireSleepDart());
    bindClick('btn-skill-e', () => window.throwBioticGrenade && window.throwBioticGrenade());
    bindClick('btn-skill-scope', () => window.toggleScope && window.toggleScope());
    bindClick('btn-ult-q', () => window.activateNanoBoost && window.activateNanoBoost());

    // Window Resize Handling
    window.addEventListener('resize', () => {
        if (!window.camera || !window.renderer) return;
        window.camera.aspect = window.innerWidth / window.innerHeight;
        window.camera.updateProjectionMatrix();
        window.renderer.setSize(window.innerWidth, window.innerHeight);
    });
};
