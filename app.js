// ============================================================================
// app.js — Main Scene Controller, Ephemeris, Raycaster & Animation Loop
// ============================================================================

import {
    createEarthAndMoonTextures,
    createEarthMaterial,
    createCloudMaterial,
    createMoonMaterial
} from './shaders.js';

import {
    SPACECRAFT_CATALOG,
    generateNasaReferenceDiagram,
    buildSpacecraftByType
} from './spacecraft.js';

const GLOBE_RADIUS = 10.0;
const MOON_RADIUS = 2.72;
const MOON_ORBIT_RADIUS = 32.0;

const EARTH_DIST_MIN = 12.6;
const EARTH_DIST_MAX = 42.0;
const MOON_DIST_MIN = 4.2;
const MOON_DIST_MAX = 19.5;
const MNL_COORDS = { lat: 14.5995, lon: 120.9842 };

const state = {
    view: 'globe',
    earthZoomNorm: 0.45,
    moonZoomNorm: 0.38,
    axialTiltZDeg: -6.0,
    axialTiltXDeg: 14.0,
    solarMinutesUTC: 580,
    solarDeclinationDeg: 8.0,
    solarMode: 'manual',
    solarLapseSpeed: 48.0,
    moonOrbitDeg: 135.0,
    moonSpinY: 0.0,
    moonSpinX: 0.0,
    cloudsVisible: true,
    satellitesVisible: true,
    cloudOpacity: 0.94,
    cloudSpeedMultiplier: 1.0,
    cloudWindPhase: 0.0,
    autoSpin: true,
    activeSatType: 'landsat9',
    activePartId: null,
    satExploded: false,
    satInspectAngleOffset: 0.0,
    mobileHudMinimized: false,
    bottomDockOpen: true
};

// Initialize blueprints into catalog
Object.keys(SPACECRAFT_CATALOG).forEach(type => {
    SPACECRAFT_CATALOG[type].diagramUri = generateNasaReferenceDiagram(type);
    const thumb = document.getElementById(`apa-thumb-${type}`);
    if (thumb) thumb.src = SPACECRAFT_CATALOG[type].diagramUri;
});

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 1200);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.NoToneMapping;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xdbeafe, 0.62));
const mainSunLight = new THREE.DirectionalLight(0xffffff, 1.35);
mainSunLight.position.set(30, 12, 25);
scene.add(mainSunLight);

const satKeyLight = new THREE.DirectionalLight(0xfffbeb, 1.15);
satKeyLight.position.set(14, 18, 22);
scene.add(satKeyLight);

const satFillLight = new THREE.DirectionalLight(0x38bdf8, 0.68);
satFillLight.position.set(-16, -10, 15);
scene.add(satFillLight);

const satRimLight = new THREE.DirectionalLight(0xe0f2fe, 0.58);
satRimLight.position.set(0, 15, -18);
scene.add(satRimLight);

const earthSystemGroup = new THREE.Group();
scene.add(earthSystemGroup);

const axialTiltGroup = new THREE.Group();
earthSystemGroup.add(axialTiltGroup);

const globeSpinGroup = new THREE.Group();
axialTiltGroup.add(globeSpinGroup);

function applyAxialTilt() {
    axialTiltGroup.rotation.z = THREE.MathUtils.degToRad(state.axialTiltZDeg);
    axialTiltGroup.rotation.x = THREE.MathUtils.degToRad(state.axialTiltXDeg);
}
applyAxialTilt();

function getEarthRestOffset() {
    return window.innerWidth >= 1024
        ? new THREE.Vector3(2.8, -0.2, 0.0)
        : new THREE.Vector3(0.0, -0.6, 0.0);
}
earthSystemGroup.position.copy(getEarthRestOffset());

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function getLocalSunVector(minutesUTC, declinationDeg) {
    const subsolarLon = (720.0 - minutesUTC) / 4.0;
    return latLonToVector3(declinationDeg, subsolarLon, 1.0).normalize();
}

function computeAstronomicalSunAndMoon(dateObj) {
    const utcMinutes = dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() + dateObj.getUTCSeconds() / 60;
    const startOfYear = Date.UTC(dateObj.getUTCFullYear(), 0, 0);
    const dayOfYear = (dateObj.getTime() - startOfYear) / 86400000;
    const sunDeclination = -23.44 * Math.cos(((2 * Math.PI) / 365.24) * (dayOfYear + 10));

    const synodicMonthDays = 29.530588853;
    const refNewMoonUTC = Date.UTC(2000, 0, 6, 18, 14, 0);
    const daysSinceNew = (dateObj.getTime() - refNewMoonUTC) / 86400000;
    const phaseCycle = ((daysSinceNew % synodicMonthDays) + synodicMonthDays) % synodicMonthDays;
    const elongationDeg = (phaseCycle / synodicMonthDays) * 360.0;
    const subsolarLon = (720.0 - utcMinutes) / 4.0;
    const moonOrbitDeg = (subsolarLon + elongationDeg + 360.0) % 360.0;

    return { utcMinutes, sunDeclination, moonOrbitDeg };
}

// Starfield
(function buildDeepSpaceStarfield() {
    const starCount = 3200;
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const palette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xbae6fd),
        new THREE.Color(0xe0f2fe),
        new THREE.Color(0xfef3c7)
    ];
    for (let i = 0; i < starCount; i++) {
        const r = 180 + Math.random() * 260;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
        const c = palette[i % palette.length];
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.15, vertexColors: true, transparent: true, opacity: 0.85 })));
})();

const textures = createEarthAndMoonTextures(renderer);
const initialSun = getLocalSunVector(state.solarMinutesUTC, state.solarDeclinationDeg);

const earthMat = createEarthMaterial(textures, initialSun, state.cloudOpacity);
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 160, 112), earthMat);
globeSpinGroup.add(earthMesh);

const cloudMat = createCloudMaterial(textures, initialSun, state.cloudOpacity);
const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 1.0085, 128, 96), cloudMat);
globeSpinGroup.add(cloudMesh);

const moonOrbitGroup = new THREE.Group();
moonOrbitGroup.rotation.x = THREE.MathUtils.degToRad(5.14);
moonOrbitGroup.rotation.z = THREE.MathUtils.degToRad(-4.0);
earthSystemGroup.add(moonOrbitGroup);

(function buildLunarOrbitLine() {
    const curve = new THREE.EllipseCurve(0, 0, MOON_ORBIT_RADIUS, MOON_ORBIT_RADIUS, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(180).map(p => new THREE.Vector3(p.x, 0, p.y));
    moonOrbitGroup.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.16 })
    ));
})();

