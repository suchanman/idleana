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
        if (e.code === 'KeyV' && window.setViewMode) {
            window.setViewMode(player.viewMode === 'tps' ? 'fps' : 'tps');
        }
        if (e.code === 'KeyC' && window.setViewMode) {
            window.setViewMode(player.viewMode === 'pose' ? 'tps' : 'pose');
        }
        if (e.code === 'Space' && Math.abs(player.pos.y) < 0.05 && player.viewMode !== 'pose') {
            player.vel.y = 6.8;
        }
    });

    window.addEventListener('keyup', (e) => {
        window.keys[e.code] = false;
    });

    // PointerLock & Mouse Aiming
    let pointerDownPos = { x: 0, y: 0 };
    if (canvas) {
        canvas.addEventListener('mousedown', (e) => {
            if (window.sfx) window.sfx.init();
            pointerDownPos = { x: e.clientX, y: e.clientY };

            if (player.viewMode === 'pose') {
                window.isDraggingLook = true;
                return;
            }
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

        // Mouse Wheel Zoom in Pose Mode
        canvas.addEventListener('wheel', (e) => {
            if (player.viewMode === 'pose') {
                e.preventDefault();
                player.poseZoomDist = Math.max(1.05, Math.min(3.5, player.poseZoomDist + e.deltaY * 0.0015));
            }
        }, { passive: false });
    }

    window.addEventListener('mouseup', (e) => {
        if (player.viewMode === 'pose' && e.button === 0) {
            const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
            if (moveDist < 6 && e.target === canvas && window.fireBioticRifle) {
                window.fireBioticRifle();
            }
        }
        window.isDraggingLook = false;
    });

    window.addEventListener('mousemove', (e) => {
        const sensitivity = player.isScoped ? 0.0011 : 0.0024;
        if (player.viewMode === 'pose' && window.isDraggingLook) {
            player.poseOrbitYaw -= e.movementX * 0.007;
            player.poseOrbitPitch = Math.max(-0.4, Math.min(0.75, player.poseOrbitPitch + e.movementY * 0.006));
            return;
        }
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
    bindClick('btn-cam-pose', () => window.setViewMode && window.setViewMode('pose'));
    bindClick('btn-exit-pose', () => window.setViewMode && window.setViewMode('tps'));
    bindClick('btn-reset-photo-angle', () => {
        player.poseOrbitYaw = -0.62;
        player.poseOrbitPitch = 0.04;
        player.poseZoomDist = 1.85;
    });
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
