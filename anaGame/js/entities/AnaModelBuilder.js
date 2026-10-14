        function createAnaFaceTexture() {
            const c = document.createElement('canvas');
            c.width = 1024;
            c.height = 1024;
            const ctx = c.getContext('2d');

            // Base warm Egyptian olive-tan skin tone
            const skinGrad = ctx.createRadialGradient(512, 500, 80, 512, 520, 480);
            skinGrad.addColorStop(0, '#d29973');
            skinGrad.addColorStop(0.55, '#bd815c');
            skinGrad.addColorStop(1, '#8f5b3c');
            ctx.fillStyle = skinGrad;
            ctx.fillRect(0, 0, 1024, 1024);

            // Cheekbone & jaw contour shading (Overwatch stylized painter look)
            ctx.fillStyle = 'rgba(115, 62, 38, 0.35)';
            ctx.beginPath();
            ctx.ellipse(350, 620, 90, 140, 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(674, 620, 90, 140, -0.35, 0, Math.PI * 2);
            ctx.fill();

            // Subtle veteran nasolabial / expression lines
            ctx.strokeStyle = 'rgba(110, 58, 35, 0.55)';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(465, 585);
            ctx.quadraticCurveTo(435, 635, 442, 685);
            ctx.moveTo(559, 585);
            ctx.quadraticCurveTo(589, 635, 582, 685);
            ctx.stroke();

            // Nose shading & nostrils (center UV around x=512, y=545)
            ctx.fillStyle = 'rgba(105, 52, 30, 0.45)';
            ctx.beginPath();
            ctx.moveTo(492, 460);
            ctx.lineTo(476, 575);
            ctx.lineTo(512, 592);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#5c2c16';
            ctx.beginPath();
            ctx.ellipse(494, 582, 11, 6, 0.3, 0, Math.PI * 2);
            ctx.ellipse(530, 582, 11, 6, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Sculpted Lips (Terracotta / Dark Plum-Rose like in the screenshot)
            // Upper lip
            ctx.fillStyle = '#7c423c';
            ctx.beginPath();
            ctx.moveTo(448, 658);
            ctx.quadraticCurveTo(485, 642, 512, 650);
            ctx.quadraticCurveTo(539, 642, 576, 658);
            ctx.quadraticCurveTo(512, 666, 448, 658);
            ctx.fill();

            // Lower lip with subtle highlight
            const lipGrad = ctx.createLinearGradient(512, 658, 512, 690);
            lipGrad.addColorStop(0, '#9e584f');
            lipGrad.addColorStop(0.6, '#b36a60');
            lipGrad.addColorStop(1, '#703832');
            ctx.fillStyle = lipGrad;
            ctx.beginPath();
            ctx.moveTo(452, 660);
            ctx.quadraticCurveTo(512, 665, 572, 660);
            ctx.quadraticCurveTo(548, 692, 512, 692);
            ctx.quadraticCurveTo(476, 692, 452, 660);
            ctx.fill();

            // Lip parting line
            ctx.strokeStyle = '#3d1916';
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(446, 659);
            ctx.quadraticCurveTo(512, 666, 578, 659);
            ctx.stroke();

            // --- ANA'S LEFT EYE (Viewer's Right Side -> UV x ~ 595, y ~ 465) ---
            // Fierce Angled Silver-Charcoal Eyebrow
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.moveTo(542, 422);
            ctx.quadraticCurveTo(598, 396, 662, 412);
            ctx.lineTo(656, 428);
            ctx.quadraticCurveTo(596, 415, 546, 435);
            ctx.closePath();
            ctx.fill();

            // Heavy Egyptian Black Kohl Eyeshadow & Winged Eyeliner
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.moveTo(548, 466);
            ctx.quadraticCurveTo(595, 432, 658, 455);
            ctx.lineTo(672, 448); // Wing tip
            ctx.quadraticCurveTo(642, 488, 595, 488);
            ctx.quadraticCurveTo(564, 484, 548, 466);
            ctx.closePath();
            ctx.fill();

            // Crisp White Sclera
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(558, 465);
            ctx.quadraticCurveTo(596, 444, 638, 460);
            ctx.quadraticCurveTo(600, 480, 558, 465);
            ctx.closePath();
            ctx.fill();

            // Dark Warm Brown Iris & Pupil (Looking slightly towards rifle target)
            ctx.fillStyle = '#2e1d12';
            ctx.beginPath();
            ctx.arc(596, 462, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.arc(596, 462, 8.5, 0, Math.PI * 2);
            ctx.fill();

            // Sharp Eye Specular Highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(590, 456, 4.2, 0, Math.PI * 2);
            ctx.arc(603, 466, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // --- ICONIC EYE OF HORUS (WEDJAT) TATTOO UNDER HER LEFT EYE ---
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 6.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Curved lower Horus bar sweeping out toward temple
            ctx.beginPath();
            ctx.moveTo(558, 494);
            ctx.quadraticCurveTo(602, 512, 658, 484);
            ctx.stroke();
            // Vertical Horus drop-mark & curl on cheek
            ctx.beginPath();
            ctx.moveTo(602, 502);
            ctx.lineTo(596, 544);
            ctx.quadraticCurveTo(594, 556, 582, 552);
            ctx.stroke();
            // Outer falcon tail mark
            ctx.beginPath();
            ctx.moveTo(632, 496);
            ctx.lineTo(654, 522);
            ctx.stroke();

            // --- ANA'S RIGHT EYE (Viewer's Left -> Covered by Eyepatch, add strap shadow) ---
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.ellipse(425, 465, 54, 38, -0.1, 0, Math.PI * 2);
            ctx.fill();

            const tex = new THREE.CanvasTexture(c);
            tex.needsUpdate = true;
            return tex;
        }

        function createAnaCharacterModel() {
            const root = new THREE.Group();

            // Carefully Matched Overwatch Reference Palette (from image_58b867.png)
            const matHoodCharcoal = new THREE.MeshStandardMaterial({ color: 0x222631, roughness: 0.72, metalness: 0.18 });
            const matHoodInnerDark = new THREE.MeshStandardMaterial({ color: 0x14171f, roughness: 0.85, metalness: 0.1, side: THREE.DoubleSide });
            const matHijabBlue = new THREE.MeshStandardMaterial({ color: 0x1d56d8, roughness: 0.48, metalness: 0.15 });
            const matRifleBlue = new THREE.MeshStandardMaterial({ color: 0x2255dd, roughness: 0.32, metalness: 0.42 });
            const matSkinSolid = new THREE.MeshStandardMaterial({ color: 0xc28560, roughness: 0.6, metalness: 0.05 });
            const matFaceTextured = new THREE.MeshStandardMaterial({
                map: createAnaFaceTexture(),
                roughness: 0.58,
                metalness: 0.04
            });
            const matHairWhite = new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 0.35, metalness: 0.12 });
            const matHairSilver = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4, metalness: 0.18 });
            const matMetalSilver = new THREE.MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.22, metalness: 0.88 });
            const matGunBlack = new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.38, metalness: 0.72 });
            const matCeramWhite = new THREE.MeshStandardMaterial({ color: 0xeaeff5, roughness: 0.28, metalness: 0.22 });
            const matSageOlive = new THREE.MeshStandardMaterial({ color: 0x576052, roughness: 0.75, metalness: 0.12 });
            const matLeatherBlack = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.55, metalness: 0.25 });
            const matBioticAmber = new THREE.MeshStandardMaterial({
                color: 0xf59e0b,
                emissive: 0xd97706,
                emissiveIntensity: 0.65,
                roughness: 0.2,
                metalness: 0.3
            });
            const matCyanOptic = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

            // ========================================================================
            // 1. PELVIS, CROUCHED LEGS & TACTICAL FRONT TABARD (Exact lower half of photo)
            // ========================================================================
            const pelvis = new THREE.Group();
            pelvis.position.y = 0.92;
            root.add(pelvis);

            const hipBlock = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.34), matHoodCharcoal);
            pelvis.add(hipBlock);

            // Left Hip Sleep Dart Pistol Holster & Right Hip Biotic Grenade Pouches
            const holsterGroup = new THREE.Group();
            holsterGroup.position.set(0.25, -0.06, 0.02);
            holsterGroup.rotation.z = 0.18;
            pelvis.add(holsterGroup);
            const holsterBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.16), matLeatherBlack);
            holsterGroup.add(holsterBox);
            const holsterStripe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.05, 0.165), matHijabBlue);
            holsterStripe.position.y = 0.05;
            holsterGroup.add(holsterStripe);

            // Right Hip Spare Biotic Grenade Canisters on Belt
            const hipNadeGroup = new THREE.Group();
            hipNadeGroup.position.set(-0.25, -0.02, 0.05);
            pelvis.add(hipNadeGroup);
            [-0.04, 0.04].forEach(zOff => {
                const miniNade = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.11, 10), matBioticAmber);
                miniNade.position.set(0, 0, zOff);
                hipNadeGroup.add(miniNade);
                const miniCap = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.025, 10), matRifleBlue);
                miniCap.position.set(0, 0.05, zOff);
                hipNadeGroup.add(miniCap);
            });

            // Dark Segmented Waist Tabard / Apron hanging in front
            const tabardGroup = new THREE.Group();
            tabardGroup.position.set(0, -0.06, 0.17);
            pelvis.add(tabardGroup);

            const mainTabard = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.52, 0.05), matLeatherBlack);
            mainTabard.position.set(0, -0.24, 0);
            tabardGroup.add(mainTabard);

            // Vertical quilt lines on dark tabard
            for (let i = -1; i <= 1; i++) {
                const rib = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.48, 0.06), matHoodCharcoal);
                rib.position.set(i * 0.085, -0.24, 0.005);
                tabardGroup.add(rib);
            }

            // Two Blue-Bordered Hanging Belt Straps with Silver Tips (Visible at bottom-left of photo!)
            [-0.045, 0.055].forEach((xOff, idx) => {
                const strapLoop = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.58, 0.065), matHijabBlue);
                strapLoop.position.set(xOff, -0.28 - idx * 0.04, 0.02);
                strapLoop.rotation.z = idx === 0 ? -0.05 : 0.08;
                tabardGroup.add(strapLoop);

                const strapInner = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.56, 0.07), matLeatherBlack);
                strapInner.position.copy(strapLoop.position);
                strapInner.rotation.copy(strapLoop.rotation);
                tabardGroup.add(strapInner);

                const buckleEnd = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.06, 0.074), matMetalSilver);
                buckleEnd.position.set(xOff, -0.55 - idx * 0.04, 0.02);
                tabardGroup.add(buckleEnd);
            });

            // Flowing Olive & Charcoal Sniper Trench Coat Skirts (Flared around her wide sniper stance)
            function createCoatSidePanel(isLeft) {
                const side = isLeft ? 1 : -1;
                const skirtGroup = new THREE.Group();
                skirtGroup.position.set(side * 0.21, -0.04, -0.02);
                skirtGroup.rotation.z = side * 0.28;
                skirtGroup.rotation.x = 0.14;

                const outerCoat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.78, 0.42), matSageOlive);
                outerCoat.position.set(0, -0.36, 0);
                skirtGroup.add(outerCoat);

                const blueTrimEdge = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.78, 0.06), matHijabBlue);
                blueTrimEdge.position.set(0, -0.36, 0.19);
                skirtGroup.add(blueTrimEdge);

                const darkInnerEdge = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.78, 0.12), matHoodCharcoal);
                darkInnerEdge.position.set(0, -0.36, 0.14);
                skirtGroup.add(darkInnerEdge);

                return skirtGroup;
            }
            const leftCoatPanel = createCoatSidePanel(true);
            const rightCoatPanel = createCoatSidePanel(false);
            pelvis.add(leftCoatPanel);
            pelvis.add(rightCoatPanel);

            // Articulated Crouching/Striding Legs with Knee & Ankle Joints
            function createLeg(isLeft) {
                const side = isLeft ? 1 : -1;
                const legGroup = new THREE.Group();
                legGroup.position.set(side * 0.15, -0.06, 0.02);

                // Olive-grey padded thigh pants
                const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.105, 0.44, 14), matSageOlive);
                thigh.position.y = -0.20;
                legGroup.add(thigh);

                // Dark thigh strap & armor plate
                const thighStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.124, 0.120, 0.07, 14), matLeatherBlack);
                thighStrap.position.y = -0.22;
                legGroup.add(thighStrap);

                // Knee Pivot Group for realistic walking knee bend
                const kneeGroup = new THREE.Group();
                kneeGroup.position.set(0, -0.42, 0.0);
                legGroup.add(kneeGroup);

                const kneePad = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.17), matLeatherBlack);
                kneePad.position.set(0, 0, 0.03);
                kneeGroup.add(kneePad);

                const kneeCapSilver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.03), matMetalSilver);
                kneeCapSilver.position.set(0, 0, 0.115);
                kneeGroup.add(kneeCapSilver);

                const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.078, 0.42, 12), matHoodCharcoal);
                shin.position.y = -0.22;
                kneeGroup.add(shin);

                // Shin wrap straps
                const shinWrap = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.086, 0.14, 12), matHijabBlue);
                shinWrap.position.y = -0.26;
                kneeGroup.add(shinWrap);

                const bootGroup = new THREE.Group();
                bootGroup.position.set(0, -0.42, 0.04);
                kneeGroup.add(bootGroup);

                const boot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.27), matLeatherBlack);
                bootGroup.add(boot);

                legGroup.userData = { kneeGroup, bootGroup };
                return legGroup;
            }
            const leftLeg = createLeg(true);
            const rightLeg = createLeg(false);
            pelvis.add(leftLeg);
            pelvis.add(rightLeg);

            // ========================================================================
            // 2. TORSO, UTILITY BELT, POUCHES & LAYERED NECK SCARF
            // ========================================================================
            const torso = new THREE.Group();
            torso.position.y = 0.10;
            pelvis.add(torso);

            // Flowing Back Sniper Cape / Cloak with Cobalt Blue Trim
            const backCapeGroup = new THREE.Group();
            backCapeGroup.position.set(0, 0.46, -0.15);
            torso.add(backCapeGroup);
            const backCapeMain = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.92, 0.05), matHoodCharcoal);
            backCapeMain.position.set(0, -0.44, -0.04);
            backCapeMain.rotation.x = 0.15;
            backCapeGroup.add(backCapeMain);
            const backCapeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.055), matHijabBlue);
            backCapeTrim.position.set(0, -0.86, -0.10);
            backCapeTrim.rotation.x = 0.15;
            backCapeGroup.add(backCapeTrim);

            // Core Upper Coat Body
            const upperBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.56, 16), matHoodCharcoal);
            upperBody.position.y = 0.28;
            torso.add(upperBody);

            // Sage-Olive Tactical Jacket Vest Panels & Shoulder Armor Pads
            const vestChest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.40, 0.31), matSageOlive);
            vestChest.position.set(0, 0.30, 0.01);
            torso.add(vestChest);

            // Shoulder Pads with White/Blue Overwatch Trim (Visible on her shoulders in photo!)
            [-1, 1].forEach(side => {
                const padGroup = new THREE.Group();
                padGroup.position.set(side * 0.28, 0.48, 0.0);
                padGroup.rotation.z = -side * 0.25;

                const padBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.26), matSageOlive);
                padGroup.add(padBase);

                const padWhiteTrim = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.27), matCeramWhite);
                padWhiteTrim.position.y = 0.045;
                padGroup.add(padWhiteTrim);

                const padDarkPatch = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.07, 0.14), matLeatherBlack);
                padDarkPatch.position.set(side * 0.01, -0.01, 0.02);
                padGroup.add(padDarkPatch);

                torso.add(padGroup);
            });

            // Utility Belt + Rectangular Brushed-Silver Buckle + Dark Pouches (Clearly visible under her rifle strap!)
            const mainBelt = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.10, 0.35), matLeatherBlack);
            mainBelt.position.set(0, 0.04, 0.02);
            torso.add(mainBelt);

            const silverBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.085, 0.04), matMetalSilver);
            silverBuckle.position.set(-0.04, 0.04, 0.19);
            torso.add(silverBuckle);

            // Sub-belt with Blue Pouches & Silver Studs
            const subBeltPouch = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.11, 0.12), matHijabBlue);
            subBeltPouch.position.set(0.02, -0.05, 0.16);
            torso.add(subBeltPouch);

            const darkPouchFront = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.13), matLeatherBlack);
            darkPouchFront.position.set(0.02, -0.05, 0.165);
            torso.add(darkPouchFront);

            // Two silver dots on the front belt pouch (exact match to photo!)
            [-0.03, 0.06].forEach(px => {
                const stud = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), matMetalSilver);
                stud.position.set(px, -0.05, 0.23);
                torso.add(stud);
            });

            // Thick Charcoal Layered Neck Scarf / Cowl Wrapping Around Chin & Collar
            const cowlBase = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.085, 14, 24), matHoodCharcoal);
            cowlBase.rotation.x = Math.PI / 2 + 0.12;
            cowlBase.position.set(0, 0.55, 0.03);
            torso.add(cowlBase);

            const cowlFoldLower = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.065, 12, 24), matLeatherBlack);
            cowlFoldLower.rotation.x = Math.PI / 2 + 0.2;
            cowlFoldLower.position.set(0, 0.48, 0.04);
            torso.add(cowlFoldLower);

            // ========================================================================
            // 3. SCULPTED HEAD, TEXTURED FACE, EYEPATCH, LAYERED WHITE HAIR & HOOD
            // ========================================================================
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 0.62, 0.04);
            torso.add(headGroup);

            // A. Ana's Sculpted Head with High-Res Facial Texture (Eye of Horus, Kohl Eye, Lips)
            const headGeo = new THREE.SphereGeometry(0.155, 32, 28);
            // Slightly sculpt the sphere into an authentic human jaw/cranium proportion
            const posAttr = headGeo.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                let vx = posAttr.getX(i);
                let vy = posAttr.getY(i);
                let vz = posAttr.getZ(i);
                // Taper lower jaw & chin
                if (vy < 0) {
                    const jawFactor = 1.0 - Math.abs(vy) * 1.45;
                    vx *= Math.max(0.58, jawFactor);
                    if (vz > 0) vz *= Math.max(0.82, jawFactor + 0.15);
                }
                posAttr.setXYZ(i, vx, vy, vz);
            }
            headGeo.computeVertexNormals();

            const faceMesh = new THREE.Mesh(headGeo, matFaceTextured);
            // Align UV center ofSphereGeometry (+X by default in Three.js) to face Forward (+Z)
            faceMesh.rotation.y = -Math.PI / 2;
            faceMesh.scale.set(0.96, 1.08, 0.92);
            faceMesh.position.set(0, 0.13, 0.05);
            headGroup.add(faceMesh);

            // 3D Sculpted Nose Bridge & Tip (Gives real 3D profile when viewed at 3/4 angle!)
            const noseBridge = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.075, 8), matSkinSolid);
            noseBridge.position.set(0, 0.125, 0.192);
            noseBridge.rotation.x = 0.28;
            headGroup.add(noseBridge);

            // B. Black Tactical Eyepatch over Right Eye (-X side) + Diagonal Strap
            const eyePatchPad = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 12), matLeatherBlack);
            eyePatchPad.scale.set(1.15, 0.85, 0.55);
            eyePatchPad.position.set(-0.048, 0.145, 0.178);
            eyePatchPad.rotation.y = -0.25;
            eyePatchPad.rotation.z = 0.12;
            headGroup.add(eyePatchPad);

            // C. Sculpted Multi-Strand Silver-White Hair Bangs (Sweeping across forehead & covering Right Eyepatch!)
            const hairGroup = new THREE.Group();
            hairGroup.position.set(0, 0.13, 0.05);
            headGroup.add(hairGroup);

            // Helper to build sharp, curved Overwatch-style 3D hair locks
            function createHairLock(points, radiusTop, radiusMid, mat) {
                const curve = new THREE.CatmullRomCurve3(points);
                const tubeGeo = new THREE.TubeGeometry(curve, 16, radiusMid, 8, false);
                // Taper the tip of the hair lock so it looks like a sharp anime/Overwatch hair strand
                const p = tubeGeo.attributes.position;
                for (let i = 0; i < p.count; i++) {
                    const vy = p.getY(i);
                    if (vy < 0.02) {
                        const taper = Math.max(0.1, (vy + 0.08) / 0.10);
                        p.setX(i, p.getX(i) * (0.85 + 0.15 * taper));
                    }
                }
                tubeGeo.computeVertexNormals();
                return new THREE.Mesh(tubeGeo, mat);
            }

            // Main thick white fringe sweeping from top center-right down over the left side of screen (Ana's right eye)
            hairGroup.add(createHairLock([
                new THREE.Vector3(0.03, 0.12, 0.11),
                new THREE.Vector3(-0.02, 0.09, 0.155),
                new THREE.Vector3(-0.065, 0.03, 0.162),
                new THREE.Vector3(-0.095, -0.035, 0.138)
            ], 0.03, 0.034, matHairWhite));

            // Second layered white strand slightly closer to nose bridge
            hairGroup.add(createHairLock([
                new THREE.Vector3(0.045, 0.115, 0.115),
                new THREE.Vector3(0.00, 0.075, 0.162),
                new THREE.Vector3(-0.038, 0.015, 0.168),
                new THREE.Vector3(-0.062, -0.038, 0.150)
            ], 0.025, 0.028, matHairSilver));

            // Outer left lock framing the right cheek/eyepatch edge
            hairGroup.add(createHairLock([
                new THREE.Vector3(-0.01, 0.11, 0.11),
                new THREE.Vector3(-0.065, 0.07, 0.142),
                new THREE.Vector3(-0.105, 0.00, 0.135),
                new THREE.Vector3(-0.115, -0.06, 0.11)
            ], 0.026, 0.030, matHairWhite));

            // Subtle upper side strand on her left temple (above the visible left eye)
            hairGroup.add(createHairLock([
                new THREE.Vector3(0.04, 0.12, 0.11),
                new THREE.Vector3(0.085, 0.085, 0.135),
                new THREE.Vector3(0.11, 0.03, 0.125)
            ], 0.018, 0.020, matHairSilver));

            // D. Inner Cobalt-Blue Hijab / Headscarf (Visible band across top forehead + vertical folds framing both cheeks!)
            const hijabGroup = new THREE.Group();
            hijabGroup.position.set(0, 0.13, 0.05);
            headGroup.add(hijabGroup);

            // Top blue brow band right under the dark hood peak
            const browArchCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.13, -0.08, 0.06),
                new THREE.Vector3(-0.125, 0.06, 0.09),
                new THREE.Vector3(-0.07, 0.135, 0.115),
                new THREE.Vector3(0.0, 0.152, 0.122),
                new THREE.Vector3(0.07, 0.135, 0.115),
                new THREE.Vector3(0.125, 0.06, 0.09),
                new THREE.Vector3(0.13, -0.08, 0.06)
            ]);
            const hijabArch = new THREE.Mesh(new THREE.TubeGeometry(browArchCurve, 28, 0.038, 12, false), matHijabBlue);
            hijabGroup.add(hijabArch);

            // Vertical blue scarf folds hanging down both sides of her face into the collar (just like the photo!)
            [-1, 1].forEach(side => {
                const sideDrapeCurve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(side * 0.115, 0.05, 0.095),
                    new THREE.Vector3(side * 0.118, -0.04, 0.095),
                    new THREE.Vector3(side * 0.095, -0.13, 0.085)
                ]);
                const sideDrape = new THREE.Mesh(new THREE.TubeGeometry(sideDrapeCurve, 14, 0.034, 10, false), matHijabBlue);
                hijabGroup.add(sideDrape);
            });

            // E. Outer Dark Charcoal Sniper Hood (Custom Sculpted Peaked Assassin/Sniper Cowl)
            const hoodMeshGroup = new THREE.Group();
            hoodMeshGroup.position.set(0, 0.13, 0.03);
            headGroup.add(hoodMeshGroup);

            // Main sculpted outer hood shell with peaked brow and flared cheek sides
            const hoodShellGeo = new THREE.SphereGeometry(0.245, 32, 28);
            const hPos = hoodShellGeo.attributes.position;
            for (let i = 0; i < hPos.count; i++) {
                let x = hPos.getX(i);
                let y = hPos.getY(i);
                let z = hPos.getZ(i);

                // Carve out the front face opening cleanly
                if (z > 0.06 && y < 0.14 && Math.abs(x) < 0.155) {
                    z = 0.05;
                }
                // Give the top of the hood Ana's signature pointed/peaked ridge
                if (y > 0.08) {
                    const peak = (y - 0.08) * 0.42;
                    y += peak * (1.0 - Math.min(1, Math.abs(x) * 3.5));
                    if (z > 0) z += 0.04; // Forward brow overhang
                }
                // Flare out the lower sides of the hood where it meets the neck scarf
                if (y < 0.0) {
                    x *= 1.12;
                    z *= 1.05;
                }
                hPos.setXYZ(i, x, y, z);
            }
            hoodShellGeo.computeVertexNormals();
            const hoodShell = new THREE.Mesh(hoodShellGeo, matHoodCharcoal);
            hoodMeshGroup.add(hoodShell);

            // Thick Sculpted Front Cowl Rim framing the blue headscarf (Creates the deep layered hood look in the photo!)
            const hoodRimCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.14, -0.14, 0.08),
                new THREE.Vector3(-0.185, -0.02, 0.105),
                new THREE.Vector3(-0.165, 0.11, 0.125),
                new THREE.Vector3(-0.08, 0.21, 0.145),
                new THREE.Vector3(0.0, 0.235, 0.162), // Peaked forehead brow
                new THREE.Vector3(0.08, 0.21, 0.145),
                new THREE.Vector3(0.165, 0.11, 0.125),
                new THREE.Vector3(0.185, -0.02, 0.105),
                new THREE.Vector3(0.14, -0.14, 0.08)
            ]);
            const hoodRimTube = new THREE.Mesh(new THREE.TubeGeometry(hoodRimCurve, 36, 0.048, 14, false), matHoodCharcoal);
            hoodMeshGroup.add(hoodRimTube);

            // ICONIC FOREHEAD SILVER CLASP ON TOP CENTER OF HOOD (With two dark vertical stripes!)
            const claspGroup = new THREE.Group();
            claspGroup.position.set(0, 0.242, 0.172);
            claspGroup.rotation.x = -0.32;
            hoodMeshGroup.add(claspGroup);

            const claspPlate = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.085, 0.032), matMetalSilver);
            claspGroup.add(claspPlate);

            // Two dark vertical slots on the silver forehead clasp (Exact detail from image_58b867.png!)
            [-0.014, 0.014].forEach(sx => {
                const slot = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.062, 0.036), matHoodInnerDark);
                slot.position.set(sx, -0.005, 0.002);
                claspGroup.add(slot);
            });

            // ICONIC SILVER HEX RIVET ON RIGHT SIDE OF HOOD (Viewer's left side of hood!)
            const sideRivet = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 6), matMetalSilver);
            sideRivet.rotation.z = Math.PI / 2;
            sideRivet.rotation.y = 0.45;
            sideRivet.position.set(-0.205, 0.085, 0.105);
            hoodMeshGroup.add(sideRivet);

            const rivetCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.024, 8), matHoodCharcoal);
            rivetCenter.position.copy(sideRivet.position);
            rivetCenter.rotation.copy(sideRivet.rotation);
            hoodMeshGroup.add(rivetCenter);

            // ========================================================================
            // 4. ARTICULATED ARMS, GLOVED HANDS WITH FINGERS & SLEEP DART GAUNTLET
            // ========================================================================
            const rightShoulder = new THREE.Group();
            rightShoulder.position.set(-0.26, 0.45, 0.04);
            torso.add(rightShoulder);

            const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.068, 0.32, 12), matSageOlive);
            rUpperArm.position.set(-0.02, -0.13, 0.08);
            rUpperArm.rotation.x = -0.75;
            rUpperArm.rotation.z = -0.22;
            rightShoulder.add(rUpperArm);

            const rightElbow = new THREE.Group();
            rightElbow.position.set(0.06, -0.20, 0.26);
            rightShoulder.add(rightElbow);

            const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.28, 12), matLeatherBlack);
            rForearm.rotation.x = -1.42;
            rForearm.rotation.z = -0.42;
            rightElbow.add(rForearm);

            // Right Gloved Hand with Sculpted Fingers wrapping the rifle grip
            const rHand = new THREE.Group();
            rHand.position.set(0.08, 0.02, 0.10);
            rightElbow.add(rHand);
            const rPalm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.09), matLeatherBlack);
            rHand.add(rPalm);
            for (let f = 0; f < 4; f++) {
                const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.010, 0.065, 8), matLeatherBlack);
                finger.rotation.z = Math.PI / 2;
                finger.position.set(0.035, 0.025 - f * 0.018, 0.03);
                rHand.add(finger);
            }

            // Left Arm (Supports rifle normally, and animates for Sleep Dart, Biotic Grenade, Reload & Nano Boost!)
            const leftShoulder = new THREE.Group();
            leftShoulder.position.set(0.25, 0.45, 0.04);
            torso.add(leftShoulder);

            const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.068, 0.34, 12), matSageOlive);
            lUpperArm.position.set(-0.04, -0.13, 0.14);
            lUpperArm.rotation.x = -1.05;
            lUpperArm.rotation.z = 0.32;
            leftShoulder.add(lUpperArm);

            const leftElbow = new THREE.Group();
            leftElbow.position.set(-0.16, -0.17, 0.36);
            leftShoulder.add(leftElbow);

            const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.32, 12), matLeatherBlack);
            lForearm.rotation.x = -1.48;
            lForearm.rotation.y = -0.32;
            leftElbow.add(lForearm);

            // Sleep Dart Wrist Gauntlet & Sidearm Pistol (Revealed/emphasized when firing Sleep Dart!)
            const sleepGauntlet = new THREE.Group();
            sleepGauntlet.position.set(-0.04, -0.03, 0.06);
            leftElbow.add(sleepGauntlet);
            const gauntletBody = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.068, 0.16), matMetalSilver);
            sleepGauntlet.add(gauntletBody);
            const gauntletTube = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.21, 12), matRifleBlue);
            gauntletTube.rotation.x = Math.PI / 2;
            gauntletTube.position.set(-0.02, -0.01, 0.04);
            sleepGauntlet.add(gauntletTube);
            const gauntletTipGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 10), matCyanOptic);
            gauntletTipGlow.rotation.x = Math.PI / 2;
            gauntletTipGlow.position.set(-0.02, -0.01, 0.15);
            sleepGauntlet.add(gauntletTipGlow);

            // Left Gloved Hand cradling the rifle's white lower receiver (plus held Biotic Grenade prop during throw)
            const lHand = new THREE.Group();
            lHand.position.set(-0.06, 0.03, 0.12);
            leftElbow.add(lHand);
            const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.10), matLeatherBlack);
            lHand.add(lPalm);
            for (let f = 0; f < 4; f++) {
                const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.011, 0.075, 8), matLeatherBlack);
                finger.position.set(-0.03, 0.03, -0.03 + f * 0.022);
                finger.rotation.z = -0.35;
                lHand.add(finger);
            }

            // Held Biotic Grenade in Left Hand (Visible during E throw wind-up!)
            const heldGrenadeProp = new THREE.Group();
            heldGrenadeProp.position.set(0, 0.06, 0.04);
            heldGrenadeProp.visible = false;
            lHand.add(heldGrenadeProp);
            const hgBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 12), matBioticAmber);
            heldGrenadeProp.add(hgBody);
            const hgRing = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 8, 12), matRifleBlue);
            heldGrenadeProp.add(hgRing);

            // ========================================================================
            // 5. THE BIOTIC RIFLE (`생체 소총`) - 1:1 RECREATION OF IMAGE_58B867.PNG
            // ========================================================================
            const rifleGroup = new THREE.Group();
            rifleGroup.position.set(-0.06, 0.33, 0.34);
            torso.add(rifleGroup);

            // A. Sculpted Matte-White Ergonomic Lower Receiver & Angled Canister Housing
            const whiteReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.115, 0.46), matCeramWhite);
            whiteReceiver.position.set(0, -0.025, 0.06);
            rifleGroup.add(whiteReceiver);

            // Curved white front grip housing (where her left hand cradles the gun)
            const whiteForend = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.26, 14), matCeramWhite);
            whiteForend.rotation.x = Math.PI / 2;
            whiteForend.position.set(0, -0.035, 0.22);
            rifleGroup.add(whiteForend);

            // Angled Silver/White Biotic Magazine Cylinder in the grip well (Clearly visible between her hands!)
            const gripCanister = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.040, 0.19, 14), matCeramWhite);
            gripCanister.rotation.x = 0.45;
            gripCanister.position.set(0, -0.10, -0.02);
            rifleGroup.add(gripCanister);

            const canisterBlueBase = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.042, 0.05, 14), matRifleBlue);
            canisterBlueBase.rotation.x = 0.45;
            canisterBlueBase.position.set(0, -0.165, -0.05);
            rifleGroup.add(canisterBlueBase);

            // B. Sleek Cobalt-Blue Upper Receiver Shroud with Slanted Front Cowling
            const blueUpperRear = new THREE.Mesh(new THREE.BoxGeometry(0.102, 0.095, 0.38), matRifleBlue);
            blueUpperRear.position.set(0, 0.065, -0.02);
            rifleGroup.add(blueUpperRear);

            // Slanted forward blue barrel shroud (Exact diagonal shape in screenshot!)
            const blueFrontShroud = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.105, 0.34), matRifleBlue);
            blueFrontShroud.position.set(0, 0.062, 0.28);
            blueFrontShroud.rotation.x = 0.06;
            rifleGroup.add(blueFrontShroud);

            // Black sloped front nose under the blue shroud
            const shroudNose = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.16, 4), matGunBlack);
            shroudNose.rotation.x = Math.PI / 2;
            shroudNose.rotation.z = Math.PI / 4;
            shroudNose.position.set(0, 0.045, 0.46);
            rifleGroup.add(shroudNose);

            // Rear Blue Stock Cheek Rest & White Rivet Details
            const blueStock = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.085, 0.28), matRifleBlue);
            blueStock.position.set(0, 0.015, -0.26);
            rifleGroup.add(blueStock);

            [-0.08, 0.14].forEach(zPos => {
                const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.108, 8), matMetalSilver);
                screw.rotation.z = Math.PI / 2;
                screw.position.set(0, 0.065, zPos);
                rifleGroup.add(screw);
            });

            // C. Glowing Golden-Amber Biotic Chamber (Visible in the side cutout slot!)
            const chamberRecess = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.055, 0.22), matGunBlack);
            chamberRecess.position.set(0, 0.032, 0.04);
            rifleGroup.add(chamberRecess);

            const bioticChamber = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.19, 14), matBioticAmber);
            bioticChamber.rotation.x = Math.PI / 2;
            bioticChamber.position.set(0, 0.034, 0.04);
            rifleGroup.add(bioticChamber);

            // Reciprocating Side Bolt Handle (Cycles back and forth after every shot!)
            const boltCarrierGroup = new THREE.Group();
            boltCarrierGroup.position.set(-0.055, 0.04, 0.02);
            rifleGroup.add(boltCarrierGroup);
            const boltRod = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.022, 0.12), matMetalSilver);
            boltCarrierGroup.add(boltRod);
            const boltKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.045, 10), matGunBlack);
            boltKnob.rotation.z = Math.PI / 2;
            boltKnob.position.set(-0.022, 0, -0.03);
            boltCarrierGroup.add(boltKnob);

            // D. Compact Black Sniper Scope on Top of Receiver
            const scopeRiser = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.055, 0.14), matGunBlack);
            scopeRiser.position.set(0, 0.125, -0.02);
            rifleGroup.add(scopeRiser);

            const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.044, 0.26, 16), matGunBlack);
            scopeTube.rotation.x = Math.PI / 2;
            scopeTube.position.set(0, 0.165, 0.01);
            rifleGroup.add(scopeTube);

            const scopeLens = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), matCyanOptic);
            scopeLens.position.set(0, 0.165, 0.142);
            rifleGroup.add(scopeLens);

            // E. Under-Barrel Stabilizer Tube with Silver Rear & Front Collars (Exact match to photo!)
            const underCollarRear = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.09, 16), matMetalSilver);
            underCollarRear.rotation.x = Math.PI / 2;
            underCollarRear.position.set(0, -0.035, 0.34);
            rifleGroup.add(underCollarRear);

            const underBlackTube = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.38, 16), matGunBlack);
            underBlackTube.rotation.x = Math.PI / 2;
            underBlackTube.position.set(0, -0.035, 0.56);
            rifleGroup.add(underBlackTube);

            const underCollarFront = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.038, 0.065, 16), matMetalSilver);
            underCollarFront.rotation.x = Math.PI / 2;
            underCollarFront.position.set(0, -0.035, 0.77);
            rifleGroup.add(underCollarFront);

            const underCyanTip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.072, 12), matCyanOptic);
            underCyanTip.rotation.x = Math.PI / 2;
            underCyanTip.position.set(0, -0.035, 0.772);
            rifleGroup.add(underCyanTip);

            // F. Long Matte-Black Heavy Sniper Barrel
            const mainBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.030, 1.28, 16), matGunBlack);
            mainBarrel.rotation.x = Math.PI / 2;
            mainBarrel.position.set(0, 0.072, 0.96);
            rifleGroup.add(mainBarrel);

            // G. Iconic Silver Two-Pronged Forked Muzzle Brake (Top-right of screenshot!)
            const muzzleGroup = new THREE.Group();
            muzzleGroup.position.set(0, 0.072, 1.60);
            rifleGroup.add(muzzleGroup);

            // Tapered silver barrel collar
            const muzzleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.029, 0.14, 16), matMetalSilver);
            muzzleBase.rotation.x = Math.PI / 2;
            muzzleGroup.add(muzzleBase);

            // Upper & Lower Forked Prongs with side cutouts
            const prongTop = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.022, 0.22), matMetalSilver);
            prongTop.position.set(0, 0.028, 0.15);
            muzzleGroup.add(prongTop);

            const prongBot = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.022, 0.22), matMetalSilver);
            prongBot.position.set(0, -0.028, 0.15);
            muzzleGroup.add(prongBot);

            // Bridged tip of the muzzle brake
            const prongBridge = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.078, 0.032), matMetalSilver);
            prongBridge.position.set(0, 0, 0.25);
            muzzleGroup.add(prongBridge);

            const muzzlePoint = new THREE.Object3D();
            muzzlePoint.position.set(0, 0, 0.28);
            muzzleGroup.add(muzzlePoint);

            // 3D Muzzle Flash Burst Mesh (Flashes when firing!)
            const muzzleFlashMat = new THREE.MeshBasicMaterial({
                color: 0xfde047,
                transparent: true,
                opacity: 0.0,
                depthWrite: false
            });
            const muzzleFlashMesh = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 8), muzzleFlashMat);
            muzzleFlashMesh.rotation.x = Math.PI / 2;
            muzzleFlashMesh.position.set(0, 0, 0.42);
            muzzleGroup.add(muzzleFlashMesh);

            // H. Wide Curved Olive-Grey Rifle Sling / Strap (Hanging in a deep U-loop under her hands!)
            const strapMountRear = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.007, 8, 12), matMetalSilver);
            strapMountRear.position.set(0, -0.17, -0.14);
            rifleGroup.add(strapMountRear);

            const strapMountFront = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.05, 0.045), matMetalSilver);
            strapMountFront.position.set(0, -0.075, 0.56);
            rifleGroup.add(strapMountFront);

            const strapCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0.0, -0.18, -0.14),
                new THREE.Vector3(0.02, -0.42, -0.06),
                new THREE.Vector3(0.04, -0.58, 0.14),
                new THREE.Vector3(0.04, -0.54, 0.36),
                new THREE.Vector3(0.02, -0.34, 0.52),
                new THREE.Vector3(0.0, -0.09, 0.56)
            ]);
            const strapGeo = new THREE.TubeGeometry(strapCurve, 36, 0.024, 10, false);
            // Flatten the strap slightly into a realistic woven belt cross-section
            strapGeo.scale(0.55, 1.0, 1.0);
            const strapMesh = new THREE.Mesh(strapGeo, matSageOlive);
            rifleGroup.add(strapMesh);

            // Inner dark lining of the sling strap for extra depth
            const strapInnerGeo = new THREE.TubeGeometry(strapCurve, 36, 0.021, 10, false);
            strapInnerGeo.scale(0.45, 0.96, 0.98);
            const strapInnerMesh = new THREE.Mesh(strapInnerGeo, matLeatherBlack);
            strapInnerMesh.position.x = -0.006;
            rifleGroup.add(strapInnerMesh);

            // Enable shadows on all meshes
            root.traverse(obj => {
                if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            });

            return {
                root,
                pelvis,
                torso,
                headGroup,
                leftLeg,
                rightLeg,
                leftCoatPanel,
                rightCoatPanel,
                backCapeGroup,
                leftShoulder,
                leftElbow,
                lHand,
                sleepGauntlet,
                heldGrenadeProp,
                rightShoulder,
                rightElbow,
                rifleGroup,
                gripCanister,
                boltCarrierGroup,
                muzzlePoint,
                muzzleFlashMesh,
                muzzleFlashMat,
                bioticChamber
            };
        }

        /* ============================================================================
         * 2B. FIRST-PERSON (FPS) VIEWMODEL RIG (1인칭 총기, 노리쇠, 수면총, 생체 수류탄 손 모션)
         * ============================================================================ */
        function createFirstPersonViewModel() {
            const fpsRoot = new THREE.Group();

            const matRifleBlue = new THREE.MeshStandardMaterial({ color: 0x2255dd, roughness: 0.3, metalness: 0.45 });
            const matCeramWhite = new THREE.MeshStandardMaterial({ color: 0xeaeff5, roughness: 0.25, metalness: 0.22 });
            const matGunBlack = new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.35, metalness: 0.75 });
            const matMetalSilver = new THREE.MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.2, metalness: 0.88 });
            const matSageOlive = new THREE.MeshStandardMaterial({ color: 0x576052, roughness: 0.72, metalness: 0.12 });
            const matLeatherBlack = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.5, metalness: 0.25 });
            const matBioticAmber = new THREE.MeshStandardMaterial({
                color: 0xf59e0b,
                emissive: 0xd97706,
                emissiveIntensity: 0.85,
                roughness: 0.15,
                metalness: 0.3
            });
            const matCyanOptic = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
            const matPurpleCore = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

            // 1. RIGHT SIDE: 1ST-PERSON BIOTIC RIFLE & RIGHT HAND
            const gunPivot = new THREE.Group();
            gunPivot.position.set(0.27, -0.25, -0.46);
            fpsRoot.add(gunPivot);

            // White Lower Receiver & Grip
            const lowerRec = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.105, 0.48), matCeramWhite);
            lowerRec.position.set(0, -0.02, 0.02);
            gunPivot.add(lowerRec);

            // Detachable Magazine Canister (Animated during Reload!)
            const fpsMagazine = new THREE.Group();
            fpsMagazine.position.set(0, -0.095, 0.06);
            fpsMagazine.rotation.x = 0.42;
            gunPivot.add(fpsMagazine);
            const magCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.17, 14), matCeramWhite);
            fpsMagazine.add(magCyl);
            const magBlueCap = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.037, 0.045, 14), matRifleBlue);
            magBlueCap.position.y = -0.07;
            fpsMagazine.add(magBlueCap);

            // Cobalt-Blue Upper Receiver Shroud
            const upperRec = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.088, 0.62), matRifleBlue);
            upperRec.position.set(0, 0.055, -0.06);
            gunPivot.add(upperRec);

            // Glowing Biotic Syringe Chamber & Internal Pumping Plunger
            const chamberSlot = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.048, 0.22), matGunBlack);
            chamberSlot.position.set(0, 0.028, -0.02);
            gunPivot.add(chamberSlot);

            const fpsBioticVial = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.20, 14), matBioticAmber);
            fpsBioticVial.rotation.x = Math.PI / 2;
            fpsBioticVial.position.set(0, 0.03, -0.02);
            gunPivot.add(fpsBioticVial);

            // Reciprocating Side Bolt Handle (Kicks back on every shot!)
            const fpsBoltGroup = new THREE.Group();
            fpsBoltGroup.position.set(-0.052, 0.036, -0.01);
            gunPivot.add(fpsBoltGroup);
            const boltStem = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.02, 0.13), matMetalSilver);
            fpsBoltGroup.add(boltStem);
            const boltHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.045, 10), matGunBlack);
            boltHandle.rotation.z = Math.PI / 2;
            boltHandle.position.set(-0.022, 0, 0.03);
            fpsBoltGroup.add(boltHandle);

            // Top Sniper Scope & Cyan Glass Reticle Ring
            const scopeMount = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.05, 0.14), matGunBlack);
            scopeMount.position.set(0, 0.11, 0.04);
            gunPivot.add(scopeMount);

            const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.24, 18), matGunBlack);
            scopeBody.rotation.x = Math.PI / 2;
            scopeBody.position.set(0, 0.148, 0.02);
            gunPivot.add(scopeBody);

            const scopeEyeRing = new THREE.Mesh(new THREE.RingGeometry(0.028, 0.042, 18), matCyanOptic);
            scopeEyeRing.position.set(0, 0.148, 0.141);
            gunPivot.add(scopeEyeRing);

            // Long Heavy Sniper Barrel & Silver Forked Muzzle Brake
            const fpsBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.025, 0.95, 14), matGunBlack);
            fpsBarrel.rotation.x = Math.PI / 2;
            fpsBarrel.position.set(0, 0.06, -0.68);
            gunPivot.add(fpsBarrel);

            const fpsUnderTube = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.36, 14), matGunBlack);
            fpsUnderTube.rotation.x = Math.PI / 2;
            fpsUnderTube.position.set(0, -0.028, -0.38);
            gunPivot.add(fpsUnderTube);

            const fpsUnderCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 14), matMetalSilver);
            fpsUnderCollar.rotation.x = Math.PI / 2;
            fpsUnderCollar.position.set(0, -0.028, -0.22);
            gunPivot.add(fpsUnderCollar);

            const fpsMuzzleBrake = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.062, 0.18), matMetalSilver);
            fpsMuzzleBrake.position.set(0, 0.06, -1.18);
            gunPivot.add(fpsMuzzleBrake);

            const fpsMuzzleFlashMat = new THREE.MeshBasicMaterial({
                color: 0xfde047,
                transparent: true,
                opacity: 0.0,
                depthWrite: false
            });
            const fpsMuzzleFlash = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 8), fpsMuzzleFlashMat);
            fpsMuzzleFlash.rotation.x = -Math.PI / 2;
            fpsMuzzleFlash.position.set(0, 0.06, -1.36);
            gunPivot.add(fpsMuzzleFlash);

            // Right Gloved Hand & Sleeve holding the grip
            const rArmGroup = new THREE.Group();
            rArmGroup.position.set(0.04, -0.11, 0.22);
            gunPivot.add(rArmGroup);
            const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.32, 12), matSageOlive);
            rSleeve.rotation.x = 1.25;
            rSleeve.rotation.z = -0.25;
            rArmGroup.add(rSleeve);
            const rGlove = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.11), matLeatherBlack);
            rGlove.position.set(-0.03, 0.05, -0.12);
            rArmGroup.add(rGlove);

            // 2. LEFT SIDE: MULTI-ACTION LEFT ARM (Forend Grip / Sleep Dart Pistol / Biotic Grenade Throw / Nano Boost)
            const leftActionPivot = new THREE.Group();
            leftActionPivot.position.set(-0.24, -0.26, -0.44);
            fpsRoot.add(leftActionPivot);

            const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.34, 12), matSageOlive);
            lSleeve.rotation.x = 1.15;
            lSleeve.rotation.y = 0.35;
            lSleeve.position.set(-0.08, -0.10, 0.14);
            leftActionPivot.add(lSleeve);

            // Wrist Nano/Sleep Gauntlet
            const lWristArmor = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.072, 0.14), matMetalSilver);
            lWristArmor.position.set(-0.02, -0.02, 0.02);
            leftActionPivot.add(lWristArmor);

            const lGlove = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.075, 0.11), matLeatherBlack);
            lGlove.position.set(0.02, 0.01, -0.06);
            leftActionPivot.add(lGlove);

            // A. 1st-Person Sleep Dart Pistol Prop (Appears in left hand when pressing Shift!)
            const sleepPistolProp = new THREE.Group();
            sleepPistolProp.position.set(0.02, 0.06, -0.12);
            sleepPistolProp.visible = false;
            leftActionPivot.add(sleepPistolProp);

            const spBody = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.075, 0.24), matMetalSilver);
            sleepPistolProp.add(spBody);
            const spBlueShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.26, 12), matRifleBlue);
            spBlueShroud.rotation.x = Math.PI / 2;
            spBlueShroud.position.set(0, 0.025, -0.04);
            sleepPistolProp.add(spBlueShroud);
            const spCyanCore = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 10), matCyanOptic);
            spCyanCore.rotation.x = Math.PI / 2;
            spCyanCore.position.set(0, 0.025, -0.14);
            sleepPistolProp.add(spCyanCore);

            // B. 1st-Person Biotic Grenade Prop (Appears in left hand when pressing E!)
            const nadeHandProp = new THREE.Group();
            nadeHandProp.position.set(0.04, 0.07, -0.10);
            nadeHandProp.visible = false;
            leftActionPivot.add(nadeHandProp);

            const nhGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.14, 14), matBioticAmber);
            nadeHandProp.add(nhGlass);
            const nhPurpleSwirl = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.04, 14), matPurpleCore);
            nadeHandProp.add(nhPurpleSwirl);
            const nhCapTop = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.028, 14), matRifleBlue);
            nhCapTop.position.y = 0.07;
            nadeHandProp.add(nhCapTop);
            const nhCapBot = nhCapTop.clone();
            nhCapBot.position.y = -0.07;
            nadeHandProp.add(nhCapBot);

            return {
                root: fpsRoot,
                gunPivot,
                fpsMagazine,
                fpsBoltGroup,
                fpsBioticVial,
                fpsMuzzleFlash,
                fpsMuzzleFlashMat,
                leftActionPivot,
                sleepPistolProp,
                nadeHandProp
            };
        }