const moonPivotGroup = new THREE.Group();
moonOrbitGroup.add(moonPivotGroup);

const moonMat = createMoonMaterial(textures);
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS, 128, 128), moonMat);
moonPivotGroup.add(moonMesh);

function updateMoonPositionAndPhase() {
    const rad = THREE.MathUtils.degToRad(state.moonOrbitDeg);
    moonPivotGroup.position.set(
        Math.cos(rad) * MOON_ORBIT_RADIUS,
        0,
        Math.sin(rad) * MOON_ORBIT_RADIUS
    );
    moonMesh.rotation.y = -rad + Math.PI + state.moonSpinY;
    moonMesh.rotation.x = state.moonSpinX;
}
updateMoonPositionAndPhase();

// Orbiting Satellites
const orbitsContainer = new THREE.Group();
earthSystemGroup.add(orbitsContainer);
const orbitSatellites = [];
const ORBIT_DEFS = [
    { radius: 11.45, rx: 0.55, ry: 0.25, rz: 0.48, speed: 0.22, phase: 0.8, type: 'landsat9' },
    { radius: 11.78, rx: -0.68, ry: 0.42, rz: -0.35, speed: 0.18, phase: 2.3, type: 'tdrsm' },
    { radius: 12.10, rx: 0.32, ry: -0.58, rz: 0.82, speed: 0.20, phase: 3.9, type: 'hubble' },
    { radius: 12.42, rx: 0.88, ry: 0.18, rz: -0.64, speed: 0.16, phase: 5.1, type: 'nisar' }
];

ORBIT_DEFS.forEach(def => {
    const ringPivot = new THREE.Group();
    ringPivot.rotation.set(def.rx, def.ry, def.rz);
    orbitsContainer.add(ringPivot);

    const ellipse = new THREE.EllipseCurve(0, 0, def.radius, def.radius, 0, Math.PI * 2, false, 0);
    const pts = ellipse.getPoints(128).map(p => new THREE.Vector3(p.x, 0, p.y));
    ringPivot.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x18b8ff, transparent: true, opacity: 0.28 })
    ));

    const miniSat = buildSpacecraftByType(def.type);
    miniSat.scale.setScalar(0.14);
    ringPivot.add(miniSat);
    orbitSatellites.push({ def, miniSat, angle: def.phase });
});

// Hero Close-Up Spacecraft
const heroSatelliteGroup = new THREE.Group();
heroSatelliteGroup.position.set(0.0, 0.15, 3.6);
scene.add(heroSatelliteGroup);
let heroSatelliteMesh = null;
const HERO_SAT_BASE_ROT = { x: 0.28, y: -0.35, z: -Math.PI / 4.5 };

function rebuildHeroSpacecraft(type) {
    state.activeSatType = type;
    state.activePartId = null;
    state.satExploded = false;

    const btnExplode = document.getElementById('btn-explode-sat');
    if (btnExplode) btnExplode.textContent = '⊞ Explode All';

    if (heroSatelliteMesh) heroSatelliteGroup.remove(heroSatelliteMesh);
    heroSatelliteMesh = buildSpacecraftByType(type);
    heroSatelliteMesh.scale.setScalar(1.12);
    heroSatelliteMesh.rotation.set(HERO_SAT_BASE_ROT.x, HERO_SAT_BASE_ROT.y + state.satInspectAngleOffset, HERO_SAT_BASE_ROT.z);
    heroSatelliteGroup.add(heroSatelliteMesh);
    populateSpacecraftHUD(type);

    document.querySelectorAll('.sat-type-btn').forEach(b => {
        const isMatch = b.getAttribute('data-sat-type') === type;
        b.className = `sat-type-btn px-2.5 sm:px-3.5 py-1.5 rounded-lg font-orbitron text-[9px] sm:text-[10px] tracking-wider uppercase shrink-0 transition-all border ${
            isMatch ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50' : 'bg-white/5 text-white/70 hover:text-white border-white/10'
        }`;
    });
}

function populateSpacecraftHUD(type) {
    const info = SPACECRAFT_CATALOG[type];
    if (!info) return;

    document.getElementById('sat-class-badge').textContent = info.badge;
    document.getElementById('sat-title-name').textContent = info.name;
    document.getElementById('sat-mission-desc').textContent = info.desc;
    document.getElementById('sat-km-readout').textContent = info.altitudeKm;
    document.getElementById('sat-orbit-regime-lbl').textContent = info.regime;
    document.getElementById('sat-center-deg').textContent = info.inclination;

    const refImgEl = document.getElementById('sat-ref-img');
    const creditEl = document.getElementById('sat-copyright-credit');
    const officialLinkEl = document.getElementById('sat-official-source-link');
    if (refImgEl) refImgEl.src = info.diagramUri;
    if (creditEl) creditEl.textContent = info.copyright;
    if (officialLinkEl) officialLinkEl.href = info.officialUrl;

    const listEl = document.getElementById('sat-parts-list');
    listEl.innerHTML = '';
    info.parts.forEach((part, idx) => {
        const btn = document.createElement('button');
        btn.setAttribute('data-part-id', part.id);
        btn.className = 'w-full text-left px-2.5 py-1.5 rounded-lg font-mono-tech text-[9px] sm:text-[10px] border transition-all flex items-center justify-between bg-white/5 text-white/75 hover:text-white border-white/10';
        btn.innerHTML = `<span class="truncate pr-1">▸ ${part.name}</span><span class="text-[8px] text-cyan-300/80 shrink-0">0${idx + 1}</span>`;
        btn.addEventListener('click', () => {
            selectSpacecraftPart(state.activePartId === part.id ? null : part.id);
        });
        listEl.appendChild(btn);
    });

    selectSpacecraftPart(null);
}

function selectSpacecraftPart(partIdOrNull) {
    state.activePartId = partIdOrNull;
    const info = SPACECRAFT_CATALOG[state.activeSatType];
    const listEl = document.getElementById('sat-parts-list');
    const isolateBadge = document.getElementById('sat-isolate-badge');
    const calloutOverlay = document.getElementById('sat-callout-overlay');
    const headerLbl = document.getElementById('part-header-label');

    if (listEl) {
        Array.from(listEl.children).forEach(btn => {
            const isMatch = btn.getAttribute('data-part-id') === state.activePartId;
            btn.className = `w-full text-left px-2.5 py-1.5 rounded-lg font-mono-tech text-[9px] sm:text-[10px] border transition-all flex items-center justify-between ${
                isMatch
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'bg-white/5 text-white/75 hover:text-white border-white/10'
            }`;
        });
    }

    if (!partIdOrNull) {
        if (isolateBadge) {
            isolateBadge.textContent = state.satExploded ? 'EXPLODED VIEW' : 'ASSEMBLED';
            isolateBadge.className = 'font-mono-tech text-[8px] text-emerald-300';
        }
        if (headerLbl) headerLbl.textContent = 'Spacecraft Assembly Status';
        document.getElementById('part-selected-name').textContent = 'All Subsystems Integrated';
        document.getElementById('part-selected-spec').textContent =
            'Click any subsystem in the list on the left—or click directly on any 3D part of the satellite—to separate and highlight that component.';
        document.getElementById('part-status-tag').textContent = state.satExploded ? 'EXPLODED' : 'FULL ASSEMBLY';
        if (calloutOverlay) calloutOverlay.classList.add('hidden');
    } else {
        const partIdx = info.parts.findIndex(p => p.id === partIdOrNull);
        const part = info.parts[partIdx];
        if (part) {
            if (isolateBadge) {
                isolateBadge.textContent = `PART 0${partIdx + 1} SEPARATED`;
                isolateBadge.className = 'font-mono-tech text-[8px] text-cyan-300';
            }
            if (headerLbl) headerLbl.textContent = `Separated Subsystem // 0${partIdx + 1}`;
            document.getElementById('part-selected-name').textContent = part.name;
            document.getElementById('part-selected-spec').textContent = part.spec;
            document.getElementById('part-status-tag').textContent = part.status;

            const leaderCode = document.getElementById('sat-leader-code');
            const leaderTitle = document.getElementById('sat-leader-title');
            if (leaderCode) leaderCode.textContent = `PART 0${partIdx + 1} // SEPARATED & HIGHLIGHTED`;
            if (leaderTitle) leaderTitle.textContent = part.name;
            if (calloutOverlay && state.view === 'satellite') {
                calloutOverlay.classList.remove('hidden');
            }
        }
    }

    updatePartVisualHighlightAndSeparation();
}

function updatePartVisualHighlightAndSeparation() {
    if (!heroSatelliteMesh || !heroSatelliteMesh.userData.partGroups) return;
    const groups = heroSatelliteMesh.userData.partGroups;
    const catalogParts = SPACECRAFT_CATALOG[state.activeSatType].parts;
    const hasActivePart = Boolean(state.activePartId);

    Object.keys(groups).forEach(k => {
        const g = groups[k];
        const isSelected = (k === state.activePartId);

        g.traverse(child => {
            if (child.isMesh && child.material) {
                if (hasActivePart) {
                    child.material.transparent = !isSelected;
                    child.material.opacity = isSelected ? 1.0 : 0.25;
                    if (child.material.emissive) {
                        if (isSelected) {
                            child.material.emissive.setHex(0x134e6f);
                        } else {
                            child.material.emissive.copy(child.userData.origEmissive || new THREE.Color(0x000000));
                        }
                    }
                } else {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    if (child.material.emissive) {
                        child.material.emissive.copy(child.userData.origEmissive || new THREE.Color(0x000000));
                    }
                }
            }
        });

        const base = g.userData.basePos;
        const infoPart = catalogParts.find(p => p.id === k);
        const off = infoPart ? infoPart.offset : [0, 0, 0];

        if (state.satExploded) {
            g.userData.targetPos = new THREE.Vector3(
                base.x + off[0] * 1.15,
                base.y + off[1] * 1.15,
                base.z + off[2] * 1.15
            );
        } else if (hasActivePart && isSelected) {
            g.userData.targetPos = new THREE.Vector3(
                base.x + off[0] * 0.85,
                base.y + off[1] * 0.85,
                base.z + off[2] * 0.85
            );
        } else {
            g.userData.targetPos = base.clone();
        }
    });
}

rebuildHeroSpacecraft('landsat9');
heroSatelliteGroup.visible = false;

// Camera Rig & Zoom Controls
const camRig = {
    pos: new THREE.Vector3(0, 0, 26.5),
    targetPos: new THREE.Vector3(0, 0, 26.5),
    lookAt: new THREE.Vector3(0, 0, 0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    fov: 38,
    targetFov: 38,
    isDragging: false,
    downPointer: { x: 0, y: 0 },
    prevPointer: { x: 0, y: 0 },
    pinchStartDist: 0
};
camera.position.copy(camRig.pos);

function getActiveZoomNorm() {
    return state.view === 'moon' ? state.moonZoomNorm : state.earthZoomNorm;
}

function setActiveZoomNorm(normVal) {
    const clamped = Math.max(0.0, Math.min(1.0, normVal));
    if (state.view === 'moon') {
        state.moonZoomNorm = clamped;
    } else {
        state.earthZoomNorm = clamped;
    }
    updateZoomSignUI();
}

function getEarthCameraDistance() {
    return EARTH_DIST_MIN + state.earthZoomNorm * (EARTH_DIST_MAX - EARTH_DIST_MIN);
}

function getMoonCameraDistance() {
    return MOON_DIST_MIN + state.moonZoomNorm * (MOON_DIST_MAX - MOON_DIST_MIN);
}

function updateZoomSignUI() {
    const norm = getActiveZoomNorm();
    const thumb = document.getElementById('zoom-Drag-thumb');
    const altLabel = document.getElementById('zoom-alt-km');
    const badge = document.getElementById('zoom-target-badge');

    if (thumb) thumb.style.top = `${8 + norm * 84}%`;

    if (state.view === 'moon') {
        if (badge) badge.textContent = 'MOON';
        const moonAltKm = Math.round(95 + norm * norm * 8500);
        if (altLabel) altLabel.textContent = moonAltKm.toLocaleString();
        moonMat.uniforms.uMoonZoomLod.value = 1.0 - norm;
    } else {
        if (badge) badge.textContent = 'EARTH';
        const earthAltKm = Math.round(280 + norm * norm * 24500);
        if (altLabel) altLabel.textContent = earthAltKm.toLocaleString();
        earthMat.uniforms.uZoomLod.value = Math.max(0.0, 1.0 - norm * 1.45);
    }
}
updateZoomSignUI();

const zoomTrackEl = document.getElementById('zoom-ruler-track');
let isDraggingZoomSign = false;

function updateZoomFromTrackEvent(clientY) {
    const rect = zoomTrackEl.getBoundingClientRect();
    const relY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    if (state.view === 'satellite') switchAppView('globe');
    setActiveZoomNorm(relY / rect.height);
}

zoomTrackEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    isDraggingZoomSign = true;
    zoomTrackEl.setPointerCapture(e.pointerId);
    updateZoomFromTrackEvent(e.clientY);
});
zoomTrackEl.addEventListener('pointermove', (e) => {
    if (!isDraggingZoomSign) return;
    e.stopPropagation();
    updateZoomFromTrackEvent(e.clientY);
});
zoomTrackEl.addEventListener('pointerup', () => { isDraggingZoomSign = false; });

document.getElementById('btn-zoom-step-in').addEventListener('click', () => {
    if (state.view === 'satellite') switchAppView('globe');
    setActiveZoomNorm(getActiveZoomNorm() - 0.12);
});
document.getElementById('btn-zoom-step-out').addEventListener('click', () => {
    if (state.view === 'satellite') switchAppView('globe');
    setActiveZoomNorm(getActiveZoomNorm() + 0.12);
});

// View Switcher
let viewSwitchTimer = null;
function switchAppView(targetView) {
    state.view = targetView;
    if (viewSwitchTimer) {
        clearTimeout(viewSwitchTimer);
        viewSwitchTimer = null;
    }

    ['globe', 'moon', 'satellite'].forEach(v => {
        const ind = document.getElementById(`nav-ind-${v}`);
        if (ind) ind.className = `absolute bottom-0 left-0 right-0 h-[1.5px] transition-all ${targetView === v ? 'bg-cyan-400' : 'bg-transparent'}`;
    });

    const globeHud = document.getElementById('hud-globe-view');
    const satHud = document.getElementById('hud-satellite-view');
    const spaceBg = document.getElementById('space-bg');
    const zoomSign = document.getElementById('zoom-scroll-sign');
    const quickMoonLbl = document.getElementById('lbl-moon-quick-btn');
    const apaContainer = document.getElementById('apa-ref-container');
    const apaModalEl = document.getElementById('apa-reference-modal');
    const satCalloutOverlay = document.getElementById('sat-callout-overlay');

    spaceBg.classList.remove('sat-mode-bg', 'moon-mode-bg');

    if (targetView === 'satellite') {
        spaceBg.classList.add('sat-mode-bg');
        zoomSign.classList.add('hidden');
        if (apaContainer) apaContainer.classList.remove('hidden');
        if (satCalloutOverlay) satCalloutOverlay.classList.toggle('hidden', !state.activePartId);
        if (!heroSatelliteMesh) rebuildHeroSpacecraft(state.activeSatType || 'landsat9');
        heroSatelliteGroup.visible = true;
        earthSystemGroup.visible = true;
        camRig.targetFov = 35;

        globeHud.classList.add('view-hud-hidden');
        viewSwitchTimer = setTimeout(() => {
            if (state.view !== 'satellite') return;
            globeHud.classList.add('hidden');
            satHud.classList.remove('hidden');
            requestAnimationFrame(() => satHud.classList.remove('view-hud-hidden'));
        }, 220);
    } else {
        if (targetView === 'moon') {
            spaceBg.classList.add('moon-mode-bg');
            camRig.targetFov = 34;
        } else {
            camRig.targetFov = 38;
        }
        zoomSign.classList.remove('hidden');
        if (apaContainer) apaContainer.classList.add('hidden');
        if (apaModalEl) apaModalEl.classList.add('hidden');
        if (satCalloutOverlay) satCalloutOverlay.classList.add('hidden');

        earthSystemGroup.visible = true;
        if (quickMoonLbl) quickMoonLbl.textContent = targetView === 'moon' ? 'Return to Earth' : 'Focus Moon';
        document.getElementById('hero-subtitle-mode').textContent =
            targetView === 'moon' ? 'LUNAR ORBIT // REGOLITH & CRATER TELEMETRY' : 'IN LOW ORBIT // EARTH & LUNAR';

        satHud.classList.add('view-hud-hidden');
        viewSwitchTimer = setTimeout(() => {
            if (state.view === 'satellite') return;
            satHud.classList.add('hidden');
            heroSatelliteGroup.visible = false;
            globeHud.classList.remove('hidden');
            requestAnimationFrame(() => globeHud.classList.remove('view-hud-hidden'));
        }, 240);
        updateZoomSignUI();
    }
}

// Pointer & Raycaster
const activePointers = new Map();
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();

renderer.domElement.addEventListener('pointerdown', (e) => {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (state.view !== 'satellite') {
        state.autoSpin = false;
        updateSpinButtonUI();
    }
    if (activePointers.size === 1) {
        camRig.isDragging = true;
        camRig.downPointer = { x: e.clientX, y: e.clientY };
        camRig.prevPointer = { x: e.clientX, y: e.clientY };
    } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        camRig.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
});

window.addEventListener('pointermove', (e) => {
    if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (camRig.pinchStartDist > 0) {
            setActiveZoomNorm(getActiveZoomNorm() + (camRig.pinchStartDist - dist) * 0.0035);
        }
        camRig.pinchStartDist = dist;
        return;
    }

    if (!camRig.isDragging) return;
    const dx = e.clientX - camRig.prevPointer.x;
    const dy = e.clientY - camRig.prevPointer.y;
    camRig.prevPointer = { x: e.clientX, y: e.clientY };

    if (state.view === 'satellite' && heroSatelliteMesh) {
        heroSatelliteMesh.rotation.y += dx * 0.008;
        heroSatelliteMesh.rotation.x += dy * 0.008;
    } else if (state.view === 'moon') {
        const moonSensitivity = 0.003 + state.moonZoomNorm * 0.004;
        state.moonSpinY += dx * moonSensitivity;
        state.moonSpinX = Math.max(-1.2, Math.min(1.2, state.moonSpinX + dy * moonSensitivity));
        updateMoonPositionAndPhase();
    } else {
        const earthSensitivity = 0.0018 + state.earthZoomNorm * 0.0042;
        globeSpinGroup.rotation.y += dx * earthSensitivity;
        globeSpinGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeSpinGroup.rotation.x + dy * earthSensitivity));
    }
});

function clearPointer(e) {
    if (state.view === 'satellite' && heroSatelliteMesh && camRig.isDragging && activePointers.size === 1) {
        const moveDist = Math.hypot(e.clientX - camRig.downPointer.x, e.clientY - camRig.downPointer.y);
        if (moveDist < 6) {
            pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointerNdc, camera);
            const hits = raycaster.intersectObject(heroSatelliteMesh, true);
            if (hits.length > 0) {
                const clickedPartId = hits[0].object.userData.partId;
                if (clickedPartId) selectSpacecraftPart(state.activePartId === clickedPartId ? null : clickedPartId);
            } else {
                selectSpacecraftPart(null);
            }
        }
    }
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) camRig.pinchStartDist = 0;
    if (activePointers.size === 0) camRig.isDragging = false;
}
window.addEventListener('pointerup', clearPointer);
window.addEventListener('pointercancel', clearPointer);

renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (state.view === 'satellite') return;
    setActiveZoomNorm(getActiveZoomNorm() + e.deltaY * 0.00065);
}, { passive: false });

// Solar & Manila Time Updates
const btnSolarLapse = document.getElementById('btn-solar-lapse');
const btnSolarLive = document.getElementById('btn-solar-live');
const sliderSolarTime = document.getElementById('slider-solar-time');
const sliderMoonOrbit = document.getElementById('slider-moon-orbit');
const liveSyncStatusEl = document.getElementById('live-sync-status');

function updateMnlClockAndTelemetry() {
    const now = new Date();
    const mnlTimeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(now);
    const mnlDateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila', weekday: 'short', month: 'short', day: '2-digit'
    }).format(now);

    document.getElementById('mnl-live-clock').textContent = mnlTimeStr;
    document.getElementById('mnl-live-date').textContent = `${mnlDateStr.toUpperCase()} // UTC+08:00`;
    document.getElementById('nav-live-mnl').textContent = `MNL ${mnlTimeStr} (UTC+8)`;

    const sunVec = getLocalSunVector(state.solarMinutesUTC, state.solarDeclinationDeg);
    const mnlNormal = latLonToVector3(MNL_COORDS.lat, MNL_COORDS.lon, 1.0).normalize();
    const mnlSunDot = mnlNormal.dot(sunVec);
    const badge = document.getElementById('mnl-daynight-badge');
    if (mnlSunDot > 0.12) {
        badge.textContent = '☀ DAYLIGHT';
        badge.className = 'px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono-tech bg-amber-500/25 text-amber-300 border border-amber-400/40';
    } else if (mnlSunDot > -0.12) {
        badge.textContent = '◐ DUSK / DAWN';
        badge.className = 'px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono-tech bg-orange-500/25 text-orange-200 border border-orange-400/40';
    } else {
        badge.textContent = '☾ NIGHT LIGHTS';
        badge.className = 'px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono-tech bg-indigo-500/25 text-indigo-200 border border-indigo-400/40';
    }
}

function updateSolarAndLunarCycleUI() {
    const totalMins = ((Math.round(state.solarMinutesUTC) % 1440) + 1440) % 1440;
    const hh = String(Math.floor(totalMins / 60)).padStart(2, '0');
    const mm = String(totalMins % 60).padStart(2, '0');
    document.getElementById('solar-subsolar-readout').textContent = `${hh}:${mm} UTC`;

    let subLon = ((720 - totalMins) / 4.0);
    if (subLon > 180) subLon -= 360;
    if (subLon < -180) subLon += 360;
    document.getElementById('solar-lon-readout').textContent = `${Math.round(Math.abs(subLon))}° ${subLon >= 0 ? 'E' : 'W'}`;

    if (document.activeElement !== sliderSolarTime) sliderSolarTime.value = totalMins;
    if (document.activeElement !== sliderMoonOrbit) sliderMoonOrbit.value = ((state.moonOrbitDeg % 360) + 360) % 360;
    document.getElementById('moon-phase-readout').textContent = `${Math.round(((state.moonOrbitDeg % 360) + 360) % 360)}°`;

    const sunVecLocal = getLocalSunVector(totalMins, state.solarDeclinationDeg);
    earthMat.uniforms.uSunDirLocal.value.copy(sunVecLocal);
    cloudMat.uniforms.uSunDirLocal.value.copy(sunVecLocal);

    const worldSunDir = sunVecLocal.clone().applyEuler(globeSpinGroup.rotation).applyEuler(axialTiltGroup.rotation).normalize();
    mainSunLight.position.copy(worldSunDir.clone().multiplyScalar(40));
    moonMat.uniforms.uSunDirWorld.value.copy(worldSunDir);

    const moonWorldPos = new THREE.Vector3();
    moonMesh.getWorldPosition(moonWorldPos);
    const earthWorldPos = new THREE.Vector3();
    earthSystemGroup.getWorldPosition(earthWorldPos);
    const earthToMoon = moonWorldPos.sub(earthWorldPos).normalize();
    const cosPhase = earthToMoon.dot(worldSunDir);
    const illumPct = Math.round(((1 - cosPhase) * 0.5) * 100);
    const illumEl = document.getElementById('moon-illum-pct');
    if (illumEl) illumEl.textContent = `MOON ILLUM: ${illumPct}%`;

    updateMoonPositionAndPhase();
    updateMnlClockAndTelemetry();
}

function setSolarMode(mode) {
    state.solarMode = mode;
    const isLapse = mode === 'lapse';
    const isLive = mode === 'live';

    btnSolarLapse.className = `px-1.5 py-0.5 rounded transition-all ${
        isLapse ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50' : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
    }`;
    btnSolarLive.className = `px-1.5 py-0.5 rounded transition-all ${
        isLive ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50' : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
    }`;

    if (isLive) {
        const astro = computeAstronomicalSunAndMoon(new Date());
        state.solarMinutesUTC = astro.utcMinutes;
        state.solarDeclinationDeg = astro.sunDeclination;
        state.moonOrbitDeg = astro.moonOrbitDeg;
        liveSyncStatusEl.innerHTML = `<span>● LIVE UTC SUN &amp; MOON LOCKED</span><span id="moon-illum-pct"></span>`;
        liveSyncStatusEl.className = 'mt-1.5 text-[8px] font-mono-tech text-emerald-300/90 flex items-center justify-between';
        updateSolarAndLunarCycleUI();
    } else if (isLapse) {
        liveSyncStatusEl.innerHTML = `<span>⟳ 24H SOLAR + LUNAR ORBIT LAPSE</span><span id="moon-illum-pct"></span>`;
        liveSyncStatusEl.className = 'mt-1.5 text-[8px] font-mono-tech text-cyan-300/90 flex items-center justify-between';
    } else {
        liveSyncStatusEl.innerHTML = `<span>✎ MANUAL SUN / MOON SCRUBBER</span><span id="moon-illum-pct"></span>`;
        liveSyncStatusEl.className = 'mt-1.5 text-[8px] font-mono-tech text-amber-300/90 flex items-center justify-between';
    }
}

btnSolarLapse.addEventListener('click', () => setSolarMode(state.solarMode === 'lapse' ? 'manual' : 'lapse'));
btnSolarLive.addEventListener('click', () => setSolarMode('live'));

sliderSolarTime.addEventListener('input', (e) => {
    const newMins = parseFloat(e.target.value);
    const deltaMins = newMins - state.solarMinutesUTC;
    state.solarMinutesUTC = newMins;
    state.moonOrbitDeg = (state.moonOrbitDeg + (deltaMins / 1440) * 360) % 360;
    setSolarMode('manual');
    updateSolarAndLunarCycleUI();
});

sliderMoonOrbit.addEventListener('input', (e) => {
    state.moonOrbitDeg = parseFloat(e.target.value);
    setSolarMode('manual');
    updateSolarAndLunarCycleUI();
});

// UI Controls
const bottomCommandWindow = document.getElementById('bottom-command-window');
const btnOpenBottomDock = document.getElementById('btn-open-bottom-dock');
const btnMinimizeBottomDock = document.getElementById('btn-minimize-bottom-dock');
const btnCloseBottomDock = document.getElementById('btn-close-bottom-dock');

function setBottomDockOpen(isOpen) {
    state.bottomDockOpen = isOpen;
    if (isOpen) {
        btnOpenBottomDock.classList.add('hidden');
        bottomCommandWindow.classList.remove('hidden');
        requestAnimationFrame(() => bottomCommandWindow.classList.remove('dock-closed'));
    } else {
        bottomCommandWindow.classList.add('dock-closed');
        setTimeout(() => {
            if (!state.bottomDockOpen) {
                bottomCommandWindow.classList.add('hidden');
                btnOpenBottomDock.classList.remove('hidden');
            }
        }, 260);
    }
}

btnMinimizeBottomDock.addEventListener('click', () => setBottomDockOpen(false));
btnCloseBottomDock.addEventListener('click', () => setBottomDockOpen(false));
btnOpenBottomDock.addEventListener('click', () => setBottomDockOpen(true));

document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
        const v = btn.getAttribute('data-view');
        if (v) switchAppView(v);
    });
});

document.querySelectorAll('.sat-type-btn').forEach(btn => {
    btn.addEventListener('click', () => rebuildHeroSpacecraft(btn.getAttribute('data-sat-type').trim()));
});

document.getElementById('btn-learn-more-sat').addEventListener('click', () => switchAppView('satellite'));
document.getElementById('btn-sat-back-globe').addEventListener('click', () => switchAppView('globe'));
document.getElementById('btn-focus-moon-quick').addEventListener('click', () => {
    switchAppView(state.view === 'moon' ? 'globe' : 'moon');
});

document.getElementById('btn-fly-mnl').addEventListener('click', () => {
    switchAppView('globe');
    setSolarMode('manual');
    state.solarMinutesUTC = 960;
    globeSpinGroup.rotation.y = THREE.MathUtils.degToRad(-MNL_COORDS.lon - 90);
    globeSpinGroup.rotation.x = THREE.MathUtils.degToRad(MNL_COORDS.lat - 8);
    setActiveZoomNorm(0.32);
    updateSolarAndLunarCycleUI();
});

document.getElementById('btn-zoom-mnl-surface').addEventListener('click', () => {
    switchAppView('globe');
    globeSpinGroup.rotation.y = THREE.MathUtils.degToRad(-MNL_COORDS.lon - 90);
    globeSpinGroup.rotation.x = THREE.MathUtils.degToRad(MNL_COORDS.lat - 10);
    setActiveZoomNorm(0.08);
});

document.getElementById('btn-logo-home').addEventListener('click', () => {
    switchAppView('globe');
    setActiveZoomNorm(0.48);
    setSolarMode('live');
});

const cloudBtn = document.getElementById('btn-toggle-clouds');
const cloudStatusDot = document.getElementById('cloud-status-dot');
const cloudStatusLabel = document.getElementById('cloud-status-label');
cloudBtn.addEventListener('click', () => {
    state.cloudsVisible = !state.cloudsVisible;
    cloudMesh.visible = state.cloudsVisible;
    earthMat.uniforms.uCloudStrength.value = state.cloudsVisible ? state.cloudOpacity : 0.0;
    cloudStatusLabel.textContent = state.cloudsVisible ? 'ON (LIVE)' : 'HIDDEN';
    cloudStatusDot.className = `w-1.5 h-1.5 rounded-full transition-all ${state.cloudsVisible ? 'bg-cyan-300 shadow-[0_0_6px_#67e8f9]' : 'bg-white/30'}`;
    cloudBtn.className = `px-2.5 py-2 rounded-xl text-[9px] sm:text-[10px] font-mono-tech border transition-all flex flex-col items-center justify-center gap-1 ${
        state.cloudsVisible ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/40' : 'bg-white/5 hover:bg-white/10 text-white/60 border-white/10'
    }`;
});

const satToggleBtn = document.getElementById('btn-toggle-sats');
const satStatusDot = document.getElementById('sat-status-dot');
const satStatusLabel = document.getElementById('sat-status-label');
satToggleBtn.addEventListener('click', () => {
    state.satellitesVisible = !state.satellitesVisible;
    orbitsContainer.visible = state.satellitesVisible;
    satStatusLabel.textContent = `SATS: ${state.satellitesVisible ? 'ON' : 'OFF'}`;
    satStatusDot.className = `w-1.5 h-1.5 rounded-full transition-all ${state.satellitesVisible ? 'bg-cyan-300 shadow-[0_0_6px_#67e8f9]' : 'bg-white/30'}`;
    satToggleBtn.className = `px-2.5 py-2 rounded-xl text-[9px] sm:text-[10px] font-mono-tech border transition-all flex flex-col items-center justify-center gap-1 ${
        state.satellitesVisible ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/40' : 'bg-white/5 hover:bg-white/10 text-white/60 border-white/10'
    }`;
});

const spinBtn = document.getElementById('btn-toggle-spin');
const spinStatusDot = document.getElementById('spin-status-dot');
const spinStatusLabel = document.getElementById('spin-status-label');
function updateSpinButtonUI() {
    spinStatusLabel.textContent = `SPIN: ${state.autoSpin ? 'ON' : 'PAUSED'}`;
    spinStatusDot.className = `w-1.5 h-1.5 rounded-full transition-all ${state.autoSpin ? 'bg-emerald-300 shadow-[0_0_6px_#6ee7b7]' : 'bg-white/30'}`;
    spinBtn.className = `px-2.5 py-2 rounded-xl text-[9px] sm:text-[10px] font-mono-tech border transition-all flex flex-col items-center justify-center gap-1 ${
        state.autoSpin ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-white/5 text-white/70 border-white/10'
    }`;
}
spinBtn.addEventListener('click', () => {
    state.autoSpin = !state.autoSpin;
    updateSpinButtonUI();
});

const mobileHudBtn = document.getElementById('btn-mobile-hud-toggle');
const collapsibleHud = document.getElementById('hud-left-collapsible');
mobileHudBtn.addEventListener('click', () => {
    state.mobileHudMinimized = !state.mobileHudMinimized;
    collapsibleHud.classList.toggle('hidden', state.mobileHudMinimized);
    mobileHudBtn.textContent = state.mobileHudMinimized ? 'HUD: EXPAND' : 'HUD: MIN';
});

const btnResetAssembled = document.getElementById('btn-reset-assembled');
const btnExplode = document.getElementById('btn-explode-sat');

btnResetAssembled.addEventListener('click', () => {
    state.satExploded = false;
    btnExplode.textContent = '⊞ Explode All';
    selectSpacecraftPart(null);
});

btnExplode.addEventListener('click', () => {
    state.satExploded = !state.satExploded;
    if (state.satExploded) state.activePartId = null;
    btnExplode.textContent = state.satExploded ? '⊞ Exploded: ON' : '⊞ Explode All';
    selectSpacecraftPart(state.activePartId);
});

document.getElementById('btn-cycle-sat-angle').addEventListener('click', () => {
    state.satInspectAngleOffset += Math.PI / 3;
    if (heroSatelliteMesh) heroSatelliteMesh.rotation.y = HERO_SAT_BASE_ROT.y + state.satInspectAngleOffset;
});

const apaModal = document.getElementById('apa-reference-modal');
document.getElementById('btn-open-apa-refs').addEventListener('click', () => apaModal.classList.toggle('hidden'));
document.getElementById('btn-close-apa-refs').addEventListener('click', () => apaModal.classList.add('hidden'));
document.querySelectorAll('.btn-apa-inspect').forEach(btn => {
    btn.addEventListener('click', () => {
        rebuildHeroSpacecraft(btn.getAttribute('data-inspect-type'));
        switchAppView('satellite');
        apaModal.classList.add('hidden');
    });
});

// Blueprint Lightbox Modal
const bpModal = document.getElementById('blueprint-lightbox-modal');
const bpModalImg = document.getElementById('bp-modal-img');
const bpModalTitle = document.getElementById('bp-modal-title');
const bpModalSubtitle = document.getElementById('bp-modal-subtitle');
const bpModalCitation = document.getElementById('bp-modal-citation');
const bpModalDownload = document.getElementById('bp-modal-download');
const bpModalExtLink = document.getElementById('bp-modal-ext-link');

function openBlueprintModal(type) {
    const info = SPACECRAFT_CATALOG[type || state.activeSatType];
    if (!info) return;
    bpModalImg.src = info.diagramUri;
    bpModalTitle.textContent = `${info.name} — DIMENSIONED ENGINEERING BLUEPRINT`;
    bpModalSubtitle.textContent = `${info.badge} // 1:1 MATCH WITH 3D MODEL`;
    bpModalCitation.innerHTML = info.apaCitation;
    bpModalDownload.href = info.diagramUri;
    bpModalDownload.download = `${type || state.activeSatType}-nasa-blueprint.png`;
    bpModalExtLink.href = info.officialUrl;
    bpModal.classList.remove('hidden');
}

document.getElementById('btn-open-blueprint-viewer').addEventListener('click', () => openBlueprintModal(state.activeSatType));
document.getElementById('btn-close-blueprint-modal').addEventListener('click', () => bpModal.classList.add('hidden'));
bpModal.addEventListener('click', (e) => { if (e.target === bpModal) bpModal.classList.add('hidden'); });
document.querySelectorAll('.btn-apa-blueprint').forEach(btn => {
    btn.addEventListener('click', () => openBlueprintModal(btn.getAttribute('data-blueprint-type')));
});

// Settings Popover
const settingsPopover = document.getElementById('tilt-settings-popover');
document.getElementById('btn-toggle-settings').addEventListener('click', () => settingsPopover.classList.toggle('hidden'));
document.getElementById('btn-close-settings').addEventListener('click', () => settingsPopover.classList.add('hidden'));

const sliderTiltZ = document.getElementById('slider-tilt-z');
const sliderTiltX = document.getElementById('slider-tilt-x');
const sliderCloudOp = document.getElementById('slider-cloud-opacity');
const sliderCloudSpeed = document.getElementById('slider-cloud-speed');
const lblTiltZ = document.getElementById('lbl-tilt-z');
const lblTiltX = document.getElementById('lbl-tilt-x');
const lblCloudOp = document.getElementById('lbl-cloud-opacity');
const lblCloudSpeed = document.getElementById('lbl-cloud-speed');

sliderTiltZ.addEventListener('input', (e) => {
    state.axialTiltZDeg = parseFloat(e.target.value);
    lblTiltZ.textContent = `${state.axialTiltZDeg >= 0 ? '+' : ''}${state.axialTiltZDeg.toFixed(1)}°`;
    applyAxialTilt();
});
sliderTiltX.addEventListener('input', (e) => {
    state.axialTiltXDeg = parseFloat(e.target.value);
    lblTiltX.textContent = `${state.axialTiltXDeg >= 0 ? '+' : ''}${state.axialTiltXDeg.toFixed(1)}°`;
    applyAxialTilt();
});
sliderCloudOp.addEventListener('input', (e) => {
    state.cloudOpacity = parseFloat(e.target.value);
    lblCloudOp.textContent = `${Math.round(state.cloudOpacity * 100)}%`;
    cloudMat.uniforms.uCloudOpacity.value = state.cloudOpacity;
    if (state.cloudsVisible) earthMat.uniforms.uCloudStrength.value = state.cloudOpacity;
});
sliderCloudSpeed.addEventListener('input', (e) => {
    state.cloudSpeedMultiplier = parseFloat(e.target.value);
    lblCloudSpeed.textContent = `${state.cloudSpeedMultiplier.toFixed(1)}×`;
});

document.getElementById('btn-preset-video').addEventListener('click', () => {
    state.axialTiltZDeg = -6.0; state.axialTiltXDeg = 14.0;
    sliderTiltZ.value = -6; sliderTiltX.value = 14;
    lblTiltZ.textContent = '-6.0°'; lblTiltX.textContent = '+14.0°';
    applyAxialTilt();
});
document.getElementById('btn-preset-upright').addEventListener('click', () => {
    state.axialTiltZDeg = 0.0; state.axialTiltXDeg = 0.0;
    sliderTiltZ.value = 0; sliderTiltX.value = 0;
    lblTiltZ.textContent = '0.0°'; lblTiltX.textContent = '0.0°';
    applyAxialTilt();
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const leaderLineEl = document.getElementById('sat-leader-line');
const leaderDotEl = document.getElementById('sat-leader-dot');
const leaderRingEl = document.getElementById('sat-leader-ring');
const leaderTagEl = document.getElementById('sat-leader-tag');

function updateSatelliteCalloutReticle(elapsed) {
    if (state.view !== 'satellite' || !state.activePartId || !heroSatelliteMesh || !heroSatelliteMesh.userData.partGroups) return;
    const activeGrp = heroSatelliteMesh.userData.partGroups[state.activePartId];
    if (!activeGrp) return;

    const box = new THREE.Box3().setFromObject(activeGrp);
    const worldCenter = new THREE.Vector3();
    box.getCenter(worldCenter);

    const projected = worldCenter.clone().project(camera);
    const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    const dirX = sx >= window.innerWidth * 0.5 ? 1 : -1;
    const elbowX = sx + dirX * 42;
    const elbowY = sy - 32;
    const endX = elbowX + dirX * 28;
    const endY = elbowY;

    leaderLineEl.setAttribute('points', `${sx},${sy} ${elbowX},${elbowY} ${endX},${endY}`);
    leaderDotEl.setAttribute('cx', sx);
    leaderDotEl.setAttribute('cy', sy);
    leaderRingEl.setAttribute('cx', sx);
    leaderRingEl.setAttribute('cy', sy);
    leaderRingEl.setAttribute('r', (8 + Math.sin(elapsed * 5.0) * 2.5).toFixed(1));

    const clampedX = Math.max(16, Math.min(window.innerWidth - 220, dirX > 0 ? endX + 6 : endX - 210));
    const clampedY = Math.max(60, Math.min(window.innerHeight - 60, endY));
    leaderTagEl.style.left = `${clampedX}px`;
    leaderTagEl.style.top = `${clampedY}px`;
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();

    if (state.solarMode === 'lapse') {
        state.solarMinutesUTC = (state.solarMinutesUTC + dt * state.solarLapseSpeed) % 1440;
        state.moonOrbitDeg = (state.moonOrbitDeg + dt * 1.4) % 360;
        updateSolarAndLunarCycleUI();
    } else if (state.solarMode === 'live') {
        const astro = computeAstronomicalSunAndMoon(new Date());
        state.solarMinutesUTC = astro.utcMinutes;
        state.solarDeclinationDeg = astro.sunDeclination;
        state.moonOrbitDeg = astro.moonOrbitDeg;
        updateSolarAndLunarCycleUI();
    } else {
        updateMnlClockAndTelemetry();
    }

    if (state.cloudsVisible) {
        state.cloudWindPhase = (state.cloudWindPhase + dt * 0.0024 * state.cloudSpeedMultiplier) % 100.0;
        cloudMat.uniforms.uWindPhase.value = state.cloudWindPhase;
        earthMat.uniforms.uWindPhase.value = state.cloudWindPhase;
    }

    if (state.autoSpin && (!camRig.isDragging || state.view === 'satellite')) {
        globeSpinGroup.rotation.y += dt * 0.045;
    }

    orbitSatellites.forEach(sat => {
        sat.angle += sat.def.speed * dt;
        const r = sat.def.radius;
        sat.miniSat.position.set(Math.cos(sat.angle) * r, 0, Math.sin(sat.angle) * r);
        sat.miniSat.lookAt(Math.cos(sat.angle + 0.1) * r, 0, Math.sin(sat.angle + 0.1) * r);
    });

    const smoothDamp = 1.0 - Math.exp(-6.5 * dt);

    if (state.view === 'satellite') {
        heroSatelliteGroup.visible = true;
        earthSystemGroup.position.lerp(new THREE.Vector3(-4.2, 2.0, -29.0), smoothDamp);
        earthSystemGroup.scale.lerp(new THREE.Vector3(0.36, 0.36, 0.36), smoothDamp);

        const satY = window.innerWidth >= 768 ? 0.15 : 0.35;
        heroSatelliteGroup.position.lerp(new THREE.Vector3(0.0, satY, 3.6), smoothDamp * 1.3);
        camRig.targetLookAt.set(0.0, satY, 3.6);
        camRig.targetPos.set(0.0, satY + 0.25, 11.2);

        if (heroSatelliteMesh) {
            if (!camRig.isDragging) heroSatelliteMesh.position.y = Math.sin(elapsed * 1.3) * 0.04;
            const groups = heroSatelliteMesh.userData.partGroups;
            if (groups) {
                Object.keys(groups).forEach(k => {
                    const g = groups[k];
                    if (g.userData.targetPos) g.position.lerp(g.userData.targetPos, smoothDamp * 1.4);
                });
            }
        }
        updateSatelliteCalloutReticle(elapsed);
    } else if (state.view === 'moon') {
        earthSystemGroup.scale.lerp(new THREE.Vector3(1, 1, 1), smoothDamp);
        earthSystemGroup.position.lerp(new THREE.Vector3(0, 0, 0), smoothDamp);
        earthSystemGroup.updateMatrixWorld(true);
        const moonWorldPos = new THREE.Vector3();
        moonMesh.getWorldPosition(moonWorldPos);

        const moonCamDist = getMoonCameraDistance();
        const screenOffsetX = window.innerWidth >= 1024 ? -0.55 : 0.0;
        camRig.targetLookAt.copy(moonWorldPos);
        camRig.targetPos.set(moonWorldPos.x + screenOffsetX, moonWorldPos.y + 0.15, moonWorldPos.z + moonCamDist);
        if (state.autoSpin && !camRig.isDragging) {
            state.moonSpinY += dt * 0.12;
            updateMoonPositionAndPhase();
        }
    } else {
        const restOffset = getEarthRestOffset();
        const zoomCenterBlend = Math.max(0.0, 1.0 - state.earthZoomNorm * 1.4);
        const targetEarthPos = restOffset.clone().multiplyScalar(1.0 - zoomCenterBlend * 0.75);
        earthSystemGroup.position.lerp(targetEarthPos, smoothDamp);
        earthSystemGroup.scale.lerp(new THREE.Vector3(1, 1, 1), smoothDamp);

        camRig.targetLookAt.copy(earthSystemGroup.position);
        camRig.targetPos.set(0, 0, getEarthCameraDistance());
    }

    camera.position.lerp(camRig.targetPos, smoothDamp * 1.15);
    camRig.lookAt.lerp(camRig.targetLookAt, smoothDamp * 1.15);
    camera.lookAt(camRig.lookAt);

    if (Math.abs(camera.fov - camRig.targetFov) > 0.05) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, camRig.targetFov, smoothDamp);
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
}

globeSpinGroup.rotation.y = THREE.MathUtils.degToRad(-95 - 90);
globeSpinGroup.rotation.x = THREE.MathUtils.degToRad(6);
updateSolarAndLunarCycleUI();
animate();